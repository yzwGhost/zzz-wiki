# Proposal: Add Sync Center

## Summary

Add a dedicated sync center page that shows recent sync status, recent logs, and a manual sync entry backed by SQLite-compatible log records.

## Scope

- add sync overview and recent log bridge APIs
- record failed sync attempts into `sync_logs`
- add a sync center management page and route
- keep retry and incremental sync placeholders visible but non-automated

## Out of Scope

- schedulers
- background queues
- cron or timed sync
- true incremental sync implementation
