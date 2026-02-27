import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTasksFromProfile } from './services/taskGenerator.js';
import { calculateCompleteScoring } from './services/scoringEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeData() {
  try {
    console.log('🔄 Initializing FounderDock data...');
    
    // Read company profile
    const companyPath = path.join(__dirname, 'data/company.json');
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const companyProfile = JSON.parse(companyData);
    
    console.log(`✓ Loaded company profile: ${companyProfile.companyName}`);
    
    // Generate tasks
    const tasks = generateTasksFromProfile(companyProfile);
    console.log(`✓ Generated ${tasks.length} tasks`);
    
    // Save tasks
    const tasksPath = path.join(__dirname, 'data/tasks.json');
    await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2));
    console.log('✓ Saved tasks to tasks.json');
    
    // Calculate scores
    const scoring = calculateCompleteScoring(tasks);
    console.log('✓ Calculated scoring data');
    
    // Save scores
    const scoresPath = path.join(__dirname, 'data/scores.json');
    await fs.writeFile(scoresPath, JSON.stringify(scoring, null, 2));
    console.log('✓ Saved scores to scores.json');
    
    // Initialize task history if it doesn't exist
    const historyPath = path.join(__dirname, 'data/taskHistory.json');
    try {
      await fs.access(historyPath);
    } catch {
      await fs.writeFile(historyPath, JSON.stringify([], null, 2));
      console.log('✓ Initialized taskHistory.json');
    }
    
    console.log('\n🎉 Data initialization complete!');
    console.log(`   - ${tasks.length} tasks generated`);
    console.log(`   - Overall health score: ${scoring.healthScores.overall}%`);
    console.log(`   - Funding readiness: ${scoring.healthScores.fundingReadiness}%`);
    console.log(`   - Status: ${scoring.fundingMessage.stage}`);
    
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

initializeData();
