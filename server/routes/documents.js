import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const documentsPath = path.join(__dirname, '../data/documents.json');

// Get all documents
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(documentsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read documents data' });
  }
});

// Generate document
router.post('/generate', async (req, res) => {
  try {
    const { type, companyName } = req.body;
    
    const content = generateDocumentContent(type, companyName);
    
    const documentsData = await fs.readFile(documentsPath, 'utf-8');
    const documents = JSON.parse(documentsData);
    
    const newDocument = {
      id: `doc${Date.now()}`,
      type,
      content,
      createdAt: new Date().toISOString()
    };
    
    documents.documents.push(newDocument);
    
    await fs.writeFile(documentsPath, JSON.stringify(documents, null, 2));
    res.json({ success: true, document: newDocument });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

function generateDocumentContent(type, companyName) {
  const templates = {
    'NDA': `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}.

BETWEEN: ${companyName || '[Company Name]'} ("Disclosing Party")
AND: [Recipient Name] ("Receiving Party")

1. CONFIDENTIAL INFORMATION
The Receiving Party agrees to maintain confidentiality of all proprietary information shared by the Disclosing Party.

2. OBLIGATIONS
The Receiving Party shall:
- Not disclose confidential information to third parties
- Use information solely for the intended purpose
- Protect information with reasonable security measures

3. TERM
This agreement remains in effect for 2 years from the date of signing.

4. REMEDIES
Breach of this agreement may result in legal action and damages.

Signed: _________________
Date: ${new Date().toLocaleDateString()}`,

    'Founder Agreement': `FOUNDER AGREEMENT

This Founder Agreement is made on ${new Date().toLocaleDateString()}.

COMPANY: ${companyName || '[Company Name]'}

1. FOUNDERS
List all founding members and their roles.

2. EQUITY DISTRIBUTION
Define ownership percentages and vesting schedules.

3. ROLES AND RESPONSIBILITIES
Clearly outline each founder's duties and decision-making authority.

4. INTELLECTUAL PROPERTY
All IP created belongs to the company.

5. VESTING
Standard 4-year vesting with 1-year cliff.

6. EXIT PROVISIONS
Define terms for founder departure and buyback clauses.

7. DISPUTE RESOLUTION
Mediation and arbitration procedures.

Signed by all founders:
Date: ${new Date().toLocaleDateString()}`,

    'Loan Request': `LOAN REQUEST LETTER

Date: ${new Date().toLocaleDateString()}

To: [Bank/Lender Name]
From: ${companyName || '[Company Name]'}

Subject: Business Loan Application

Dear Sir/Madam,

We are writing to request a business loan of [Amount] for [Purpose].

COMPANY OVERVIEW:
${companyName || '[Company Name]'} is a [Industry] company focused on [Description].

LOAN PURPOSE:
- Working capital
- Equipment purchase
- Expansion

REPAYMENT PLAN:
We propose a repayment period of [X] months with monthly installments.

COLLATERAL:
[List available collateral]

We have attached all required documents including financial statements, business plan, and projections.

Thank you for considering our application.

Sincerely,
[Founder Name]
${companyName || '[Company Name]'}`,

    'Pitch Deck': `PITCH DECK OUTLINE

Company: ${companyName || '[Company Name]'}

SLIDE 1: TITLE
- Company name and tagline
- Contact information

SLIDE 2: PROBLEM
- What problem are you solving?
- Market pain points

SLIDE 3: SOLUTION
- Your product/service
- Unique value proposition

SLIDE 4: MARKET OPPORTUNITY
- Market size (TAM, SAM, SOM)
- Growth potential

SLIDE 5: BUSINESS MODEL
- Revenue streams
- Pricing strategy

SLIDE 6: TRACTION
- Key metrics
- Customer testimonials
- Revenue growth

SLIDE 7: COMPETITION
- Competitive landscape
- Your advantages

SLIDE 8: TEAM
- Founder backgrounds
- Key team members
- Advisors

SLIDE 9: FINANCIALS
- Revenue projections
- Key metrics
- Burn rate

SLIDE 10: FUNDING ASK
- Amount seeking
- Use of funds
- Milestones

SLIDE 11: CONTACT
- Thank you
- Contact details`
  };

  return templates[type] || 'Document template not found.';
}

export default router;
