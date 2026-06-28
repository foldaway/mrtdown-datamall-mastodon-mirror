# Execution Plans

Use execution plans for changes that need more than one implementation step or
touch runtime behavior, external systems, persistence, or deployment.

## Active Plans

Create active plans in `docs/exec-plans/active/` using this naming pattern:

```text
YYYY-MM-DD-short-title.md
```

## Template

```md
# Title

## Goal

What user-visible or operator-visible outcome this plan delivers.

## Context

Relevant architecture, current behavior, and constraints.

## Steps

- [ ] Step with a concrete verification point.

## Validation

Commands, manual checks, fixtures, or production checks required.

## Rollback

How to revert safely if the change misbehaves.
```

Move completed plans to `docs/exec-plans/completed/`.
