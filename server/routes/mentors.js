import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const mentorsPath = path.join(__dirname, '../data/mentors.json');
const sessionsPath = path.join(__dirname, '../data/sessions.json');

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(mentorsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read mentors data' });
  }
});

// Book a session
router.post('/book', async (req, res) => {
  try {
    const { mentorId, date, topic } = req.body;
    
    const sessionsData = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(sessionsData);
    
    const newSession = {
      id: `s${Date.now()}`,
      mentorId,
      date,
      topic,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    sessions.mentorSessions.push(newSession);
    
    await fs.writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
    res.json({ success: true, session: newSession });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book session' });
  }
});

// Get booked sessions
router.get('/sessions', async (req, res) => {
  try {
    const data = await fs.readFile(sessionsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read sessions data' });
  }
});

export default router;
