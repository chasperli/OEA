# Mistral Vibe Skills for OEA

This directory contains skill definitions for Mistral Vibe that extend the functionality of the OEA project.

## Available Skills

### 1. oea-penpot

**Purpose**: Integration with Penpot for UI mockup generation and management

**Location**: `oea-penpot.md`

**Features**:
- Automatic screen creation from use cases
- Screen updates and synchronization
- Design system management
- Batch operations for screen export

**Usage**:
```bash
# Direct activation
vibe use oea-penpot --action create-screen --uc UC-01 --name "Login Screen"

# Natural language
"Erstelle einen neuen Penpot Screen für Use Case UC-01"
```

### 2. oea-requirements (planned)

**Purpose**: Requirements engineering support

**Planned Features**:
- Use case generation with templates
- Requirements tracing
- Consistency validation
- Impact analysis

### 3. oea-architecture (planned)

**Purpose**: Architecture decision support

**Planned Features**:
- ADR generation and management
- Concept documentation
- Decision tracking
- Architecture validation

### 4. oea-validation (planned)

**Purpose**: Quality assurance

**Planned Features**:
- Link validation
- Markdown linting
- Traceability checks
- Documentation completeness

## Skill Development

### Creating a New Skill

1. **Create skill definition**: Add a new `.md` file in this directory
2. **Define capabilities**: Document triggers, actions, and parameters
3. **Implement scripts**: Add supporting scripts in `scripts/` directory
4. **Update documentation**: Add skill to this README
5. **Test thoroughly**: Verify all functionality works as expected

### Skill Definition Template

```markdown
# Skill Name

## Overview

Brief description of what the skill does.

## Capabilities

### 1. Feature Name

**Trigger**: When this skill is activated

**Actions**:
- Action 1
- Action 2
- Action 3

**Parameters**:
- param1: description
- param2: description

## Configuration

Any required configuration or environment variables.

## Usage Examples

Show how to use the skill with concrete examples.

## Implementation Details

Technical details about how the skill works.

## Error Handling

Common issues and their solutions.
```

## Integration with Mistral Vibe

Skills are automatically discovered by Mistral Vibe when:
1. They are placed in the `.vibe/skills/` directory
2. They follow the naming convention `<skill-name>.md`
3. They have a valid skill definition format

Mistral Vibe will:
- Parse skill definitions on startup
- Make skills available through natural language commands
- Handle skill activation and parameter passing
- Manage error handling and user feedback

## Best Practices

1. **Single Responsibility**: Each skill should focus on one specific domain
2. **Clear Documentation**: Document all capabilities and usage examples
3. **Error Handling**: Provide meaningful error messages
4. **Testing**: Test skills thoroughly before production use
5. **Versioning**: Update skill versions when making breaking changes

## Future Skills

Potential skills to develop:
- `oea-documentation`: Documentation generation and management
- `oea-testing`: Test case generation and execution
- `oea-deployment`: Deployment automation
- `oea-monitoring`: System monitoring and alerting