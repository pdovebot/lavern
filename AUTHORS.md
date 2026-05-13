# Authors

Lavern is built and maintained by:

## Maintainer

**Antti Innanen** — [@AnttiHero](https://github.com/AnttiHero) · antti@wearelegit.ai

Architect and primary author. Engine, agents, orchestrator, dashboard, Clawern, marketing site, the whole thing.

## Contributors

Lavern was developed privately for several months before this open-source release. The public repository is initialized fresh on release day, so the commit history begins at v0.15.0 — but the following people contributed meaningfully to the codebase before that point, and their work is in what you're reading. Thank you all.

- **Prabesh Sharma** — [@prwshshrm](https://github.com/prwshshrm)
  Onboarding flow for non-Node users: `setup.sh`, `scripts/onboard.ts`, and tooling fixes. Local-model provider work and `local-assembler.ts` improvements.

- **ZealinBee** — [@ZealinBee](https://github.com/ZealinBee)
  Landing-page UI (`FoyerView`, `QuickStartView`), session persistence across server restarts, and an auth-removal refactor pass.

- **Roman Zinkevich** — [@RomaZinkevich](https://github.com/RomaZinkevich)
  Code review and merge work on early refactor PRs (#4–#6), plus a `EmptyState` polish and console-noise cleanup in `src/api/server.ts`.

## AI Collaboration

Substantial portions of this codebase were authored in collaboration with [Claude](https://claude.com) (Anthropic) over many months. Architectural decisions, code, and documentation were a joint effort, and the pre-release private development history carries `Co-Authored-By: Claude` trailers across hundreds of commits. The product itself is, fittingly, a multi-agent AI system — so it would be strange not to say it out loud: Lavern was built with AI, by humans steering it.

## Contributing

Future contributors land automatically through git history. If you contribute a non-trivial change and want a line in this file as well, open a PR adding yourself in alphabetical order under Contributors.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.
