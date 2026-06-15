# AGENTS.md

## OpenSpec Workflow

This project uses OpenSpec for spec-driven development.

OpenSpec files live in:

```text
openspec/
├── specs/        # Approved specifications / source of truth
├── changes/      # Proposed or in-progress changes
└── config.yaml
```

## Core Rule

Do not implement non-trivial features, refactors, migrations, or behavior changes directly.

Before changing code, first check whether an OpenSpec change is required.

A change is required for:

* New features
* Breaking changes
* Architecture changes
* Data model changes
* API behavior changes
* UI behavior changes
* Security or permission changes
* Large refactors
* Any ambiguous request that needs design clarification

Small bug fixes, comments, formatting, typo fixes, and clearly scoped maintenance tasks may be implemented directly, but the agent should still check existing specs first.

## Required Development Flow

For any OpenSpec-controlled change, follow this order:

1. Read existing context:

   * `openspec/specs/`
   * `openspec/changes/`
   * relevant source files
   * existing tests

2. Create or update a change under:

```text
openspec/changes/<change-name>/
```

3. Before implementation, prepare the planning artifacts:

   * `proposal.md`
   * `tasks.md`
   * spec delta files under `specs/`
   * `design.md` when the change is complex or architectural

4. Wait until the change is clear before editing production code.

5. Implement strictly according to `tasks.md` and the approved spec delta.

6. Update `tasks.md` as tasks are completed.

7. Run validation before finishing:

```bash
openspec validate --all
```

Use strict validation when appropriate:

```bash
openspec validate --all --strict
```

8. Run the project’s normal checks, such as:

   * tests
   * typecheck
   * lint
   * build

9. When the change is complete and validated, archive it if requested:

```bash
openspec archive <change-name>
```

## Codex Instructions

When working in Codex:

* Prefer using OpenSpec commands or skills when available.
* If OpenSpec skills are available, use them for proposal, apply, and archive workflows.
* If skills are not available, use the OpenSpec CLI directly.
* Do not skip the proposal stage for substantial changes.
* Do not implement extra features outside the approved OpenSpec scope.
* If the user request is unclear, create a proposal that states assumptions instead of guessing silently.
* If existing specs conflict with the user request, point out the conflict before implementation.

## Useful Commands

Initialize OpenSpec for Codex:

```bash
openspec init --tools codex
```

List active changes and specs:

```bash
openspec list
```

View OpenSpec dashboard:

```bash
openspec view
```

Validate all specs and changes:

```bash
openspec validate --all
```

Archive a completed change:

```bash
openspec archive <change-name>
```

Update generated OpenSpec instructions after upgrading OpenSpec:

```bash
openspec update
```

## Expected Agent Behavior

The agent should behave like this:

1. Understand the request.
2. Check existing OpenSpec specs.
3. Decide whether a new OpenSpec change is needed.
4. If needed, create the change first.
5. Review or explain the proposed plan.
6. Implement only after the plan is clear.
7. Keep code, tests, and OpenSpec tasks synchronized.
8. Validate before final response.

## Forbidden Behavior

Do not:

* Start coding a large feature without checking OpenSpec.
* Ignore existing specs.
* Modify unrelated files unnecessarily.
* Expand the scope without user approval.
* Leave `tasks.md` outdated.
* Mark a task complete without implementing and checking it.
* Archive a change before implementation and validation are complete.

## Purpose

This file is the primary entry point for any Codex agent working in this repository.

Read this file first. Do not scan the whole project unless the current task requires it.

Goals:

- reduce repeated repository-wide scanning
- reduce token usage
- preserve stable project context
- give agents a deterministic starting path

## Project Summary

This project is a desktop guide application for `Zenless Zone Zero`.

Primary stack:

- `React`
- `TypeScript`
- `Vite`
- `Ant Design`
- `Electron`
- `Python`
- `SQLite`

Product direction:

- local-first desktop guide tool
- offline-readable structured content
- Python-based data crawling and cleaning
- Electron as desktop shell and bridge layer
- React as content presentation layer

## Source Of Truth

When you need stable project context, use these files in this order:

1. `AGENTS.md`
2. `docs/TECHNICAL_PLAN.md`
3. implementation files related to the current task only

Do not infer product scope from partial code if `AGENTS.md` or `docs/TECHNICAL_PLAN.md` already answers it.

## Scan Policy

Default behavior:

1. read `AGENTS.md`
2. read only the minimal relevant files for the task
3. avoid repository-wide search unless there is no reliable local pointer

Use broad scanning only when:

- the user asks for a full review
- the task explicitly spans multiple subsystems
- file locations are genuinely unknown
- existing docs are outdated or contradicted by code

If broad scanning is needed, search narrowly first:

- use `rg` for filenames or exact symbols
- prefer targeted directory reads over full tree reads
- stop scanning once the relevant execution path is identified

## Current Repository State

At the time this file was created, the repository is in an early planning/bootstrap state.

Known existing document:

- `docs/TECHNICAL_PLAN.md`: detailed implementation plan for the project

Assume the codebase may still be incomplete or empty. Prefer scaffolding decisions that match the plan unless the user overrides them.

## Architecture Intent

The intended architecture is split into these layers:

1. `apps/web`
   React renderer app
2. `apps/desktop`
   Electron main process and preload bridge
3. `services/crawler`
   Python crawler and data processing
4. `shared`
   shared schemas, constants, and cross-layer types
5. `storage`
   SQLite database, cache, logs, and generated runtime files

If the repository has not yet been scaffolded, follow this structure unless the current task says otherwise.

## Execution Priorities

When implementing, prefer this order:

1. make the minimal runnable structure
2. keep boundaries between React, Electron, and Python clear
3. preserve future SQLite integration
4. avoid one-off demo shortcuts that block later expansion

## Boundaries

### Frontend

- use `TypeScript`
- use `React Router` for routing
- use `Ant Design` for information-dense UI
- keep service access separate from UI components
- do not couple components directly to Electron IPC names

### Electron

- enable `contextIsolation`
- keep `nodeIntegration` off unless explicitly justified
- expose a minimal whitelist through preload
- keep business logic out of renderer globals

### Python

- keep crawler code separate from Electron and frontend code
- structure crawler code into adapters, cleaners, exporters, and tasks
- prefer deterministic scripts that can run independently

### Data

- SQLite is the intended long-term source for structured runtime data
- JSON may be used for fixtures, snapshots, import/export, or bootstrap data
- local assets should be cacheable on disk

## Implementation Rules For Agents

- Before making changes, identify the smallest set of files needed.
- Do not read unrelated files just to build confidence.
- Do not rewrite architecture decisions that are already documented unless the user asks for it.
- If code and docs disagree, trust code for actual behavior and update docs if part of the task.
- When scaffolding new areas, keep names consistent with this document.

## Task Routing

Use this routing guide before searching broadly.

If the task is about UI or pages:

- start from `apps/web`

If the task is about desktop bootstrapping, IPC, filesystem access, or Python invocation:

- start from `apps/desktop`

If the task is about crawling, parsing, or data generation:

- start from `services/crawler`

If the task is about schemas, shared types, constants, or cross-layer models:

- start from `shared`

If the task is about runtime data, caches, generated files, logs, or local DB:

- start from `storage`

## Recommended First-Step Behavior

For a new task, follow this exact sequence:

1. read `AGENTS.md`
2. check whether `docs/TECHNICAL_PLAN.md` already answers product or architecture questions
3. inspect only the directories directly related to the task
4. make the change
5. verify only the affected path

## Documentation Layout

Documentation files should live under `docs/` unless there is a strong reason to keep them elsewhere.

Current canonical planning doc:

- `docs/TECHNICAL_PLAN.md`

## When To Update This File

Update `AGENTS.md` when any of these change:

- canonical directory structure
- primary tech stack
- architecture boundaries
- preferred workflow for agents
- source-of-truth document list

Do not update this file for ordinary feature work.

## Notes For Future Agents

- This repository is meant to be agent-friendly.
- Favor explicit structure over implied conventions.
- Favor low-token navigation over exploratory scanning.
- If you add a new top-level area, document it here.
