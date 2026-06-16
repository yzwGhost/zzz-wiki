## 1. Source Recon And Contract

- [x] 1.1 Confirm the miHoYo ZZZ wiki retrieval mode for agents and document whether the usable source is JSON API, static HTML, or browser-rendered extraction
- [x] 1.2 Define the real-agent field mapping from source data into the current shared `Agent` structure and source metadata snapshots

## 2. Crawler Implementation

- [x] 2.1 Add a miHoYo ZZZ wiki agent adapter under `services/crawler` with a minimal fetch path for 3 to 5 real agent samples
- [x] 2.2 Add or update cleaner and task code to save raw snapshots, processed snapshots, and standardized agent records
- [x] 2.3 Provide a runnable crawler entry for the real-agent sample ingestion task

## 3. Runtime Integration

- [x] 3.1 Connect the processed real-agent output to the current local data path with real-data-first behavior and mock fallback
- [ ] 3.2 Verify the existing Electron/service/React agent list and detail flows render the ingested real agent samples

## 4. Verification And Documentation

- [x] 4.1 Add a source note describing the first-source structure and the current ingestion path
- [x] 4.2 Validate the OpenSpec change and run the affected build or verification commands
