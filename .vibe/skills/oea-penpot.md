# OEA Penpot Integration Skill

## Overview

This skill provides integration with Penpot for UI mockup generation and management. It automates the creation, updating, and synchronization of screens with the OEA project structure.

## Capabilities

### 1. Screen Creation

**Trigger**: When a new use case is created that requires UI interaction

**Actions**:
- Creates a new screen in Penpot based on use case requirements
- Generates basic wireframe structure
- Adds screen entry to `docs/screens/SCREENS.md`
- Creates placeholder SVG in `docs/screens/`

**Parameters**:
- Use Case ID (required)
- Screen Name (derived from use case or specified)
- Platform (web/mobile - default: web)
- Priority (low/medium/high - default: medium)

### 2. Screen Update

**Trigger**: When a use case is modified or when explicitly requested

**Actions**:
- Updates corresponding Penpot screen
- Synchronizes `docs/screens/SCREENS.md`
- Regenerates SVG export if needed
- Maintains version history

**Parameters**:
- Screen ID (required)
- Update description (optional)
- Force regenerate (boolean - default: false)

### 3. Design System Sync

**Trigger**: When design system components are updated or on demand

**Actions**:
- Synchronizes OEA design system with Penpot
- Updates color palettes, typography, and components
- Validates design system consistency
- Generates design system documentation

### 4. Batch Operations

**Trigger**: Explicit command or CI/CD pipeline

**Actions**:
- Export all screens from Penpot
- Validate screen inventory against SCREENS.md
- Generate comprehensive screen documentation
- Create visual sitemaps

## Configuration

### Penpot API Setup

Required environment variables:
- `PENPOT_API_KEY`: API key for Penpot instance
- `PENPOT_URL`: Base URL of Penpot instance (e.g., https://penpot.example.com)
- `PENPOT_TEAM_ID`: Team ID for OEA project
- `PENPOT_PROJECT_ID`: Project ID for OEA screens

### Local Setup

```bash
# Install Penpot CLI
npm install -g @penpot/penpot-cli

# Configure Penpot CLI
penpot config set api-key $PENPOT_API_KEY
penpot config set url $PENPOT_URL
```

## Usage Examples

### Create a new screen for a use case

```bash
# Direct command
vibe use oea-penpot --action create-screen --uc UC-01 --name "Login Screen" --platform web

# Or through natural language
"Erstelle einen neuen Screen für Use Case UC-01 mit dem Namen 'Login Screen' für die Web-Plattform"
```

### Update an existing screen

```bash
vibe use oea-penpot --action update-screen --screen SCREEN-01 --description "Added TOTP field"
```

### Sync design system

```bash
vibe use oea-penpot --action sync-design-system
```

### Export all screens

```bash
vibe use oea-penpot --action export-all-screens --output docs/screens/
```

## Implementation Details

### Screen Naming Convention

Screens follow this naming pattern:
`SCREEN-<NNN>-<kebab-case-name>-<platform>`

Examples:
- `SCREEN-001-login-web`
- `SCREEN-002-dashboard-mobile`

### SCREENS.md Format

Each screen entry in `docs/screens/SCREENS.md` follows this format:

```markdown
| ID | Name | Plattform | UC-Bezug | Status | Priorität |
|----|------|-----------|----------|--------|-----------|
| SCREEN-001 | Login Screen | web | UC-01 | mockup | high |
```

### Penpot Scripts

Custom scripts for Penpot automation are located in `scripts/penpot/`:

- `generate-screen.js`: Creates new screens from templates
- `update-screen.js`: Updates existing screens
- `export-screens.js`: Batch export of screens
- `sync-design-system.js`: Design system synchronization

## Error Handling

### Common Issues and Solutions

1. **API Connection Failed**:
   - Verify PENPOT_URL and API key
   - Check network connectivity
   - Verify Penpot instance is running

2. **Screen Already Exists**:
   - Use update-screen action instead
   - Or specify --force flag for recreation

3. **Missing Use Case Reference**:
   - Ensure use case exists in requirements/use-cases/
   - Verify use case ID format

4. **Design System Mismatch**:
   - Run sync-design-system before screen operations
   - Check design system version compatibility

## Development

### Adding New Screen Templates

1. Create new template in Penpot
2. Export as JSON to `templates/penpot/`
3. Update template registry in `scripts/penpot/templates.js`
4. Document template usage in `docs/penpot-templates.md`

### Extending Functionality

To add new Penpot integration features:

1. Create new script in `scripts/penpot/`
2. Add corresponding action to this skill definition
3. Update VIBE.md documentation
4. Add test cases to `tests/penpot/`

## Best Practices

1. **Screen Per Use Case**: Each significant use case should have at least one corresponding screen
2. **Consistent Naming**: Follow the established naming conventions
3. **Regular Sync**: Run design system sync before major screen operations
4. **Document Changes**: Always update SCREENS.md when screens change
5. **Version Control**: Commit Penpot exports alongside code changes

## Limitations

1. **Offline Mode**: Some features require Penpot API access
2. **Complex Interactions**: Multi-step user flows may need manual adjustment
3. **Design Decisions**: Automated screens may need designer review
4. **Performance**: Large screen inventories may slow down batch operations

## Future Enhancements

- Interactive screen preview in CLI
- Automatic screen diff generation
- AI-assisted screen layout suggestions
- Integration with Figma/Adobe XD import
- Accessibility validation for screens