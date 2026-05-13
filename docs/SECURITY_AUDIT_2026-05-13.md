# Lavern Pre-Launch Security & Compliance Audit

**Date:** 2026-05-13
**Auditor:** Antti Innanen <antti@wearelegit.ai>
**Repository:** `AnttiHero/lavern` (new public repository, initialized fresh at v0.15.0)
**Predecessor:** Private development repository `AnttiHero/Marble`, archived after this audit.
**Target launch:** Week of 18 May 2026 (public OSS, Apache 2.0)

---

## 1. Methodology

- Tools: **gitleaks v8.30.1**, **git-filter-repo** (current main, ultimately not used after approach pivot), **Python 3.9.6**, manual triage via `git show`.
- Three scan passes:
  - **Baseline:** full git history of the private development repo (`--log-opts="--all"`).
  - **Working-tree:** `--no-git` mode against the staged launch-prep state.
  - **Fresh-tree verification:** post-fresh-start scan against the public-release tree.
- License & attribution: read-only confirmation against `LICENSE`, `NOTICE`, `AUTHORS.md`, `scripts/seed-knowledge-base.ts`, and `viz/public/` asset inventory.
- **Approach pivot:** the original plan called for canonicalizing author emails via `git filter-repo --mailmap` on the existing history. Mid-audit, the decision was made to instead **initialize a fresh public repository** with a single launch-state commit. Rationale: stronger launch signal, no exposure of internal development artifacts, and a cleaner remediation of an unrelated finding (see §3).

## 2. Findings — Secret Scan

### 2.1 Pre-pivot baseline (private repo full history)

- **Commits scanned:** 494 across all refs (8 local + 5 remote-tracking branches).
- **Bytes scanned:** 16.33 MB.
- **Scan time:** 2.34 s.
- **Findings:** 4, all `generic-api-key` rule.
- **True positives in committed content:** 0.

| # | Rule | File | Line | Pre-pivot SHA | Match (redacted) | Disposition | Justification |
|---|------|------|------|---------------|------------------|-------------|---------------|
| 1 | generic-api-key | `tests/integration/api-routes.test.ts` | 744 | `a5018d1c85b8` | `"password: 'REDACTED'"` | TEST_FIXTURE | Test password literal in auth-flow integration test. Entropy 3.55. |
| 2 | generic-api-key | `tests/integration/api-routes.test.ts` | 716 | `2221fa8441e7` | `"password: 'REDACTED'"` | TEST_FIXTURE | Test password literal in signup test. Entropy 3.77. |
| 3 | generic-api-key | `tests/unit/auth-cookie.test.ts`        | 40  | `9d3ccdb340d3` | `"token = 'REDACTED'"`    | TEST_FIXTURE | Test cookie-token literal in parser unit test. Entropy 4.25. |
| 4 | generic-api-key | `tests/integration/api-routes.test.ts` | 631 | `d190a020a3b4` | `"verifyPassword = 'REDACTED'"` | TEST_FIXTURE | Test password in email-verification flow test. Entropy 3.55. |

All 4 findings are silenced by the `tests/.*\.(ts|js)` path entry in [`.gitleaks.toml`](../.gitleaks.toml).

### 2.2 Working-tree scan (--no-git)

Same 4 findings at HEAD with line numbers shifted by file edits. Confirms baseline captures the current state. No additional findings introduced by the launch-prep staged changes (LICENSE flip, NOTICE rewrite, README/CONTRIBUTING/QUICKSTART upgrades, root cleanup, security audit infrastructure).

### 2.3 Fresh-tree verification (public-release tree)

After fresh-start re-initialization at `~/Desktop/lavern/`, gitleaks was re-run against the staged tree with the project's allowlist:

```
gitleaks detect --source . --config .gitleaks.toml --no-git
```

- **Bytes scanned:** 114.87 MB (working tree).
- **Scan time:** 2.35 s.
- **Findings:** 0.

The fresh repository contains the same source content as the audited private repository (minus dotfiles, build artifacts, internal state directories) and inherits the same allowlist. Zero unmasked findings.

## 3. Out-of-Scope Finding (resolved)

A GitHub Personal Access Token was discovered embedded inline in the local `.git/config` origin URL of the private development repository, in the form `https://<TOKEN>@github.com/AnttiHero/Marble.git`. This was **not** in committed content (gitleaks confirmed zero history hits), and would not have propagated to any public push — `.git/config` is local-only. However, it constituted a real credential exposure in local backups (Time Machine, cloud-synced home directory) and `git remote -v` output.

**Remediation completed:**

1. PAT revoked at https://github.com/settings/tokens.
2. Local authentication switched to SSH (`git@github.com:` remote URL form).
3. New ed25519 SSH key registered to the GitHub account; verified via `ssh -T git@github.com`.
4. Both worktree and parent-repo `.git/config` updated; no inline token remains anywhere in the local clone.

This finding motivated the approach pivot from history rewrite to fresh-start: a brand-new repository's `.git/config` is set up cleanly from day one, with no residual inline-credential artifacts.

## 4. Identity Hygiene

### 4.1 Pre-pivot author identities (private repo)

Eight distinct author identities across all refs:

| Identity | Notes |
|----------|-------|
| `Antti Innanen <antti@lavern.ai>` | Project author — primary email |
| `Antti Innanen <anttiinnanen@Anttis-MacBook-Air.local>` | Project author — local hostname leak |
| `Antti Innanen <anttiinnanen@gmail.com>` | Project author — personal Gmail |
| `Claude <noreply@anthropic.com>` | Bot co-author on AI-assisted commits |
| `Prabesh Sharma <prwshshrm@gmail.com>` | External contributor |
| `RomaZinkevich <zra1903@mail.ru>` | External contributor |
| `Roman Zinkevich <75644570+RomaZinkevich@users.noreply.github.com>` | Same person via GitHub noreply |
| `ZealinBee <thenukezealot@gmail.com>` | External contributor |

### 4.2 Post-pivot author identities (public repo)

The fresh public repository's history begins with a single commit authored as `Antti Innanen <antti@wearelegit.ai>`. The author email is set locally via `git config user.email antti@wearelegit.ai` for the public repo only.

External contributors are credited in [`AUTHORS.md`](../AUTHORS.md) by name and GitHub handle. Their personal email addresses do not appear in the public commit history.

## 5. License & Attribution Compliance

- **LICENSE.** Apache 2.0, single-author copyright "(c) 2025-2026 Antti Innanen". Verified at repo root.
- **NOTICE.** Covers:
  - 5 legal datasets (CUAD, MAUD, ACORD as CC BY 4.0; UNFAIR-ToS, LEDGAR as CC BY-SA 4.0) — verified verbatim attribution per each license.
  - 3 fonts (Inter, Cormorant Garamond, JetBrains Mono — all SIL OFL 1.1).
  - Photography (Unsplash + Pexels) — courtesy attribution; neither license requires it.
- **AUTHORS.md.** Credits Antti as maintainer plus three external contributors with GitHub handles. Acknowledges AI co-authorship with Claude (Anthropic).
- **ContractNLI** confirmed excluded. CC BY-NC-SA 4.0 incompatible with Apache 2.0 redistribution. The seeder (`scripts/seed-knowledge-base.ts`) excludes it with an in-code comment explaining the license incompatibility.
- **CC BY-SA propagation.** The seeder stores datasets verbatim with light metadata (chunking by clause type; appending deal-point answers in MAUD). No schema reshaping, no field trimming, no derivative-work creation. Share-alike obligations therefore do not propagate to Lavern's Apache 2.0 code.
- **Dependencies.** All npm deps OSI-approved per `package-lock.json` spot check (Apache-2.0, MIT, BSD predominantly; no GPL/AGPL bundled).

## 6. Supply-Chain Posture

- **Pre-commit hook.** Opt-in via `npm run protect` (gitleaks against staged changes). Documented in [CONTRIBUTING.md](../CONTRIBUTING.md). No husky devDep required.
- **CI integration.** `secrets-scan` job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) uses official `gitleaks/gitleaks-action@v2`. Runs on every PR and push to `main`. The `docker` job's `needs` array includes `secrets-scan` so a Docker image is never built off a secret-leaking commit.
- **Branch protection.** Post-launch one-time UI action: mark `secrets-scan` as a required check on `main` in GitHub branch protection settings.
- **Allowlist.** [`.gitleaks.toml`](../.gitleaks.toml) at repo root. Tight path patterns + regex stopwords. No wholesale-disabled rules.

## 7. Residual Risk

- **Local hook is opt-in.** CI is the enforced security gate. A contributor who skips the local hook gets caught at PR time. Acceptable trade-off for OSS contributor friction.
- **Image rights assumed (Unsplash/Pexels).** Not individually verified per file. If any image is later determined to require attribution it cannot grant, replacement is a content-only swap.
- **Private archive `AnttiHero/Marble`** retains the pre-fresh-start history including external contributors' personal email addresses. Repository will be set to private on launch day; access limited to maintainer. No public exposure of those emails via the new `AnttiHero/lavern` repository.
- **PAT revocation window.** The leaked PAT was valid for an unknown period before discovery (it had been the active auth method for the private repo). Risk window closes the moment it was revoked. No evidence of misuse during the exposure period; GitHub provides token-usage audit logs the maintainer can review post-launch.

## 8. Sign-off

The fresh-start repository at `AnttiHero/lavern` v0.15.0 is signed off as ready for public OSS launch. All material findings have been resolved or mitigated; the public history begins clean.

Audit completed: 2026-05-13.

— Antti Innanen, with Claude (Anthropic) as co-auditor.
