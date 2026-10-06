#!/usr/bin/env python3
"""Safely fast-forward this skill source checkout from its configured upstream."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Sequence


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "_meta" / "skill-sync.json"


@dataclass
class Snapshot:
    status: str
    root: str
    branch: str | None = None
    remote: str | None = None
    upstream: str | None = None
    local_head: str | None = None
    remote_head: str | None = None
    ahead: int | None = None
    behind: int | None = None
    commits: list[str] | None = None
    files: list[str] | None = None
    diff_stat: str | None = None
    message: str | None = None


class UpdateError(Exception):
    pass


def git(args: Sequence[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if check and result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip()
        raise UpdateError(detail or f"git {' '.join(args)} failed ({result.returncode})")
    return result


def git_output(args: Sequence[str]) -> str | None:
    result = git(args, check=False)
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def load_config() -> dict:
    try:
        config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise UpdateError(f"Cannot read {CONFIG_PATH.relative_to(ROOT)}: {exc}") from exc
    try:
        source = config["source"]
        policy = config["policy"]
        repository = source["repository"].rstrip("/").removesuffix(".git")
        remote = source["remote"]
        branch = source["branch"]
        if policy["scope"] != "source-repository-only":
            raise ValueError("policy.scope must be source-repository-only")
        if policy["updateMode"] != "fast-forward-only":
            raise ValueError("policy.updateMode must be fast-forward-only")
        if policy["requireCleanWorktree"] is not True:
            raise ValueError("policy.requireCleanWorktree must be true")
        if policy["requireUserConfirmation"] is not True:
            raise ValueError("policy.requireUserConfirmation must be true")
        validator = ROOT / policy["validateAfterUpdate"]
    except (KeyError, TypeError, ValueError) as exc:
        raise UpdateError(f"Invalid update policy in skill-sync.json: {exc}") from exc
    if validator.parent != ROOT / "scripts" or validator.name != "validate.py" or not validator.is_file():
        raise UpdateError("validateAfterUpdate must point to the existing scripts/validate.py")
    return {"repository": repository, "remote": remote, "branch": branch, "validator": validator}


def normalize_repository(url: str) -> str:
    value = url.strip().removesuffix(".git").rstrip("/")
    if value.startswith("git@"):
        value = value[4:].replace(":", "/", 1)
        return value.lower()
    for prefix in ("https://", "http://", "ssh://git@"):
        if value.startswith(prefix):
            value = value[len(prefix) :]
            break
    return value.lower()


def inspect_and_fetch(config: dict) -> Snapshot:
    root = git_output(["rev-parse", "--show-toplevel"])
    if root is None or Path(root).resolve() != ROOT.resolve():
        return Snapshot("FAILED", str(ROOT), message="Current directory is not the configured Git repository root.")

    dirty = git_output(["status", "--porcelain=v1", "--untracked-files=all"])
    if dirty is None:
        return Snapshot("FAILED", str(ROOT), message="Could not inspect Git worktree status.")
    if dirty:
        return Snapshot("DIRTY", str(ROOT), message="Tracked, staged, or untracked changes are present.")

    branch = git_output(["symbolic-ref", "--quiet", "--short", "HEAD"])
    if branch is None:
        return Snapshot("WRONG_BRANCH", str(ROOT), message="Detached HEAD is not eligible for source update.")
    if branch != config["branch"]:
        return Snapshot("WRONG_BRANCH", str(ROOT), branch=branch, message=f"Expected branch {config['branch']}.")

    remotes = git_output(["remote"])
    if remotes is None:
        return Snapshot("FAILED", str(ROOT), branch=branch, message="Could not list Git remotes.")
    if config["remote"] not in remotes.splitlines():
        return Snapshot("NO_REMOTE", str(ROOT), branch=branch, message=f"Remote {config['remote']} is not configured.")

    remote_url = git_output(["remote", "get-url", config["remote"]])
    if remote_url is None:
        return Snapshot("NO_REMOTE", str(ROOT), branch=branch, remote=config["remote"], message="Could not read configured remote URL.")
    if normalize_repository(remote_url) != normalize_repository(config["repository"]):
        return Snapshot(
            "NO_REMOTE",
            str(ROOT),
            branch=branch,
            remote=config["remote"],
            message="Configured remote URL does not match the authoritative repository in skill-sync.json.",
        )

    upstream = git_output(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"])
    if upstream is None:
        return Snapshot("NO_UPSTREAM", str(ROOT), branch=branch, remote=config["remote"], message="Current branch has no upstream.")
    expected_upstream = f"{config['remote']}/{config['branch']}"
    if upstream != expected_upstream:
        return Snapshot(
            "UPSTREAM_MISMATCH",
            str(ROOT),
            branch=branch,
            remote=config["remote"],
            upstream=upstream,
            message=f"Expected upstream {expected_upstream}.",
        )

    fetch = git(
        ["fetch", "--no-tags", config["remote"], f"{config['branch']}:refs/remotes/{config['remote']}/{config['branch']}"],
        check=False,
    )
    if fetch.returncode != 0:
        detail = fetch.stderr.strip() or fetch.stdout.strip()
        return Snapshot(
            "REMOTE_UNAVAILABLE",
            str(ROOT),
            branch=branch,
            remote=config["remote"],
            upstream=upstream,
            message=detail or "Fetch failed.",
        )

    local_head = git_output(["rev-parse", "HEAD"])
    remote_head = git_output(["rev-parse", expected_upstream])
    if local_head is None or remote_head is None:
        return Snapshot("REMOTE_UNAVAILABLE", str(ROOT), branch=branch, upstream=upstream, message="Could not resolve local or fetched commit.")

    counts = git_output(["rev-list", "--left-right", "--count", f"HEAD...{expected_upstream}"])
    if counts is None:
        return Snapshot("FAILED", str(ROOT), branch=branch, upstream=upstream, message="Could not compare local and remote history.")
    ahead, behind = (int(part) for part in counts.split())

    status = "UP_TO_DATE"
    commits: list[str] = []
    files: list[str] = []
    diff_stat = ""
    if ahead and behind:
        status = "DIVERGED"
    elif ahead:
        status = "AHEAD"
    elif behind:
        status = "BEHIND"
        commits = (git_output(["log", "--format=%h %s", f"HEAD..{expected_upstream}"]) or "").splitlines()
        files = (git_output(["diff", "--name-status", "HEAD", expected_upstream]) or "").splitlines()
        diff_stat = git_output(["diff", "--stat", "HEAD", expected_upstream]) or ""

    return Snapshot(
        status,
        str(ROOT),
        branch=branch,
        remote=config["remote"],
        upstream=upstream,
        local_head=local_head,
        remote_head=remote_head,
        ahead=ahead,
        behind=behind,
        commits=commits,
        files=files,
        diff_stat=diff_stat,
        message="Fast-forward is available only after user confirmation." if status == "BEHIND" else None,
    )


def emit(snapshot: Snapshot) -> None:
    print(json.dumps(asdict(snapshot), ensure_ascii=False, indent=2))


def run_apply(config: dict, expected_local: str, expected_remote: str) -> int:
    snapshot = inspect_and_fetch(config)
    if snapshot.status == "UP_TO_DATE":
        if snapshot.local_head != expected_local or snapshot.remote_head != expected_remote:
            snapshot.status = "FAILED"
            snapshot.message = "Local or remote commit changed since check. Re-run check and review the new diff."
            emit(snapshot)
            return 1
        emit(snapshot)
        return 0
    if snapshot.status != "BEHIND":
        emit(snapshot)
        return 1
    if snapshot.local_head != expected_local or snapshot.remote_head != expected_remote:
        snapshot.status = "FAILED"
        snapshot.message = "Local or remote commit changed since check. Re-run check and review the new diff."
        emit(snapshot)
        return 1

    if snapshot.upstream is None:
        snapshot.status = "FAILED"
        snapshot.message = "Upstream disappeared after preflight. Re-run check before updating."
        emit(snapshot)
        return 1
    merge = git(["merge", "--ff-only", "--no-edit", snapshot.upstream], check=False)
    if merge.returncode != 0:
        detail = merge.stderr.strip() or merge.stdout.strip()
        emit(Snapshot("FAILED", str(ROOT), branch=snapshot.branch, upstream=snapshot.upstream, message=detail or "Fast-forward failed."))
        return 1

    new_head = git_output(["rev-parse", "HEAD"])
    validation = subprocess.run(
        [sys.executable, str(config["validator"])],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    status = "UPDATED" if validation.returncode == 0 else "FAILED"
    validation_output = validation.stdout.strip()
    if validation.returncode != 0:
        validation_output = "Update was applied, but post-update validation failed. No automatic rollback was attempted."
        if validation.stderr.strip():
            validation_output += f"\n{validation.stderr.strip()}"
    emit(
        Snapshot(
            status,
            str(ROOT),
            branch=snapshot.branch,
            remote=snapshot.remote,
            upstream=snapshot.upstream,
            local_head=snapshot.local_head,
            remote_head=snapshot.remote_head,
            ahead=0,
            behind=0,
            message=f"{snapshot.local_head} -> {new_head}. {validation_output}",
        )
    )
    return 0 if validation.returncode == 0 else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("check", help="Fetch the configured source and report the Git state and diff.")
    apply_parser = subparsers.add_parser("apply", help="Apply a previously reviewed fast-forward update.")
    apply_parser.add_argument("--expected-local", required=True, help="Local HEAD reported by check.")
    apply_parser.add_argument("--expected-remote", required=True, help="Remote HEAD reported by check.")
    apply_parser.add_argument("--confirm", action="store_true", required=True, help="Confirm the reviewed fast-forward update.")
    args = parser.parse_args()

    try:
        config = load_config()
        if args.command == "check":
            snapshot = inspect_and_fetch(config)
            emit(snapshot)
            return 0 if snapshot.status in {"UP_TO_DATE", "BEHIND"} else 1
        return run_apply(config, args.expected_local, args.expected_remote)
    except (UpdateError, OSError) as exc:
        emit(Snapshot("FAILED", str(ROOT), message=str(exc)))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
