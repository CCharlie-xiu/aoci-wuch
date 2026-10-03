#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""github-authorize · 实现层

在项目内部完成 GitHub 授权，不依赖任何外部连接器 / MCP / 第三方库。

设计要点
--------
1. 只用 Python 标准库（urllib / http.server / secrets / hashlib），零依赖。
2. 两种流程都实现，因为「该应用所要求的流程」可能不同：
     web    —— 本地 loopback 回调服务器 + PKCE，符合 GitHub Web Flow（默认）
     device —— 无需本地端口、无需 redirect_uri，适合 CLI / headless
3. 结果以 JSON 输出到 stdout（供 AI / 脚本解析），进度信息输出到 stderr。
4. 令牌只写入本地私有目录（0600），绝不写入本仓库、绝不打印到日志。
5. AI 可以执行到「把授权入口推到用户面前」为止；
   最后的 Authorize 确认必须由用户本人完成 —— 脚本只负责等待与验证。

用法
----
  github_authorize.py config set --client-id <ID> [--scope "read:user"] [--flow web]
  github_authorize.py config show
  github_authorize.py authorize [--flow web|device] [--no-wait] [--timeout 900]
  github_authorize.py poll [--timeout 900]
  github_authorize.py status
  github_authorize.py token
  github_authorize.py logout
  github_authorize.py revoke-url
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import secrets
import socket
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

# ---------------------------------------------------------------- 常量

DEVICE_CODE_URL = "https://github.com/login/device/code"
ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"
AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
API_USER_URL = "https://api.github.com/user"
REVOKE_URL = "https://github.com/settings/connections/applications/{client_id}"

CONFIG_DIR = os.path.expanduser("~/.config/github-authorize")
CONFIG_PATH = os.path.join(CONFIG_DIR, "config.json")
TOKEN_PATH = os.path.join(CONFIG_DIR, "token.json")
PENDING_PATH = os.path.join(CONFIG_DIR, "pending.json")

DEFAULT_SCOPE = "read:user"
DEFAULT_FLOW = "web"
DEVICE_GRANT = "urn:ietf:params:oauth:grant-type:device_code"
USER_AGENT = "github-authorize-capability/1.0"
HTTP_TIMEOUT = 30


# ---------------------------------------------------------------- 输出

def log(msg: str) -> None:
    """进度信息 → stderr（不污染 stdout 的 JSON）"""
    print(msg, file=sys.stderr, flush=True)


def emit(obj: dict, code: int = 0) -> None:
    """结构化结果 → stdout"""
    print(json.dumps(obj, ensure_ascii=False, indent=2))
    sys.exit(code)


def fail(error: str, message: str, **extra) -> None:
    payload = {"status": "error", "error": error, "message": message}
    payload.update(extra)
    emit(payload, 1)


# ---------------------------------------------------------------- 存储

def _read_json(path: str):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        return None
    except Exception:
        return None


def _write_json_private(path: str, obj: dict) -> None:
    """写入 0600 私有文件，先建目录。"""
    os.makedirs(os.path.dirname(path), mode=0o700, exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2)
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)


def load_config() -> dict:
    cfg = _read_json(CONFIG_PATH) or {}
    # 环境变量优先级最高
    env_id = os.environ.get("GITHUB_CLIENT_ID")
    if env_id:
        cfg["client_id"] = env_id
    env_scope = os.environ.get("GITHUB_SCOPE")
    if env_scope:
        cfg["default_scope"] = env_scope
    return cfg


def require_client_id() -> str:
    cfg = load_config()
    cid = (cfg.get("client_id") or "").strip()
    if not cid:
        fail(
            "missing_client_id",
            "未配置 client_id。GitHub OAuth 必须先注册一个 OAuth App。",
            how_to_fix=[
                "1) 打开 https://github.com/settings/developers → New OAuth App",
                "2) 若用 device 流程：在该 App 设置里勾选 Enable Device Flow",
                "3) 若用 web 流程：Callback URL 填 http://127.0.0.1/callback",
                "4) 复制 Client ID，然后运行：",
                "   github_authorize.py config set --client-id <你的ClientID>",
                "或直接设置环境变量 GITHUB_CLIENT_ID",
            ],
        )
    return cid


def load_token() -> dict | None:
    return _read_json(TOKEN_PATH)


# ---------------------------------------------------------------- HTTP

def http_request(
    url: str,
    data: dict | None = None,
    headers: dict | None = None,
    retries: int = 3,
) -> dict:
    """HTTP 请求。HTTP 错误码是业务结果，直接返回；网络层异常重试。"""
    body = urllib.parse.urlencode(data).encode("utf-8") if data is not None else None
    last_exc: Exception | None = None

    for attempt in range(1, retries + 1):
        req = urllib.request.Request(url, data=body, method="POST" if body else "GET")
        req.add_header("Accept", "application/json")
        req.add_header("User-Agent", USER_AGENT)
        for key, val in (headers or {}).items():
            req.add_header(key, val)
        try:
            with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
                raw = resp.read().decode("utf-8", "replace")
            try:
                return json.loads(raw)
            except Exception:
                return dict(urllib.parse.parse_qsl(raw))
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8", "replace")
            try:
                parsed = json.loads(raw)
            except Exception:
                parsed = {"error": "http_error"}
            parsed.setdefault("http_status", exc.code)
            return parsed
        except Exception as exc:  # 网络层（含代理隧道）异常 → 重试
            last_exc = exc
            if attempt < retries:
                log(f"→ 网络请求失败（第 {attempt}/{retries} 次）：{exc}　重试中…")
                time.sleep(1.5 * attempt)

    return {"error": "network_error", "message": str(last_exc)}


def fetch_identity(token: str) -> dict:
    """用令牌调 /user 验证身份 —— 授权后必须做，不能凭「页面已打开」判定成功。"""
    return http_request(API_USER_URL, headers={"Authorization": f"Bearer {token}"})


def store_token(payload: dict, client_id: str, scope: str) -> dict:
    token = payload.get("access_token")
    if not token:
        fail("no_access_token", "GitHub 未返回 access_token", raw=payload)

    identity = fetch_identity(token)
    if identity.get("error") or "login" not in identity:
        fail(
            "verify_failed",
            "拿到令牌但身份验证失败，未保存。",
            api_response=identity,
        )

    record = {
        "access_token": token,
        "token_type": payload.get("token_type", "bearer"),
        "scope": payload.get("scope", scope),
        "login": identity.get("login"),
        "id": identity.get("id"),
        "client_id": client_id,
        "obtained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    for key in ("refresh_token", "expires_in", "refresh_token_expires_in"):
        if payload.get(key):
            record[key] = payload[key]
    _write_json_private(TOKEN_PATH, record)

    try:
        os.remove(PENDING_PATH)
    except FileNotFoundError:
        pass

    return {
        "status": "authorized",
        "login": record["login"],
        "id": record["id"],
        "scope": record["scope"],
        "client_id": client_id,
        "token_saved_to": TOKEN_PATH,
        "next": "令牌已就绪，可继续原任务",
    }


# ---------------------------------------------------------------- config

def cmd_config_set(args) -> None:
    cfg = _read_json(CONFIG_PATH) or {}
    if args.client_id:
        cfg["client_id"] = args.client_id.strip()
    if args.scope:
        cfg["default_scope"] = args.scope.strip()
    if args.flow:
        cfg["flow"] = args.flow
    cfg.setdefault("default_scope", DEFAULT_SCOPE)
    cfg.setdefault("flow", DEFAULT_FLOW)
    _write_json_private(CONFIG_PATH, cfg)
    emit({
        "status": "ok",
        "config_path": CONFIG_PATH,
        "client_id": cfg.get("client_id"),
        "default_scope": cfg.get("default_scope"),
        "flow": cfg.get("flow"),
    })


def cmd_config_show(args) -> None:
    cfg = load_config()
    emit({
        "status": "ok",
        "config_path": CONFIG_PATH,
        "exists": os.path.exists(CONFIG_PATH),
        "client_id": cfg.get("client_id"),
        "default_scope": cfg.get("default_scope", DEFAULT_SCOPE),
        "flow": cfg.get("flow", DEFAULT_FLOW),
        "client_id_source": "env GITHUB_CLIENT_ID" if os.environ.get("GITHUB_CLIENT_ID") else "config file",
        "token_path": TOKEN_PATH,
        "has_token": os.path.exists(TOKEN_PATH),
    })


# ---------------------------------------------------------------- device flow

def device_start(client_id: str, scope: str) -> dict:
    log("→ 向 GitHub 申请设备码…")
    resp = http_request(DEVICE_CODE_URL, {"client_id": client_id, "scope": scope})
    if resp.get("error"):
        if resp.get("error") == "device_flow_disabled":
            fail(
                "device_flow_disabled",
                "该 OAuth App 未启用 Device Flow。",
                how_to_fix=[
                    "打开 https://github.com/settings/developers → 你的 OAuth App",
                    "勾选 Enable Device Flow 并保存，然后重试。",
                ],
            )
        fail("device_code_failed", "申请设备码失败", raw=resp)
    return resp


def device_poll_once(client_id: str, device_code: str) -> dict:
    return http_request(ACCESS_TOKEN_URL, {
        "client_id": client_id,
        "device_code": device_code,
        "grant_type": DEVICE_GRANT,
    })


def cmd_authorize_device(args, client_id: str, scope: str) -> None:
    started = device_start(client_id, scope)
    pending = {
        "flow": "device",
        "client_id": client_id,
        "scope": scope,
        "device_code": started["device_code"],
        "user_code": started["user_code"],
        "verification_uri": started.get("verification_uri", "https://github.com/login/device"),
        "interval": int(started.get("interval", 5)),
        "expires_at": time.time() + int(started.get("expires_in", 900)),
    }
    _write_json_private(PENDING_PATH, pending)

    log("")
    log("┌─────────────────────────────────────────────┐")
    log(f"│  请在浏览器打开：{pending['verification_uri']}")
    log(f"│  输入设备码：    {pending['user_code']}")
    log("└─────────────────────────────────────────────┘")
    log("")

    if args.no_wait:
        emit({
            "status": "pending",
            "flow": "device",
            "user_code": pending["user_code"],
            "verification_uri": pending["verification_uri"],
            "expires_in": int(pending["expires_at"] - time.time()),
            "interval": pending["interval"],
            "client_id": client_id,
            "next": "用户完成授权后，运行：github_authorize.py poll",
            "note": "AI 可以把上面的链接与设备码推给用户；确认动作必须由用户本人完成。",
        })

    cmd_poll(args)


def cmd_poll(args) -> None:
    pending = _read_json(PENDING_PATH)
    if not pending:
        fail("no_pending", "没有进行中的授权。请先运行 authorize。")

    client_id = pending["client_id"]
    device_code = pending["device_code"]
    interval = int(pending.get("interval", 5))
    expires_at = float(pending.get("expires_at", time.time()))
    deadline = min(expires_at, time.time() + args.timeout)

    log(f"→ 开始轮询授权状态（最长 {int(deadline - time.time())} 秒，间隔 {interval} 秒）…")
    while time.time() < deadline:
        resp = device_poll_once(client_id, device_code)
        error = resp.get("error")

        if resp.get("access_token"):
            log("→ 授权成功，正在验证身份…")
            emit(store_token(resp, client_id, pending.get("scope", DEFAULT_SCOPE)))

        if error == "authorization_pending":
            time.sleep(interval)
            continue
        if error == "slow_down":
            interval += 5
            log(f"→ 服务端要求降速，间隔调整为 {interval} 秒")
            time.sleep(interval)
            continue
        if error in ("expired_token", "token_expired"):
            fail("expired", "设备码已过期，请重新运行 authorize。")
        if error == "access_denied":
            fail("access_denied", "用户取消了授权。")
        if error:
            fail("poll_failed", f"轮询失败：{error}", raw=resp)

        time.sleep(interval)

    emit({
        "status": "pending",
        "message": "仍未完成授权，超时退出。可稍后再次运行 poll。",
        "user_code": pending.get("user_code"),
        "verification_uri": pending.get("verification_uri"),
    }, 2)


# ---------------------------------------------------------------- web flow

class _CallbackHandler(BaseHTTPRequestHandler):
    result: dict = {}
    done: threading.Event = threading.Event()

    def do_GET(self):  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        params = dict(urllib.parse.parse_qsl(parsed.query))

        if parsed.path != "/callback":
            self.send_response(404)
            self.end_headers()
            return

        _CallbackHandler.result = params
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(
            "<html><body style='font-family:system-ui;padding:48px'>"
            "<h2>授权已完成</h2><p>可以关闭此页面，回到终端继续。</p>"
            "</body></html>".encode("utf-8")
        )
        _CallbackHandler.done.set()

    def log_message(self, *a):  # 静默
        return


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _pkce_pair() -> tuple[str, str]:
    verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).decode().rstrip("=")
    return verifier, challenge


def cmd_authorize_web(args, client_id: str, scope: str) -> None:
    port = _free_port()
    redirect_uri = f"http://127.0.0.1:{port}/callback"
    state = secrets.token_urlsafe(24)
    verifier, challenge = _pkce_pair()

    server = HTTPServer(("127.0.0.1", port), _CallbackHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    query = urllib.parse.urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scope,
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    })
    url = f"{AUTHORIZE_URL}?{query}"

    log(f"→ 本地回调服务器已启动：{redirect_uri}")
    log(f"→ 授权页：{url}")

    opened = False
    if not args.no_browser:
        try:
            opened = webbrowser.open(url)
        except Exception:
            opened = False

    log("→ 已尝试打开浏览器" if opened else "→ 请手动打开上面的授权页")

    if not _CallbackHandler.done.wait(timeout=args.timeout):
        server.shutdown()
        fail("timeout", "等待授权回调超时。", authorize_url=url)

    server.shutdown()
    params = _CallbackHandler.result

    if params.get("state") != state:
        fail("state_mismatch", "回调 state 不匹配，已中止（可能是 CSRF）。")
    if params.get("error"):
        fail("access_denied", f"授权被拒绝：{params.get('error')}")
    code = params.get("code")
    if not code:
        fail("no_code", "回调中没有 code。", raw=params)

    log("→ 收到授权码，正在换取访问令牌…")
    resp = http_request(ACCESS_TOKEN_URL, {
        "client_id": client_id,
        "code": code,
        "redirect_uri": redirect_uri,
        "code_verifier": verifier,
    })
    if resp.get("error"):
        fail("token_exchange_failed", "换取令牌失败", raw=resp)

    emit(store_token(resp, client_id, scope))


# ---------------------------------------------------------------- 其它命令

def cmd_authorize(args) -> None:
    client_id = require_client_id()
    cfg = load_config()
    flow = args.flow or cfg.get("flow", DEFAULT_FLOW)
    scope = args.scope or cfg.get("default_scope", DEFAULT_SCOPE)

    log(f"→ 流程：{flow}　权限范围：{scope}")
    if flow == "device":
        cmd_authorize_device(args, client_id, scope)
    elif flow == "web":
        cmd_authorize_web(args, client_id, scope)
    else:
        fail("bad_flow", f"未知流程：{flow}（可选 web / device）")


def _probe(url: str, method: str = "GET", data: dict | None = None) -> tuple[bool, str]:
    """连通性探测。拿到任何 HTTP 响应（含 4xx/5xx）都算「可达」。"""
    body = urllib.parse.urlencode(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("User-Agent", USER_AGENT)
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True, f"HTTP {resp.status}"
    except urllib.error.HTTPError as exc:
        return True, f"HTTP {exc.code}"
    except Exception as exc:
        return False, str(exc)


def cmd_doctor(args) -> None:
    """诊断：配置是否齐全、两个关键域名是否可达。"""
    checks = []

    cfg = load_config()
    cid = (cfg.get("client_id") or "").strip()
    checks.append({
        "check": "client_id",
        "ok": bool(cid),
        "detail": cid if cid else "未配置（运行 config set --client-id）",
        "required": True,
    })

    log("→ 探测 github.com（OAuth 端点所在域）…")
    oauth_ok, oauth_detail = _probe(DEVICE_CODE_URL, method="POST", data={"client_id": "probe", "scope": ""})
    checks.append({
        "check": "oauth_endpoint",
        "target": "https://github.com/login/device/code",
        "ok": oauth_ok,
        "detail": oauth_detail,
        "required": True,
    })

    log("→ 探测 api.github.com（令牌验证 / API 调用）…")
    api_ok, api_detail = _probe(API_USER_URL)
    checks.append({
        "check": "api_endpoint",
        "target": "https://api.github.com/user",
        "ok": api_ok,
        "detail": api_detail,
        "required": True,
    })

    ready = all(c["ok"] for c in checks)
    result = {
        "status": "ok" if ready else "blocked",
        "ready_to_authorize": ready,
        "checks": checks,
    }
    if not ready:
        result["message"] = (
            "存在未通过项，授权流程无法完成。"
            "若 oauth_endpoint 不可达，说明当前环境无法访问 github.com —— "
            "OAuth 的授权页、设备码、令牌交换三个端点全部位于 github.com。"
        )
    emit(result, 0 if ready else 1)


def cmd_status(args) -> None:
    token = load_token()
    if not token:
        emit({
            "status": "unauthorized",
            "message": "本地没有已保存的令牌。",
            "next": "运行 github_authorize.py authorize",
        })

    identity = fetch_identity(token["access_token"])
    if identity.get("login"):
        emit({
            "status": "authorized",
            "login": identity["login"],
            "id": identity.get("id"),
            "scope": token.get("scope"),
            "client_id": token.get("client_id"),
            "obtained_at": token.get("obtained_at"),
            "token_saved_to": TOKEN_PATH,
        })

    emit({
        "status": "invalid",
        "message": "已保存的令牌已失效（被撤销或过期）。",
        "api_response": identity,
        "next": "重新运行 github_authorize.py authorize",
    }, 1)


def cmd_token(args) -> None:
    token = load_token()
    if not token:
        fail("unauthorized", "没有已保存的令牌。")
    print(token["access_token"])


def cmd_logout(args) -> None:
    removed = []
    for path in (TOKEN_PATH, PENDING_PATH):
        if os.path.exists(path):
            os.remove(path)
            removed.append(path)
    emit({
        "status": "ok",
        "removed": removed,
        "note": "仅删除本地令牌。如需同时撤销 GitHub 侧授权，请运行 revoke-url 并手动确认。",
    })


def cmd_revoke_url(args) -> None:
    cfg = load_config()
    cid = cfg.get("client_id") or "{client_id}"
    emit({
        "status": "ok",
        "revoke_url": REVOKE_URL.format(client_id=cid),
        "note": "打开此页面可查看并撤销该 OAuth App 的授权。撤销动作由用户本人在 GitHub 上完成。",
    })


# ---------------------------------------------------------------- CLI

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="github_authorize.py",
        description="github-authorize 实现层：在项目内完成 GitHub 授权（纯标准库，无外部依赖）",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_cfg = sub.add_parser("config", help="查看 / 写入配置")
    cfg_sub = p_cfg.add_subparsers(dest="config_command", required=True)
    p_set = cfg_sub.add_parser("set", help="写入 client_id / scope / 默认流程")
    p_set.add_argument("--client-id")
    p_set.add_argument("--scope")
    p_set.add_argument("--flow", choices=["web", "device"], help="授权流程，默认 web")
    p_set.set_defaults(func=cmd_config_set)
    p_show = cfg_sub.add_parser("show", help="显示当前配置")
    p_show.set_defaults(func=cmd_config_show)

    p_auth = sub.add_parser("authorize", help="启动 GitHub 授权")
    p_auth.add_argument("--flow", choices=["web", "device"], help="授权流程，默认取配置值（web）")
    p_auth.add_argument("--scope")
    p_auth.add_argument("--no-wait", action="store_true", help="device 流程：只申请设备码，不轮询")
    p_auth.add_argument("--no-browser", action="store_true", help="web 流程：不自动打开浏览器")
    p_auth.add_argument("--timeout", type=int, default=900)
    p_auth.set_defaults(func=cmd_authorize)

    p_poll = sub.add_parser("poll", help="继续轮询未完成的 device 授权")
    p_poll.add_argument("--timeout", type=int, default=900)
    p_poll.set_defaults(func=cmd_poll)

    p_status = sub.add_parser("status", help="检查本地令牌是否有效")
    p_status.set_defaults(func=cmd_status)

    p_token = sub.add_parser("token", help="输出裸令牌（用于管道）")
    p_token.set_defaults(func=cmd_token)

    p_logout = sub.add_parser("logout", help="删除本地令牌")
    p_logout.set_defaults(func=cmd_logout)

    p_revoke = sub.add_parser("revoke-url", help="输出 GitHub 侧撤销授权页面地址")
    p_revoke.set_defaults(func=cmd_revoke_url)

    p_doctor = sub.add_parser("doctor", help="诊断配置与网络可达性")
    p_doctor.set_defaults(func=cmd_doctor)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
