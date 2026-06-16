# Desktop Chrome

## ADDED Requirements

### Requirement: Themed desktop top chrome

The desktop application SHALL avoid showing the default Electron application menu bar and SHALL theme the visible top window chrome to align with the dark application shell.

#### Scenario: Open the desktop app on Windows

- **WHEN** the user launches the desktop application
- **THEN** the default `File / Edit / View / Window / Help` menu bar is not shown
- **AND** the visible top window chrome uses colors consistent with the app theme

### Requirement: Project-consistent renderer scrollbars

The renderer SHALL style visible scrollbars to match the dark project theme instead of using the platform default light scrollbar appearance.

#### Scenario: Scroll a long page

- **WHEN** the user scrolls a long page or panel
- **THEN** the scrollbar track and thumb use the project's dark background and accent-aligned styling
