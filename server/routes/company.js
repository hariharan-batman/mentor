import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dataPath = path.join(__dirname, '../data/company.json');

// Get company profile
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read company data' });
  }
});

// Update company profile
router.post('/', async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(dataPath, JSON.stringify(companyData, null, 2));
    res.json({ success: true, data: companyData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save company data' });
  }
});

export default router;
