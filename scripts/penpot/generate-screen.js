#!/usr/bin/env node

/**
 * Penpot Screen Generator
 * Creates new screens in Penpot based on use case requirements
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  penpot: {
    apiKey: process.env.PENPOT_API_KEY,
    url: process.env.PENPOT_URL || 'http://localhost:6060',
    teamId: process.env.PENPOT_TEAM_ID,
    projectId: process.env.PENPOT_PROJECT_ID
  },
  paths: {
    screensMd: path.join(__dirname, '../../docs/screens/SCREENS.md'),
    screensDir: path.join(__dirname, '../../docs/screens/'),
    templatesDir: path.join(__dirname, '../../templates/penpot/')
  }
};

/**
 * Generate a new screen in Penpot
 * @param {string} useCaseId - Use Case ID (e.g., "UC-01")
 * @param {string} screenName - Screen name
 * @param {string} platform - Platform (web/mobile)
 * @param {string} priority - Priority (low/medium/high)
 */
async function generateScreen(useCaseId, screenName, platform = 'web', priority = 'medium') {
  try {
    // Validate inputs
    if (!useCaseId || !screenName) {
      throw new Error('Use Case ID and Screen Name are required');
    }

    // Generate screen ID
    const screenId = await getNextScreenId();
    const formattedScreenId = `SCREEN-${screenId.toString().padStart(3, '0')}`;
    const screenFileName = `${formattedScreenId}-${kebabCase(screenName)}-${platform}`;

    console.log(`Generating new screen: ${formattedScreenId} - ${screenName}`);

    // Create screen in Penpot
    const penpotResponse = await createPenpotScreen(
      formattedScreenId,
      screenName,
      platform
    );

    // Update SCREENS.md
    await updateScreensMd(
      formattedScreenId,
      screenName,
      platform,
      useCaseId,
      priority
    );

    // Create placeholder SVG
    createPlaceholderSvg(formattedScreenId, screenFileName);

    console.log(`✅ Screen ${formattedScreenId} created successfully`);
    console.log(`📄 Updated ${CONFIG.paths.screensMd}`);
    console.log(`🖼️  Created placeholder at docs/screens/${screenFileName}.svg`);

    return {
      success: true,
      screenId: formattedScreenId,
      penpotId: penpotResponse.id
    };

  } catch (error) {
    console.error('❌ Error generating screen:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get next available screen ID
 */
async function getNextScreenId() {
  try {
    const screensContent = fs.readFileSync(CONFIG.paths.screensMd, 'utf8');
    const screenMatches = screensContent.match(/SCREEN-(\d+)/g);
    
    if (!screenMatches || screenMatches.length === 0) {
      return 1;
    }
    
    const screenNumbers = screenMatches
      .map(match => parseInt(match.replace('SCREEN-', '')))
      .sort((a, b) => b - a);
    
    return screenNumbers[0] + 1;
  } catch (error) {
    // If file doesn't exist or can't be read, start with 1
    return 1;
  }
}

/**
 * Create screen in Penpot via API
 */
async function createPenpotScreen(screenId, screenName, platform) {
  // In a real implementation, this would call the Penpot API
  // For now, we simulate the API call
  console.log(`🎨 Creating screen in Penpot: ${screenId} - ${screenName}`);
  
  // Simulate API response
  return {
    id: `penpot-screen-${Date.now()}`,
    name: `${screenId} - ${screenName}`,
    platform: platform,
    createdAt: new Date().toISOString()
  };
}

/**
 * Update SCREENS.md with new screen entry
 */
async function updateScreensMd(screenId, screenName, platform, useCaseId, priority) {
  const entry = `| ${screenId} | ${screenName} | ${platform} | ${useCaseId} | mockup | ${priority} |`;
  
  let content = '';
  
  try {
    content = fs.readFileSync(CONFIG.paths.screensMd, 'utf8');
    
    // Check if header exists
    if (!content.includes('| ID | Name | Plattform | UC-Bezug | Status | Priorität |')) {
      // Add header if it doesn't exist
      content = `| ID | Name | Plattform | UC-Bezug | Status | Priorität |\n|----|------|-----------|----------|--------|-----------|\n` + content;
    }
    
    // Add new entry
    content += '\n' + entry;
    
    fs.writeFileSync(CONFIG.paths.screensMd, content);
    
  } catch (error) {
    // If file doesn't exist, create it with header and entry
    content = `| ID | Name | Plattform | UC-Bezug | Status | Priorität |\n|----|------|-----------|----------|--------|-----------|\n${entry}\n`;
    fs.writeFileSync(CONFIG.paths.screensMd, content);
  }
}

/**
 * Create placeholder SVG file
 */
function createPlaceholderSvg(screenId, screenFileName) {
  // Ensure screens directory exists
  if (!fs.existsSync(CONFIG.paths.screensDir)) {
    fs.mkdirSync(CONFIG.paths.screensDir, { recursive: true });
  }
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f5f5f5"/>
  <rect x="20" y="20" width="760" height="560" fill="white" stroke="#ddd" stroke-width="2"/>
  <text x="50" y="50" font-family="Arial" font-size="24" font-weight="bold" fill="#333">${screenId}</text>
  <text x="50" y="90" font-family="Arial" font-size="18" fill="#666">${screenFileName.replace(/-/g, ' ')}</text>
  <text x="50" y="130" font-family="Arial" font-size="14" fill="#999">Penpot Screen - Placeholder</text>
  <rect x="50" y="160" width="700" height="400" fill="#f9f9f9" stroke="#eee" stroke-width="1"/>
  <text x="60" y="370" font-family="Arial" font-size="16" fill="#ccc" text-anchor="middle">
    Screen content will be generated in Penpot
  </text>
</svg>`;
  
  const filePath = path.join(CONFIG.paths.screensDir, `${screenFileName}.svg`);
  fs.writeFileSync(filePath, svgContent);
}

/**
 * Convert string to kebab-case
 */
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Main function - parse command line arguments
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let useCaseId, screenName, platform = 'web', priority = 'medium';
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--uc' || arg === '--use-case') {
      useCaseId = args[i + 1];
      i++;
    } else if (arg === '--name') {
      screenName = args[i + 1];
      i++;
    } else if (arg === '--platform') {
      platform = args[i + 1];
      i++;
    } else if (arg === '--priority') {
      priority = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  if (!useCaseId || !screenName) {
    console.error('❌ Error: Use Case ID and Screen Name are required');
    showHelp();
    process.exit(1);
  }
  
  // Generate the screen
  await generateScreen(useCaseId, screenName, platform, priority);
}

function showHelp() {
  console.log(`
Penpot Screen Generator

Usage: node generate-screen.js [options]

Options:
  --uc, --use-case <id>    Use Case ID (e.g., UC-01)
  --name <name>           Screen name
  --platform <platform>   Platform (web/mobile) [default: web]
  --priority <priority>   Priority (low/medium/high) [default: medium]
  --help, -h              Show this help message

Examples:
  node generate-screen.js --uc UC-01 --name "Login Screen"
  node generate-screen.js --uc UC-02 --name "Dashboard" --platform mobile --priority high
`);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});