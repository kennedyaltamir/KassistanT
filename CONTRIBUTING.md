# Contributing to KassisT

## Branches

Use focused branches for changes. Do not force-push `main`.

## Commits

Use Conventional Commits. Keep each commit logically coherent.

## Tests

Add or update tests for every implemented contract or invariant. Do not use tests as proof of behavior that has not been implemented.

## Architecture changes

Requirement -> Impact Analysis -> ADR -> Version Change -> Tests.

Never change an approved protocol, domain rule, security boundary or integration contract silently.

## Security

Never commit secrets. Do not place runtime credentials in Renderer code, prompts, tests or documentation.
