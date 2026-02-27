import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import companyRouter from './routes/company.js';
import aiRouter from './routes/ai.js';
import mentorsRouter from './routes/mentors.js';
import documentsRouter from './routes/documents.js';
import tasksRouter from './routes/tasks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/company', companyRouter);
app.use('/api/ai', aiRouter);
app.use('/api/mentors', mentorsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/tasks', tasksRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FounderDock AI Server Running' });
});

app.listen(PORT, () => {
  console.log(`🚀 FounderDock AI Server running on port ${PORT}`);
});
