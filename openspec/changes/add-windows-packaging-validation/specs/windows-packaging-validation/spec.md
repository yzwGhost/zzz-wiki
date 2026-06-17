## ADDED Requirements

### Requirement: Desktop app SHALL provide a minimal Windows packaging flow
The project SHALL provide a Windows packaging command that generates a local desktop artifact for the current MVP.

#### Scenario: Build Windows package
- **WHEN** the maintainer runs the documented Windows packaging command
- **THEN** the project builds the renderer and desktop process
- **AND** generates a Windows packaging artifact in a documented output directory

### Requirement: Packaged app SHALL resolve runtime paths explicitly
The desktop application SHALL use explicit packaged-mode runtime paths for writable data and bundled resources.

#### Scenario: Run packaged application
- **WHEN** the packaged desktop app starts
- **THEN** it resolves database, logs, and config paths under Electron `userData`
- **AND** resolves bundled web and crawler resources from the packaged resource directory

### Requirement: Windows packaging validation SHALL be documented
The project SHALL include a release verification document describing packaging commands, output paths, runtime requirements, and validated features.

#### Scenario: Review packaging status
- **WHEN** a maintainer reads the release verification document
- **THEN** they can find the packaging command, artifact output location, packaged runtime path rules, and current sync limitations
