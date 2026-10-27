# AOCI-Wuch

**English** | [中文](README.zh.md)

[![Site](https://img.shields.io/badge/site-skill.wuch--ai.net-545f2a?style=flat-square)](https://skill.wuch-ai.net/)
[![Auth](https://img.shields.io/badge/subscribe-auth.html-646b75?style=flat-square)](https://skill.wuch-ai.net/auth.html)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-lightgrey?style=flat-square)](LICENSE)

**A task-first skill library for AI coding agents.**

Reusable workflows, reasoning methods, MCP setup, UI design, mobile, Excel, and video—indexed so the assistant finds a match, then reads only what it needs.

**Site → [https://skill.wuch-ai.net](https://skill.wuch-ai.net/)** · [Subscribe / auth](https://skill.wuch-ai.net/auth.html) · [Stable index](capabilities/index.md) · [Experimental index](capabilities-unstable/index.md)

## Why this library

| You get | Meaning |
| --- | --- |
| Task → catalog → one skill | No dumping every guide into context at chat start |
| Stable vs Experimental | Maturity is visible; experimental is never treated as proven |
| Free + PRO | Public skills on GitHub; subscription skills via [auth](https://skill.wuch-ai.net/auth.html) |
| Works with Cursor / similar | Install the repo as an Agent Skill, then let the agent follow `SKILL.md` |

## Install

Install this repository as a reusable Agent Skill:

```text
https://github.com/CCharlie-xiu/aoci-wuch.git
```

Or tell your assistant:

```text
Install https://github.com/CCharlie-xiu/aoci-wuch.git as a reusable Agent Skill for this AI assistant.
```

## How it works

```text
User task → Read catalog → Select a match → Load its guide → Do the work
```

The assistant should **not** load every capability body up front. Use [capabilities/index.md](capabilities/index.md) (and the experimental index when appropriate), then open only the hit.

## Capability catalog

### Stable

| Capability | Purpose |
| --- | --- |
| [GitHub App Authorization](capabilities/github-authorize/) | Run the user authorization flow for a given GitHub App |
| [Native Mobile App Setup](https://skill.wuch-ai.net/auth.html) `PRO` | Create and maintain iOS / Android apps with the mobile-template family <!-- pro:mobile-template-app --> |
| [Logic Space Enumeration](capabilities/logic-space-enumeration/) | Enumerate valid scenarios, paths, and outcomes in complex designs |
| [Excel Backend Selection](capabilities/excel-capability/) | Choose and wire file-level vs desktop Excel backends |
| [iOS App Store & TestFlight](https://skill.wuch-ai.net/auth.html) `PRO` | Ship an Xcode app to TestFlight and the App Store <!-- pro:ios-app-store-release --> |
| [DBX Database Setup](capabilities/dbx-mcp-setup/) | Discover, configure, and verify DBX MCP for database access |
| [Video Frame Extraction](capabilities/video-frame-extract/) | Extract ordered stills from video from natural-language requests |
| [Design Style Canvas](capabilities/wuch-design-canvas/) | Confirm desired effects against the wuch-ai design anchor, then ship a style Canvas |
| [UI Style Prompt Design](https://skill.wuch-ai.net/auth.html) `PRO` | Confirm style first, then generate runnable UI <!-- pro:ui-design-prompt --> |
| [Lightweight SSO Login Center](https://skill.wuch-ai.net/auth.html) `PRO` | Lightweight SSO Login Center <!-- pro:sso-login-center --> |
| [GA4 Analytics](capabilities/ga4-analytics/) | GA4 Analytics |

### Experimental

| Capability | Purpose |
| --- | --- |
| [LibTV Media Setup](capabilities-unstable/libtv-mcp-setup/) | Configure and verify LibTV Remote MCP |
| [Workers Site Auth & Abuse Control](capabilities-unstable/cf-workers-site-auth/) | GitHub OAuth / email login and rate limiting on Cloudflare Workers |

## Repository layout

```text
SKILL.md                 Agent skill entry (read this first after install)
capabilities/            Stable capabilities
capabilities-unstable/   Experimental capabilities
capabilities-retired/    Retired (reference only)
follow/                  Write / update / promote / deprecate rules
scripts/                 validate.py, release, source self-update
index.html · auth.html   Project site (GitHub Pages → skill.wuch-ai.net)
```

## Validate locally

```bash
python3 scripts/validate.py
```

## Update this source checkout

Fast-forward this clone from GitHub `main` only—does **not** update copies already installed inside AI products:

```bash
python3 scripts/update_skills.py check
python3 scripts/update_skills.py apply \
  --expected-local <local-commit-from-check> \
  --expected-remote <remote-commit-from-check> \
  --confirm
```

Details: [`follow/update-skills.md`](follow/update-skills.md).

## Links

- Site: [https://skill.wuch-ai.net](https://skill.wuch-ai.net/)
- Auth / PRO: [https://skill.wuch-ai.net/auth.html](https://skill.wuch-ai.net/auth.html)
- Repo: [https://github.com/CCharlie-xiu/aoci-wuch](https://github.com/CCharlie-xiu/aoci-wuch)
- Related product: [wuch-ai](https://github.com/CCharlie-xiu/wuch-ai) · [https://wuch-ai.net](https://wuch-ai.net)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Security: [SECURITY.md](SECURITY.md)
- Contact: [1453346832@qq.com](mailto:1453346832@qq.com) · [chouxiucheng@gmail.com](mailto:chouxiucheng@gmail.com)
- License: [LICENSE](LICENSE)

## License

All rights reserved. Personal viewing and personal use only; no redistribution of modified copies; external contributions are not accepted. See [LICENSE](LICENSE).
