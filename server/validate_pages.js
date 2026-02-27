/**
 * Page Validation Script
 * Tests all API endpoints used by each page
 */

import fs from 'fs/promises';

const API_BASE = 'http://localhost:5001/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

async function testEndpoint(name, url, requiredFields = []) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check required fields
    for (const field of requiredFields) {
      if (field.includes('.')) {
        const parts = field.split('.');
        let current = data;
        for (const part of parts) {
          if (current[part] === undefined) {
            throw new Error(`Missing field: ${field}`);
          }
          current = current[part];
        }
      } else {
        if (data[field] === undefined) {
          throw new Error(`Missing field: ${field}`);
        }
      }
    }
    
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}: ${error.message}`);
    return false;
  }
}

async function validatePages() {
  console.log(`\n${colors.cyan}════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  PAGE VALIDATION - API ENDPOINTS${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // Dashboard Page
  console.log(`${colors.yellow}Dashboard Page:${colors.reset}`);
  if (await testEndpoint('Critical Tasks', `${API_BASE}/tasks/critical`)) passed++; else failed++;
  if (await testEndpoint('Weekly Action Plan', `${API_BASE}/tasks/weekly-plan`)) passed++; else failed++;
  if (await testEndpoint('Scores', `${API_BASE}/tasks/scores`, ['healthScores', 'gaps', 'fundingMessage', 'gamification'])) passed++; else failed++;
  if (await testEndpoint('Company Profile', `${API_BASE}/company`)) passed++; else failed++;
  console.log('');

  // Funding Score Page
  console.log(`${colors.yellow}Funding Score Page:${colors.reset}`);
  if (await testEndpoint('Scores', `${API_BASE}/tasks/scores`, ['healthScores.fundingReadiness'])) passed++; else failed++;
  if (await testEndpoint('Funding Tasks', `${API_BASE}/tasks/category/fundingReadiness`)) passed++; else failed++;
  console.log('');

  // Compliance Report Page
  console.log(`${colors.yellow}Compliance Report Page:${colors.reset}`);
  if (await testEndpoint('All Tasks', `${API_BASE}/tasks`)) passed++; else failed++;
  console.log('');

  // Risk Report Page
  console.log(`${colors.yellow}Risk Report Page:${colors.reset}`);
  if (await testEndpoint('Diagnostic Data', `${API_BASE}/ai/diagnostic`, ['riskAnalysis'])) passed++; else failed++;
  console.log('');

  // Roadmap Page
  console.log(`${colors.yellow}Roadmap Page:${colors.reset}`);
  if (await testEndpoint('Diagnostic Data', `${API_BASE}/ai/diagnostic`, ['actionPlan90Days'])) passed++; else failed++;
  console.log('');

  // Documents Page
  console.log(`${colors.yellow}Documents Page:${colors.reset}`);
  if (await testEndpoint('Documents List', `${API_BASE}/documents`, ['documents'])) passed++; else failed++;
  if (await testEndpoint('Company Profile', `${API_BASE}/company`)) passed++; else failed++;
  console.log('');

  // Mentors Page
  console.log(`${colors.yellow}Mentors Page:${colors.reset}`);
  if (await testEndpoint('Mentors List', `${API_BASE}/mentors`, ['mentors'])) passed++; else failed++;
  console.log('');

  // Company Profile Page
  console.log(`${colors.yellow}Company Profile Page:${colors.reset}`);
  if (await testEndpoint('Company Data', `${API_BASE}/company`)) passed++; else failed++;
  console.log('');

  // Additional Critical Endpoints
  console.log(`${colors.yellow}System Health:${colors.reset}`);
  if (await testEndpoint('Backend Health', `${API_BASE}/health`)) passed++; else failed++;
  console.log('');

  // Summary
  console.log(`${colors.cyan}════════════════════════════════════${colors.reset}`);
  if (failed === 0) {
    console.log(`${colors.green}✓ ALL TESTS PASSED${colors.reset} (${passed}/${passed + failed})`);
  } else {
    console.log(`${colors.yellow}⚠ SOME TESTS FAILED${colors.reset} (${passed}/${passed + failed})`);
  }
  console.log(`${colors.cyan}════════════════════════════════════${colors.reset}\n`);

  // Check data quality
  console.log(`${colors.cyan}Data Quality Check:${colors.reset}`);
  try {
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasks = await tasksResponse.json();
    console.log(`${colors.green}✓${colors.reset} Tasks: ${tasks.length} total`);
    
    const scoresResponse = await fetch(`${API_BASE}/tasks/scores`);
    const scores = await scoresResponse.json();
    console.log(`${colors.green}✓${colors.reset} Overall Score: ${scores.healthScores.overall}%`);
    console.log(`${colors.green}✓${colors.reset} Funding Stage: ${scores.fundingMessage.stage}`);
    console.log(`${colors.green}✓${colors.reset} Gamification Level: ${scores.gamification.level}`);
    
    const criticalResponse = await fetch(`${API_BASE}/tasks/critical`);
    const critical = await criticalResponse.json();
    console.log(`${colors.green}✓${colors.reset} Critical Tasks: ${critical.length}`);
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Data quality check failed: ${error.message}`);
  }

  console.log('');
  return failed === 0;
}

// Run validation
validatePages().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
