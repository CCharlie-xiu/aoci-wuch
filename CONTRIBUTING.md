# Contributing

**English** | [中文](CONTRIBUTING.zh.md)

## External contributions

This repository **does not accept** external Pull Requests or drive-by Issues for new capabilities. Unsolicited PRs are closed automatically. See [LICENSE](LICENSE).

Feedback that helps (missing workflows, wrong boundaries, broken links) can be sent to **1453346832@qq.com** or **chouxiucheng@gmail.com**.

## Maintainer workflow

Capabilities are authored in the private incubator (`capabilities-pro/`), validated in real use, then released with:

```bash
python3 scripts/release_capability.py <name> --free|--pro --title "中文名" \
  [--title-en "English Name"] [--icon <lucide>] [--maturity S|M]
python3 scripts/validate.py
```

Rules live under [`follow/`](follow/): `write.md`, `update.md`, `promote.md`, `deprecate.md`, `update-skills.md`.

## Before you push (maintainers)

```bash
python3 scripts/validate.py
```

Keep `README.md` (English) and `README.zh.md` (Chinese) catalog tables in sync with `capabilities/index.md`, `capabilities-unstable/index.md`, and `index.html`. The release script updates all three surfaces.

## Security

Do not open a public Issue for vulnerabilities. See [SECURITY.md](SECURITY.md).
