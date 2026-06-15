# Proposal: Add Python Sync Bridge

## Summary

Add a minimal end-to-end sync flow so the renderer can trigger one controlled Python crawler task through preload and Electron main.

## Scope

- add one IPC sync channel with a whitelist task runner
- expose a preload sync API
- add one renderer service and one manual trigger entry
- return structured success and failure payloads

## Out of Scope

- background queues
- scheduled sync
- multi-task orchestration
- direct renderer access to system commands
