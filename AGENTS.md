# AGENTS.md

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
