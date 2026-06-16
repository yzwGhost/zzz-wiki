## ADDED Requirements

### Requirement: Catalog cards SHALL use a dedicated cover information overlay
The application SHALL present agent, weapon, and drive disc list cards with a dedicated bottom cover overlay that carries the entry type label and primary name.

#### Scenario: Render a catalog card with a cover image or poster
- **WHEN** the user opens a list page for agents, weapons, or drive discs
- **THEN** each card shows its main visual in the cover area
- **AND** the cover bottom contains a distinct information overlay with the entry label and item name

### Requirement: Catalog card body SHALL separate metadata from cover identity
The application SHALL keep cover identity information out of the card body so the body focuses on metadata, summary text, and secondary recommendations.

#### Scenario: Read card body content after cover unification
- **WHEN** the user scans a card body below the cover
- **THEN** the body does not repeat the primary title as its main heading
- **AND** the body presents supporting metadata and summary content in a stable layout
