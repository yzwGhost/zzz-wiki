# Shell Navigation

## ADDED Requirements

### Requirement: Stable global shell header

The application SHALL render the global shell header as a stable three-zone layout with a dedicated brand area, centered primary navigation, and global actions area.

#### Scenario: View the global shell header on desktop

- **WHEN** the user opens any main application page on desktop width
- **THEN** the shell shows a compact brand area on the left
- **AND** the primary navigation remains visually centered
- **AND** global search and utility actions remain grouped on the right

### Requirement: Dedicated section context bar

The application SHALL present current section context in a dedicated bar below the global header instead of embedding that context inside the brand block.

#### Scenario: Change between main sections

- **WHEN** the user navigates between home, agents, weapons, drive discs, and sync center
- **THEN** the shell shows the current section name and a short contextual description in a separate context bar
- **AND** the brand block does not stack additional section labels or subtitles
