import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  runDiagnostic, 
  chatWithAI, 
  generateMentorResponse, 
  generateDocument,
  generateTopicAdvice,
  generateRoadmap,
  generateFinancialGuidance,
  generateComplianceGuidance,
  generateMentorMatch
} from '../services/aiService.js';
import { generateComplianceReport } from '../services/complianceEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const diagnosticsPath = path.join(__dirname, '../data/diagnostics.json');
const companyPath = path.join(__dirname, '../data/company.json');
const chatPath = path.join(__dirname, '../data/chatHistory.json');
const scoresPath = path.join(__dirname, '../data/scores.json');

// Run AI diagnostic
router.post('/diagnostic', async (req, res) => {
  try {
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    // Run AI diagnostic
    const aiResults = await runDiagnostic(company);
    
    // Get scores from task-based system if they exist
    let scores = { healthScores: { overall: 0, fundingReadiness: 0 } };
    try {
      const scoresData = await fs.readFile(scoresPath, 'utf-8');
      scores = JSON.parse(scoresData);
    } catch (err) {
      console.log('No scores yet, using defaults');
    }
    
    // Combine results
    const fullDiagnostic = {
      ...aiResults,
      readinessScore: scores.healthScores.overall,
      fundingScore: scores.healthScores.fundingReadiness,
      lastRun: new Date().toISOString()
    };
    
    await fs.writeFile(diagnosticsPath, JSON.stringify(fullDiagnostic, null, 2));
    res.json({ success: true, data: fullDiagnostic });
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Failed to run diagnostic' });
  }
});

// Get diagnostic results
router.get('/diagnostic', async (req, res) => {
  try {
    const data = await fs.readFile(diagnosticsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read diagnostic data' });
  }
});

// AI Chat
router.post('/chat', async (req, res) => {
  try {
    console.log('📩 Chat request received');
    const { message } = req.body;
    console.log('💬 Message:', message);
    
    // Load company context
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    console.log('✓ Company profile loaded');
    
    // Load existing chat history
    let chatHistory = { messages: [] };
    try {
      const chatData = await fs.readFile(chatPath, 'utf-8');
      chatHistory = JSON.parse(chatData);
      console.log('✓ Chat history loaded:', chatHistory.messages.length, 'messages');
    } catch (err) {
      console.log('Starting new chat history');
    }
    
    // Get AI response with conversation history
    console.log('🤖 Calling AI service...');
    const aiResponse = await chatWithAI(message, company, chatHistory.messages);
    console.log('✅ AI response received, length:', aiResponse.length);
    
    // Save new messages to chat history
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    chatHistory.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    await fs.writeFile(chatPath, JSON.stringify(chatHistory, null, 2));
    console.log('💾 Chat history saved');
    
    console.log('📤 Sending response to client');
    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

// Get chat history
router.get('/chat', async (req, res) => {
  try {
    const data = await fs.readFile(chatPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read chat history' });
  }
});

// Get compliance report
router.get('/compliance', async (req, res) => {
  try {
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    const report = generateComplianceReport(company);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

// Generate document with AI
router.post('/generate-document', async (req, res) => {
  try {
    const { documentType } = req.body;
    
    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    // Load company context
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    // Generate document
    const document = await generateDocument(documentType, company);
    
    res.json({ success: true, document, documentType });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// Advanced mentor query (with context type)
router.post('/mentor', async (req, res) => {
  try {
    const { query, contextType = 'chat' } = req.body;
    
    // Load company context
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    // Get mentor response
    const response = await generateMentorResponse(company, query, contextType);
    
    res.json({ success: true, response, contextType });
  } catch (error) {
    console.error('Mentor query error:', error);
    res.status(500).json({ error: 'Failed to process mentor query' });
  }
});

// AI Roadmap Generation
router.post('/roadmap', async (req, res) => {
  try {
    const { ideaDescription } = req.body;
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    // Generate roadmap using mentor response with roadmap context
    const roadmapQuery = ideaDescription || 'Create a detailed startup execution roadmap for my company';
    const roadmap = await generateMentorResponse(company, roadmapQuery, 'roadmap');
    
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

// AI Mentor Advice
router.post('/mentor-advice', async (req, res) => {
  try {
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    const adviceQuery = 'Provide strategic mentor advice for my startup including top needs, recommended mentor types, focus areas, and strengths to leverage';
    const advice = await generateMentorResponse(company, adviceQuery, 'chat');
    
    res.json({ success: true, advice });
  } catch (error) {
    console.error('Mentor advice error:', error);
    res.status(500).json({ error: 'Failed to generate mentor advice' });
  }
});

// Comprehensive Roadmap Generation
router.post('/comprehensive-roadmap', async (req, res) => {
  try {
    const { ideaData } = req.body;
    
    if (!ideaData) {
      return res.status(400).json({ error: 'Idea data is required' });
    }
    
    const query = `Generate a comprehensive 15-section startup strategic roadmap for: ${JSON.stringify(ideaData)}`;
    const roadmap = await generateMentorResponse(ideaData, query, 'roadmap');
    
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Comprehensive roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate comprehensive roadmap' });
  }
});

// Topic-Specific Advice (for 14 topics)
router.post('/topic-advice', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    const advice = await generateTopicAdvice(company, topic);
    
    res.json({ success: true, topic, advice });
  } catch (error) {
    console.error('Topic advice error:', error);
    res.status(500).json({ error: 'Failed to generate topic advice' });
  }
});

// Personalized Roadmap (90 days)
router.post('/personalized-roadmap', async (req, res) => {
  try {
    const { completedTopics = [] } = req.body;
    
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    const roadmap = await generateRoadmap(company, completedTopics);
    
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Personalized roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate personalized roadmap' });
  }
});

// Financial Guidance
router.get('/financial-guidance', async (req, res) => {
  try {
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    const guidance = await generateFinancialGuidance(company);
    
    res.json({ success: true, guidance });
  } catch (error) {
    console.error('Financial guidance error:', error);
    res.status(500).json({ error: 'Failed to generate financial guidance' });
  }
});

// Compliance Guidance
router.get('/compliance-guidance', async (req, res) => {
  try {
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    const guidance = await generateComplianceGuidance(company);
    
    res.json({ success: true, guidance });
  } catch (error) {
    console.error('Compliance guidance error:', error);
    res.status(500).json({ error: 'Failed to generate compliance guidance' });
  }
});

// Mentor Matching
router.post('/mentor-match', async (req, res) => {
  try {
    const companyData = await fs.readFile(companyPath, 'utf-8');
    const company = JSON.parse(companyData);
    
    // Load available mentors
    const mentorsPath = path.join(__dirname, '../data/mentors.json');
    const mentorsData = await fs.readFile(mentorsPath, 'utf-8');
    const mentorsFile = JSON.parse(mentorsData);
    const mentors = mentorsFile.mentors || [];
    
    const matches = await generateMentorMatch(company, mentors);
    
    res.json({ success: true, matches });
  } catch (error) {
    console.error('Mentor matching error:', error);
    res.status(500).json({ error: 'Failed to match mentors' });
  }
});

export default router;
