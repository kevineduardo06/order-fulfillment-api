# CLAUDE.md

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Type-check/build: `npm run build`
- Lint: `npm run lint`

## Workflow Rules

- Do not push changes unless explicitly asked.
- Do not use `--no-verify`.
- Do not run destructive git commands such as `git reset --hard`, `git clean -fd`, force pushes, or branch deletion without confirmation.
- Keep diffs focused on the requested task.
- Prefer existing service/repository patterns before adding abstractions.
- Add or update tests for any behavior change.
- Before finishing, report the exact commands run and their results.

## Architecture Notes

- Routes handle HTTP parsing and response formatting only.
- Services own business rules.
- Repositories own persistence and data lookup.
- Money is stored as integer cents.
- Inventory rules must keep `onHand`, `reserved`, and `available` consistent.
- Cancelling an order should release reserved stock unless the order was already shipped.
- Shipping an order consumes reserved stock and reduces on-hand inventory.
