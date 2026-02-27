import express from 'express';
import cors from 'cors';
import companyRouter from '../server/routes/company.js';
import aiRouter from '../server/routes/ai.js';
import mentorsRouter from '../server/routes/mentors.js';
import documentsRouter from '../server/routes/documents.js';
import tasksRouter from '../server/routes/tasks.js';

const app = express();

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

// Export for Vercel serverless
export default app;
