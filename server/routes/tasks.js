import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTasksFromProfile, getCriticalTasks, getWeeklyActionPlan } from '../services/taskGenerator.js';
import { calculateCompleteScoring } from '../services/scoringEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const tasksPath = path.join(__dirname, '../data/tasks.json');
const scoresPath = path.join(__dirname, '../data/scores.json');
const historyPath = path.join(__dirname, '../data/taskHistory.json');

// ─── GET ALL TASKS ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(tasksPath, 'utf-8');
    const tasks = JSON.parse(data);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// ─── GET CRITICAL TASKS (TOP 5) ────────────────────────────────────
router.get('/critical', async (req, res) => {
  try {
    const data = await fs.readFile(tasksPath, 'utf-8');
    const tasks = JSON.parse(data);
    const critical = getCriticalTasks(tasks);
    res.json(critical);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get critical tasks' });
  }
});

// ─── GET WEEKLY ACTION PLAN ────────────────────────────────────
router.get('/weekly-plan', async (req, res) => {
  try {
    const data = await fs.readFile(tasksPath, 'utf-8');
    const tasks = JSON.parse(data);
    const plan = getWeeklyActionPlan(tasks);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get weekly plan' });
  }
});

// ─── GET TASKS BY CATEGORY ────────────────────────────────────
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const data = await fs.readFile(tasksPath, 'utf-8');
    const tasks = JSON.parse(data);
    const filtered = tasks.filter(t => t.category === category);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tasks by category' });
  }
});

// ─── UPDATE TASK STATUS ────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    
    const data = await fs.readFile(tasksPath, 'utf-8');
    const tasks = JSON.parse(data);
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update task
    tasks[taskIndex].status = status;
    if (status === 'completed') {
      tasks[taskIndex].completedDate = new Date().toISOString();
    }
    
    // Save tasks
    await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2));
    
    // Recalculate scores
    const scoring = calculateCompleteScoring(tasks);
    await fs.writeFile(scoresPath, JSON.stringify(scoring, null, 2));
    
    // Log to history
    try {
      const historyData = await fs.readFile(historyPath, 'utf-8');
      const history = JSON.parse(historyData);
      history.push({
        taskId,
        taskTitle: tasks[taskIndex].title,
        status,
        timestamp: new Date().toISOString(),
        scoreBefore: scoring.healthScores.overall,
        scoreAfter: scoring.healthScores.overall
      });
      await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    } catch (err) {
      console.error('Failed to log history:', err);
    }
    
    res.json({ 
      success: true, 
      task: tasks[taskIndex],
      scores: scoring.healthScores
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ─── REGENERATE TASKS BASED ON PROFILE ────────────────────────────────────
router.post('/regenerate', async (req, res) => {
  try {
    const { companyProfile } = req.body;
    
    if (!companyProfile) {
      return res.status(400).json({ error: 'Company profile required' });
    }
    
    // Generate new tasks
    const newTasks = generateTasksFromProfile(companyProfile);
    
    // Read existing tasks
    let existingTasks = [];
    try {
      const data = await fs.readFile(tasksPath, 'utf-8');
      existingTasks = JSON.parse(data);
    } catch (err) {
      // No existing tasks, that's fine
    }
    
    // Merge: keep completed tasks, add new ones
    const completedTasks = existingTasks.filter(t => t.status === 'completed');
    const completedTitles = new Set(completedTasks.map(t => t.title));
    
    // Filter out new tasks that match completed ones
    const tasksToAdd = newTasks.filter(t => !completedTitles.has(t.title));
    
    // Combine and save
    const allTasks = [...completedTasks, ...tasksToAdd];
    await fs.writeFile(tasksPath, JSON.stringify(allTasks, null, 2));
    
    // Calculate scores
    const scoring = calculateCompleteScoring(allTasks);
    await fs.writeFile(scoresPath, JSON.stringify(scoring, null, 2));
    
    res.json({ 
      success: true, 
      tasksGenerated: tasksToAdd.length,
      totalTasks: allTasks.length,
      scores: scoring.healthScores
    });
  } catch (error) {
    console.error('Error regenerating tasks:', error);
    res.status(500).json({ error: 'Failed to regenerate tasks' });
  }
});

// ─── GET CURRENT SCORES ────────────────────────────────────
router.get('/scores', async (req, res) => {
  try {
    const data = await fs.readFile(scoresPath, 'utf-8');
    const scores = JSON.parse(data);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read scores' });
  }
});

// ─── MARK TASK AS COMPLETED (convenience endpoint) ────────────────────────────────────
router.post('/:id/complete', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    
    const data = await fs.readFile(tasksPath, 'utf-8');
    const tasks = JSON.parse(data);
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks[taskIndex].status = 'completed';
    tasks[taskIndex].completedDate = new Date().toISOString();
    
    await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2));
    
    // Recalculate scores
    const scoring = calculateCompleteScoring(tasks);
    await fs.writeFile(scoresPath, JSON.stringify(scoring, null, 2));
    
    res.json({ 
      success: true, 
      task: tasks[taskIndex],
      scores: scoring.healthScores,
      gamification: scoring.gamification
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

export default router;
