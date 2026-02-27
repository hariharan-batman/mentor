import { GoogleGenerativeAI } from '@google/generative-ai';

// Use environment variable or fallback to provided key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAGXVqUxadCgzhZVQDq3ym9k9ft3gjyh10';

let genAI = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized with API key:', GEMINI_API_KEY.substring(0, 20) + '...');
} else {
  console.warn('⚠️  Gemini API key not found. Using mock responses.');
}

// Normalize company profile to handle both old and new field names
function normalizeCompanyProfile(profile) {
  return {
    // Map new field names to old ones for backward compatibility
    companyName: profile.name || profile.companyName || 'Your Company',
    name: profile.name || profile.companyName || 'Your Company',
    companyType: profile.companyType || 'Private Limited',
    industry: profile.industry || 'Technology',
    stage: profile.stage || 'Early Stage',
    fundingStatus: profile.fundingStatus || 'Bootstrapped',
    location: profile.location || 'India',
    teamSize: profile.teamSize || '1-5',
    description: profile.description || '',
    // Legacy fields for backward compatibility
    primaryGoal: profile.primaryGoal || profile.description || 'Growth',
    revenue: profile.revenue || 0,
    isRegistered: profile.isRegistered !== undefined ? profile.isRegistered : true,
    ...profile
  };
}

// Advanced Mentor System Prompt
const MENTOR_SYSTEM_PROMPT = `You are a warm, experienced startup mentor - like a trusted advisor who genuinely cares about the founder's journey. You balance being conversational and friendly with providing expert guidance when needed.

YOUR PERSONALITY:
- Conversational and approachable, not robotic
- Ask questions to understand their situation better
- Show empathy for their challenges
- Celebrate their wins, no matter how small
- Be honest but supportive
- Build rapport before diving into complex topics

YOUR EXPERTISE INCLUDES:
- Entity comparison (Sole Proprietorship, LLP, Private Limited)
- Founder equity splits and vesting schedules
- Risk analysis (Financial, Market, Legal, Operational)
- Export compliance (IEC, GST-LUT, FEMA, RCMC)
- Funding strategies and dilution management
- Cap table design and ESOP planning
- Regulatory compliance and licensing
- Business model validation

INTERACTION STYLE:
1. CASUAL GREETINGS: When someone says "hi", "hello", "hey" → Respond warmly, ask how they're doing, what's on their mind
2. CHECKING IN: Ask about their startup journey, current challenges, what they're working on
3. LIGHT QUESTIONS: For simple queries → Give brief, conversational answers and ask if they want more details
4. COMPLEX TOPICS: For detailed questions → Provide structured analysis but maintain a mentor's voice
5. FOLLOW-UP: Always ask clarifying questions or suggest next topics to explore

RESPONSE APPROACH:
- GREETING/CASUAL → Warm, friendly, ask about their day/challenges (2-3 sentences)
- SIMPLE QUESTION → Brief answer + ask if they want to dive deeper (1 paragraph)
- COMPLEX QUESTION → Detailed structured response with specific data (full analysis)

MENTOR BEHAVIOR:
- Don't dump information unless they specifically ask for detailed analysis
- Ask "What's the biggest challenge you're facing today?" rather than assuming
- Use phrases like "Tell me more about...", "How are things going with...", "What's keeping you up at night?"
- Make them feel heard and understood
- Guide the conversation naturally

CRITICAL RULES:
- BE HUMAN FIRST, EXPERT SECOND
- Listen before lecturing
- Ask before analyzing
- Engage before educating
- Build trust through conversation

When providing detailed analysis (only when appropriate):
- Include specific scores, percentages, timelines, and metrics
- Organize with clear sections and headers
- Provide risk scores and suitability ratings
- Reference specific regulations when needed
- Give brutally honest but supportive assessments`;

// Main Mentor Response Engine
export async function generateMentorResponse(companyProfile, userQuery, contextType = 'chat') {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    console.warn('⚠️  genAI not initialized, using mock response');
    return generateMockMentorResponse(companyProfile, userQuery, contextType);
  }

  try {
    console.log(`🤖 Calling Gemini AI for context: ${contextType}`);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    let prompt = '';
    
    switch (contextType) {
      case 'diagnostic':
        prompt = buildDiagnosticPrompt(companyProfile);
        break;
      case 'compliance':
        prompt = buildCompliancePrompt(companyProfile, userQuery);
        break;
      case 'funding':
        prompt = buildFundingPrompt(companyProfile, userQuery);
        break;
      case 'risk':
        prompt = buildRiskPrompt(companyProfile, userQuery);
        break;
      case 'roadmap':
        prompt = buildRoadmapPrompt(companyProfile, userQuery);
        break;
      case 'chat':
      default:
        prompt = buildChatPrompt(companyProfile, userQuery);
        break;
    }

    const result = await model.generateContent([MENTOR_SYSTEM_PROMPT, prompt]);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Gemini AI response received successfully');

    // For diagnostic, parse JSON
    if (contextType === 'diagnostic') {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('JSON parsing failed, retrying...');
          // Retry once
          const retryResult = await model.generateContent([MENTOR_SYSTEM_PROMPT, prompt]);
          const retryText = retryResult.response.text();
          const retryMatch = retryText.match(/\{[\s\S]*\}/);
          if (retryMatch) {
            return JSON.parse(retryMatch[0]);
          }
        }
      }
      return generateMockDiagnostic(companyProfile);
    }

    return text;
  } catch (error) {
    console.error('❌ Mentor Response Error:', error.message);
    console.error('Error details:', error);
    console.warn('🔄 Falling back to mock response');
    return generateMockMentorResponse(companyProfile, userQuery, contextType);
  }
}

function buildDiagnosticPrompt(companyProfile) {
  return `${MENTOR_SYSTEM_PROMPT}

TASK: Generate a comprehensive startup diagnostic report.

Company Profile:
- Company Name: ${companyProfile.companyName}
- Industry: ${companyProfile.industry}
- Stage: ${companyProfile.stage}
- Location: ${companyProfile.location}
- Revenue: $${companyProfile.revenue}
- Team Size: ${companyProfile.teamSize}
- Primary Goal: ${companyProfile.primaryGoal}
- Registered: ${companyProfile.isRegistered ? 'Yes' : 'No'}

Generate a detailed analysis covering:
1. Complete compliance checklist (10-15 items)
2. Required licenses specific to ${companyProfile.industry} in ${companyProfile.location}
3. Funding opportunities (angel, VC, grants, loans)
4. Risk analysis (legal, financial, market, cyber) - be specific
5. Readiness score (0-100) based on current stage
6. Funding score (0-100) based on investor readiness
7. Detailed 90-day action plan (6 items, each 2-week period)

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "complianceChecklist": ["item1", "item2", ...],
  "requiredLicenses": ["license1", "license2", ...],
  "fundingOpportunities": ["opportunity1", "opportunity2", ...],
  "riskAnalysis": {
    "legalRisk": "detailed assessment with risks and mitigation",
    "financialRisk": "detailed assessment with risks and mitigation",
    "marketRisk": "detailed assessment with risks and mitigation",
    "cyberRisk": "detailed assessment with risks and mitigation"
  },
  "readinessScore": 75,
  "fundingScore": 68,
  "actionPlan90Days": [
    {"week": "1-2", "action": "specific action"},
    {"week": "3-4", "action": "specific action"},
    {"week": "5-6", "action": "specific action"},
    {"week": "7-8", "action": "specific action"},
    {"week": "9-10", "action": "specific action"},
    {"week": "11-12", "action": "specific action"}
  ]
}`;
}

function buildChatPrompt(companyProfile, userQuery) {
  const queryLower = (userQuery || '').toLowerCase().trim();
  
  // Detect message type
  const isGreeting = /^(hi|hello|hey|good morning|good evening|good afternoon|greetings|yo|howdy|what's up|whats up|sup)[\s!.]*$/i.test(queryLower) ||
                    /^(hi|hello|hey)\s+(there|mate|friend|buddy)[\s!.]*$/i.test(queryLower);
  
  const isCasual = /^(how are you|how's it going|hows it going|what's up|whats up|how do you do)[\s!.?]*$/i.test(queryLower) ||
                   /^(thanks|thank you|ok|okay|cool|great|nice|got it|understood)[\s!.]*$/i.test(queryLower);
  
  const isComplexQuery = queryLower.includes('compare') || queryLower.includes('analysis') || 
                         queryLower.includes('strategy') || queryLower.includes('structure') ||
                         queryLower.includes('risk') || queryLower.includes('compliance') ||
                         queryLower.includes('entity') || queryLower.includes('cap table') ||
                         queryLower.includes('export') || queryLower.includes('funding') ||
                         queryLower.length > 200 || // Long detailed questions
                         /\b(detailed|comprehensive|complete|full|thorough)\b/i.test(queryLower);

  // GREETING/CASUAL RESPONSE
  if (isGreeting || isCasual) {
    return `STARTUP CONTEXT:
Company: ${companyProfile.companyName}
Industry: ${companyProfile.industry}
Stage: ${companyProfile.stage}
Revenue: $${companyProfile.revenue}
Team: ${companyProfile.teamSize} people
Goal: ${companyProfile.primaryGoal}

MESSAGE FROM FOUNDER:
"${userQuery}"

YOUR TASK AS A MENTOR:
This is a casual greeting or conversation starter. Respond like a warm, friendly mentor would:
- Greet them back warmly and personally
- Ask how they're doing or how things are going with their startup
- Show genuine interest in their journey
- Ask an open question like "What's on your mind today?" or "What challenges are you facing?"
- Keep it to 2-3 friendly sentences
- Don't provide any detailed analysis unless they ask for it
- Build rapport first

Example style: "Hey! Great to hear from you. How are things going with ${companyProfile.companyName}? What's the biggest challenge you're dealing with this week?"`;
  }

  // SIMPLE QUESTION RESPONSE
  if (!isComplexQuery) {
    return `STARTUP CONTEXT:
Company: ${companyProfile.companyName}
Industry: ${companyProfile.industry}
Stage: ${companyProfile.stage}
Location: ${companyProfile.location}
Revenue: $${companyProfile.revenue}
Team: ${companyProfile.teamSize} people
Goal: ${companyProfile.primaryGoal}

FOUNDER'S QUESTION:
"${userQuery}"

YOUR TASK AS A MENTOR:
This is a straightforward question. Respond conversationally:
- Answer their question briefly but helpfully (1-2 paragraphs)
- Use a friendly, mentor-like tone
- Include 1-2 key insights or tips
- Ask if they want more detailed information
- Offer to dive deeper into specific aspects
- Keep it conversational, not robotic

Example: "Great question! Here's what I'd suggest... [brief advice]. Would you like me to break down the specifics or create a detailed action plan for this?"`;
  }

  // COMPLEX ANALYSIS RESPONSE
  return `STARTUP PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company Name: ${companyProfile.companyName}
Industry: ${companyProfile.industry}
Business Stage: ${companyProfile.stage}
Location: ${companyProfile.location}
Current Revenue: $${companyProfile.revenue}
Team Size: ${companyProfile.teamSize} people
Primary Goal: ${companyProfile.primaryGoal}
Registered: ${companyProfile.isRegistered ? 'Yes' : 'No'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOUNDER'S DETAILED QUESTION:
${userQuery}

YOUR TASK AS A MENTOR:
This requires detailed, structured analysis. Provide comprehensive guidance:

REQUIRED RESPONSE FORMAT:
1. Start with a brief mentor-like acknowledgment (1-2 sentences)
2. Create clear sections with headers (use markdown formatting)
3. Include specific metrics:
   - Risk scores (X/10 format)
   - Suitability ratings (Low/Medium/High)
   - Percentages for equity, dilution, taxation
   - Specific amounts and thresholds
   - Timelines (days/weeks/months)
4. Provide comparison tables when comparing options
5. Include concrete numbers, not vague ranges
6. Add actionable "next_steps" section with specific deadlines
7. Mention specific compliance requirements and regulations
8. Include warning/caution items for key risks
9. Make it comprehensive (400-600 words minimum)
10. End with an engaging question to continue the conversation

FORMAT STRUCTURE:
- Use markdown headers (##, ###) for sections
- Create clear hierarchies with proper organization
- Include bullet points for lists
- Add bold (**text**) for emphasis
- Use specific data and metrics throughout

CRITICAL REQUIREMENTS:
✓ Maintain mentor voice - caring but expert
✓ Be specific to their industry (${companyProfile.industry}) and stage (${companyProfile.stage})
✓ Reference their location (${companyProfile.location}) for regulatory context
✓ Consider their revenue level ($${companyProfile.revenue}) for recommendations
✓ Factor in team size (${companyProfile.teamSize}) for compliance requirements
✓ Provide brutally honest but supportive assessment
✓ Include specific numbers, percentages, and scores
✓ Mention potential risks with severity levels
✓ End with "What would you like to explore next?" or similar

Respond now with expert-level guidance in a mentor's voice:`;
}

function buildCompliancePrompt(companyProfile, userQuery) {
  return `Company Context: ${companyProfile.companyName} (${companyProfile.industry}, ${companyProfile.stage} stage)

Compliance Query: ${userQuery || 'What compliance requirements should we prioritize?'}

Provide:
• Key compliance requirements for their industry
• Risk level (High/Medium/Low) for each
• Timeline for completion
• Penalties for non-compliance
• Recommended actions`;
}

function buildFundingPrompt(companyProfile, userQuery) {
  return `Company Context: ${companyProfile.companyName}
Stage: ${companyProfile.stage}
Revenue: $${companyProfile.revenue}
Industry: ${companyProfile.industry}

Funding Query: ${userQuery || 'What funding options are best for us?'}

Provide:
• Suitable funding sources for their stage
• Typical amounts they can raise
• Preparation requirements
• Timeline expectations
• Success factors and red flags`;
}

function buildRiskPrompt(companyProfile, userQuery) {
  return `Company: ${companyProfile.companyName} (${companyProfile.industry})
Stage: ${companyProfile.stage}

Risk Query: ${userQuery || 'What are our major risks?'}

Analyze:
• Legal/regulatory risks
• Financial/operational risks
• Market/competitive risks
• Technology/security risks
• Mitigation strategies for each`;
}

function buildRoadmapPrompt(companyProfile, userQuery) {
  return `Company: ${companyProfile.companyName}
Stage: ${companyProfile.stage}
Goal: ${companyProfile.primaryGoal}

Roadmap Query: ${userQuery || 'What should our 90-day roadmap look like?'}

Create:
• Prioritized milestones (90 days)
• Key metrics to track
• Resource requirements
• Risk factors
• Success criteria`;
}

// Legacy function for backward compatibility
export async function runDiagnostic(companyProfile) {
  return generateMentorResponse(companyProfile, null, 'diagnostic');
}

function generateMockDiagnostic(profile) {
  const stage = profile.stage;
  const industry = profile.industry;
  
  return {
    complianceChecklist: [
      'Company registration and incorporation',
      'GST registration (if revenue > threshold)',
      'PAN and TAN registration',
      'Professional tax registration',
      'ESI and PF registration (if employees > 20)',
      'Trade license from local authority',
      'Industry-specific regulatory compliance',
      'Data protection and privacy compliance',
      'Intellectual property protection',
      'Employment contracts and labor compliance'
    ],
    requiredLicenses: getLicensesForIndustry(industry),
    fundingOpportunities: [
      'Angel investors and angel networks',
      'Seed funding from venture capital firms',
      'Government startup schemes (Startup India)',
      'Industry-specific grants and subsidies',
      'Bank loans under MUDRA scheme',
      'Crowdfunding platforms',
      'Incubator and accelerator programs',
      'Strategic partnerships and corporate ventures'
    ],
    riskAnalysis: {
      legalRisk: stage === 'Idea' 
        ? 'High - Company structure and legal framework not yet established. Recommend immediate incorporation and founder agreements.'
        : 'Medium - Ensure all licenses are current and compliance documentation is maintained. Review contracts regularly.',
      financialRisk: profile.revenue < 100000 
        ? 'High - Limited revenue stream. Focus on achieving product-market fit and securing initial funding.'
        : 'Medium - Growing revenue base. Implement financial controls and burn rate management.',
      marketRisk: 'Medium - Competitive landscape requires continuous innovation. Conduct regular market analysis and customer feedback cycles.',
      cyberRisk: profile.teamSize < 5
        ? 'Medium - Small team with limited security resources. Implement basic security measures: 2FA, encrypted communications, secure cloud storage.'
        : 'Medium-High - Growing team increases attack surface. Invest in security training, tools, and data protection policies.'
    },
    readinessScore: calculateReadinessScore(profile),
    fundingScore: calculateFundingScore(profile),
    actionPlan90Days: generate90DayPlan(profile)
  };
}

function getLicensesForIndustry(industry) {
  const commonLicenses = ['Business License', 'GST Registration'];
  
  const industrySpecific = {
    'Food & Beverage': ['FSSAI License', 'Health Trade License'],
    'Healthcare': ['Medical Establishment License', 'Drug License'],
    'Education': ['Educational Institution License', 'Affiliation Certificates'],
    'E-commerce': ['E-commerce Registration', 'Consumer Affairs License'],
    'Fintech': ['RBI Approval', 'Payment Gateway License'],
    'Manufacturing': ['Factory License', 'Pollution Control Board License'],
    'Technology': ['STPI Registration', 'ISO Certification']
  };
  
  return [...commonLicenses, ...(industrySpecific[industry] || ['Industry-specific operating license'])];
}

function calculateReadinessScore(profile) {
  let score = 0;
  
  // Base score by stage
  const stageScores = {
    'Idea': 30,
    'Validation': 50,
    'MVP': 65,
    'Growth': 80
  };
  score = stageScores[profile.stage] || 30;
  
  // Additional factors
  if (profile.revenue > 0) score += 10;
  if (profile.teamSize > 3) score += 5;
  if (profile.isRegistered) score += 10;
  
  return Math.min(score, 100);
}

function calculateFundingScore(profile) {
  let score = 40; // Base score
  
  if (profile.stage === 'MVP' || profile.stage === 'Growth') score += 20;
  if (profile.revenue > 100000) score += 15;
  if (profile.revenue > 500000) score += 10;
  if (profile.teamSize >= 5) score += 10;
  if (profile.isRegistered) score += 5;
  
  return Math.min(score, 100);
}

function generate90DayPlan(profile) {
  const basePlan = [
    { week: '1-2', action: 'Complete company registration and legal structure setup' },
    { week: '3-4', action: 'Obtain necessary business licenses and permits' },
    { week: '5-6', action: 'Set up financial systems and accounting processes' },
    { week: '7-8', action: 'Develop and refine pitch deck and investor materials' },
    { week: '9-10', action: 'Implement basic cybersecurity measures and data protection' },
    { week: '11-12', action: 'Launch initial marketing and customer acquisition campaigns' }
  ];
  
  if (profile.stage === 'Growth') {
    return [
      { week: '1-2', action: 'Conduct comprehensive compliance audit and address gaps' },
      { week: '3-4', action: 'Prepare Series A fundraising materials and investor targeting' },
      { week: '5-6', action: 'Scale operations and optimize team structure' },
      { week: '7-8', action: 'Expand to new market segments or geographies' },
      { week: '9-10', action: 'Implement advanced analytics and business intelligence' },
      { week: '11-12', action: 'Strategic partnerships and industry collaborations' }
    ];
  }
  
  return basePlan;
}

export async function chatWithAI(message, companyContext, conversationHistory = []) {
  companyContext = normalizeCompanyProfile(companyContext);
  
  if (!genAI) {
    console.warn('⚠️  genAI not initialized for chat, using mock response');
    return generateMockMentorResponse(companyContext, message, 'chat');
  }

  try {
    console.log(`💬 Chat request: "${message.substring(0, 50)}..."`);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 2048,
      }
    });

    // Build comprehensive context
    const contextPrompt = `${MENTOR_SYSTEM_PROMPT}

CURRENT CONVERSATION CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company: ${companyContext.companyName}
Industry: ${companyContext.industry}
Stage: ${companyContext.stage}
Location: ${companyContext.location}
Revenue: $${companyContext.revenue}
Team Size: ${companyContext.teamSize}
Goal: ${companyContext.primaryGoal}
Registered: ${companyContext.isRegistered ? 'Yes' : 'No'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are now in conversation with the founder. Be conversational, warm, and supportive. Match their energy - if they're casual, be casual. If they need detailed analysis, provide it with care.`;

    // Build conversation with history
    const chatHistory = [
      { role: 'user', parts: [{ text: contextPrompt }] },
      { role: 'model', parts: [{ text: 'Got it! I\'m here as their mentor - ready to chat, listen, and provide guidance when needed. I\'ll be conversational for casual messages and detailed when they need deep analysis. I understand their context and I\'m here to support their journey.' }] }
    ];

    // Add previous conversation (keep last 8 messages for better context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-8);
      recentHistory.forEach(msg => {
        chatHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    console.log('🔄 Starting chat with history length:', chatHistory.length);
    
    // Start chat with full history
    const chat = model.startChat({ history: chatHistory });
    
    // Send message with enhanced prompt with timeout
    const enhancedMessage = buildChatPrompt(companyContext, message);
    
    console.log('⏳ Sending message to Gemini API...');
    
    // Add 30 second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI response timeout after 30 seconds')), 30000)
    );
    
    const result = await Promise.race([
      chat.sendMessage(enhancedMessage),
      timeoutPromise
    ]);
    
    console.log('📥 Received response from Gemini API');
    
    const response = result.response;
    let text = response.text();
    
    // Format the response for better display
    text = formatAIResponse(text);
    
    console.log('✅ Chat response received:', text.substring(0, 150) + '...');
    return text;
  } catch (error) {
    console.error('❌ Chat Error:', error.message);
    console.error('Error stack:', error.stack);
    console.warn('🔄 Using mock chat response');
    return generateMockMentorResponse(companyContext, message, 'chat');
  }
}

// Format AI response for better readability
function formatAIResponse(text) {
  // Ensure proper spacing after headers
  text = text.replace(/^(#{1,3})\s*(.+)$/gm, '$1 $2\n');
  
  // Ensure proper spacing for bullet points
  text = text.replace(/^([•\-\*])\s*(.+)$/gm, '$1 $2');
  
  // Clean up multiple consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Ensure proper formatting for numbered lists
  text = text.replace(/^(\d+\.)\s*(.+)$/gm, '$1 $2');
  
  return text.trim();
}

function generateMockMentorResponse(companyProfile, userQuery, contextType) {
  if (contextType === 'diagnostic') {
    return generateMockDiagnostic(companyProfile);
  }

  // Structured mock responses for chat
  const queryLower = (userQuery || '').toLowerCase().trim();
  
  // Handle greetings
  const isGreeting = /^(hi|hello|hey|good morning|good evening|good afternoon|greetings|yo|howdy|what's up|whats up|sup)[\s!.]*$/i.test(queryLower) ||
                    /^(hi|hello|hey)\s+(there|mate|friend|buddy)[\s!.]*$/i.test(queryLower);
  
  const isCasual = /^(how are you|how's it going|hows it going|what's up|whats up|how do you do)[\s!.?]*$/i.test(queryLower) ||
                   /^(thanks|thank you|ok|okay|cool|great|nice|got it|understood)[\s!.]*$/i.test(queryLower);
  
  if (isGreeting) {
    return `Hey! Great to hear from you! 👋

How are things going with ${companyProfile.companyName}? 

I'm here to help you navigate your ${companyProfile.stage} stage journey in the ${companyProfile.industry} space. What's the biggest challenge on your mind right now?`;
  }
  
  if (isCasual) {
    return `I'm doing great, thanks for asking! 

More importantly - how are YOU doing? Building a startup is quite a journey. 

What's keeping you busy with ${companyProfile.companyName} these days? I'm here to help with anything you need - funding, compliance, strategy, or just thinking through challenges.`;
  }
  
  if (queryLower.includes('fund') || queryLower.includes('investment') || queryLower.includes('capital')) {
    return `🎯 Funding Strategy for ${companyProfile.stage} Stage

**Recommended Funding Sources:**
• Angel investors and angel networks (₹25L-₹2Cr typical range)
• Seed-stage VCs for technology startups
• Government schemes (Startup India Seed Fund, SISFS)
• Industry-specific accelerators

**Preparation Checklist:**
✓ Solid pitch deck (10-15 slides)
✓ Financial projections (3-year model)
✓ Product demo or MVP
✓ Clear unit economics
✓ Competitive analysis

**Risks to Address:**
⚠️ Dilution management - aim for 15-25% equity in seed round
⚠️ Investor fit - ensure alignment on vision and timeline
⚠️ Due diligence preparedness - have all documents ready

**Next Steps (30 days):**
1. Refine pitch deck and financial model
2. Research and shortlist 20-30 relevant investors
3. Get warm introductions through network
4. Practice pitch with mentors`;
  }
  
  if (queryLower.includes('licen') || queryLower.includes('permit')) {
    return `📋 Licensing Requirements for ${companyProfile.industry}

**Essential Licenses:**
• Business Registration (Shop & Establishment Act)
• GST Registration (if turnover > ₹20L)
• Professional Tax Registration
• ${companyProfile.industry === 'E-commerce' ? 'E-commerce Registration' : 'Industry-specific operating license'}

**Timeline:**
• Company Registration: 7-10 days
• GST Registration: 3-7 days
• Trade License: 15-30 days

**Compliance Risk:**
⚠️ HIGH - Operating without proper licenses can result in penalties and business shutdown

**Immediate Actions:**
1. Start company incorporation process today
2. Apply for GST registration within 30 days of incorporation
3. Obtain trade license from local municipal authority
4. Consult industry-specific regulatory requirements`;
  }
  
  if (queryLower.includes('complian') || queryLower.includes('legal') || queryLower.includes('regulation')) {
    return `⚖️ Compliance Roadmap for ${companyProfile.stage} Stage

**Critical Compliance Areas:**

**1. Corporate Compliance**
• Maintain statutory registers
• File annual returns (ROC)
• Conduct board meetings quarterly
• Update MoA/AoA as needed

**2. Tax Compliance**
• GST returns (monthly/quarterly)
• TDS filing (quarterly)
• Income tax returns (annual)
• Professional tax (annual)

**3. Labor Compliance**
${companyProfile.teamSize >= 20 ? '• ESI and PF registration (mandatory for 20+ employees)\n• Maintain labor registers\n• Comply with minimum wage laws' : '• Prepare for ESI/PF as you scale\n• Have employment contracts\n• Clear policies on leaves/benefits'}

**Risk Assessment:**
${companyProfile.isRegistered ? '✓ Medium Risk - Registered but need ongoing compliance' : '❌ HIGH Risk - Not registered, immediate action required'}

**30-Day Action Plan:**
1. ${companyProfile.isRegistered ? 'Audit current compliance status' : 'Complete company registration'}
2. Set up accounting system for tax compliance
3. Create compliance calendar
4. Engage CA/legal advisor for guidance`;
  }

  if (queryLower.includes('risk') || queryLower.includes('challenge')) {
    return `🛡️ Risk Analysis for ${companyProfile.companyName}

**Legal Risks:** ${companyProfile.isRegistered ? 'MEDIUM' : 'HIGH'}
${companyProfile.isRegistered ? 
  '• Ensure ongoing compliance with corporate laws\n• Review and update contracts regularly' : 
  '• Unregistered entity poses liability risks\n• Urgent: Complete incorporation within 30 days'}

**Financial Risks:** ${companyProfile.revenue > 100000 ? 'MEDIUM' : 'HIGH'}
• ${companyProfile.revenue > 100000 ? 'Monitor burn rate and runway' : 'Limited revenue - focus on achieving PMF'}
• Maintain 12-18 months runway
• Implement financial controls

**Market Risks:** MEDIUM
• Competitive pressure in ${companyProfile.industry}
• Customer acquisition costs
• Market timing and validation

**Mitigation Strategy:**
1. Legal: Complete all registrations, maintain compliance calendar
2. Financial: Achieve profitability milestones, secure funding buffer
3. Market: Continuous customer feedback, agile product development
4. Operational: Build strong team, document processes

**Priority Actions:**
→ Address HIGH risks within 30 days
→ Set up risk monitoring system
→ Regular risk reviews (monthly)`;
  }

  if (queryLower.includes('team') || queryLower.includes('hire') || queryLower.includes('recruitment')) {
    return `👥 Team Building Strategy for ${companyProfile.stage} Stage

**Current Team:** ${companyProfile.teamSize} members

**Hiring Priorities for Your Stage:**
${companyProfile.stage === 'Idea' || companyProfile.stage === 'Validation' ?
  '• Technical co-founder (if not present)\n• 1-2 early engineers/developers\n• Focus on equity-based compensation' :
  '• Senior engineers/product managers\n• Sales/marketing lead\n• Mix of equity + competitive salary'}

**Key Considerations:**
• Founder agreements and vesting schedules (4-year with 1-year cliff)
• ESOP pool (10-15% for early-stage startups)
• Clear roles and responsibilities
• Cultural fit is as important as skills

**Legal Requirements:**
✓ Employment agreements for all team members
✓ NDAs and IP assignment agreements
✓ Contractor agreements for freelancers
${companyProfile.teamSize >= 20 ? '✓ ESI and PF compliance (mandatory)' : ''}

**Next Steps:**
1. Define exact roles needed (30 days)
2. Set up ESOP structure (60 days)
3. Create hiring pipeline
4. Establish team culture and values`;
  }

  // Default structured response
  return `💡 Expert Guidance for ${companyProfile.companyName}

Thank you for your question. Based on your profile:

**Your Context:**
• Stage: ${companyProfile.stage}
• Industry: ${companyProfile.industry}
• Focus: ${companyProfile.primaryGoal}

**Strategic Recommendations:**

1. **Immediate Priorities (0-30 days):**
   ${companyProfile.isRegistered ? 
     '• Ensure compliance documentation is current\n   • Focus on customer acquisition and revenue' :
     '• Complete company registration immediately\n   • Set up basic financial systems'}

2. **Growth Actions (30-90 days):**
   • Build and test your MVP/product
   • Establish key metrics and tracking
   • Create fundraising or revenue plan

3. **Risk Management:**
   • Address any legal/compliance gaps
   • Maintain adequate cash runway
   • Regular team and customer feedback

**Resources:**
• Startup India portal for government schemes
• Industry-specific mentor networks
• Legal and financial advisors

Would you like me to dive deeper into any specific area? I can provide detailed guidance on:
- Funding strategy
- Compliance requirements
- Risk mitigation
- Growth roadmap
- Team building

Feel free to ask follow-up questions!`;
}
// Document Generation with AI
export async function generateDocument(documentType, companyProfile) {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    return generateMockDocument(documentType, companyProfile);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `${MENTOR_SYSTEM_PROMPT}

Generate a professional ${documentType} tailored for the following startup profile:

Company: ${companyProfile.companyName}
Industry: ${companyProfile.industry}
Stage: ${companyProfile.stage}
Location: ${companyProfile.location}
Founders: [Company founders/directors]

Requirements:
- Use clear, professional formatting
- Include all necessary legal clauses
- Make it specific to their context
- Use formal business tone
- Include placeholders for names/dates/specifics that need to be filled

Return the complete document text with proper formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Document Generation Error:', error);
    return generateMockDocument(documentType, companyProfile);
  }
}

function generateMockDocument(documentType, companyProfile) {
  const templates = {
    'NDA': `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between:

1. ${companyProfile.companyName}, a company incorporated under the laws of India, having its registered office at ${companyProfile.location} ("Disclosing Party")

AND

2. [RECIPIENT NAME], [RECIPIENT DETAILS] ("Receiving Party")

WHEREAS the Disclosing Party wishes to share certain confidential information with the Receiving Party for the purpose of [PURPOSE];

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
   Confidential Information includes all technical, business, and financial information related to ${companyProfile.companyName}'s operations, products, services, and strategies.

2. OBLIGATIONS
   The Receiving Party agrees to:
   a) Maintain strict confidentiality
   b) Not disclose to third parties without written consent
   c) Use information only for agreed purposes
   d) Return or destroy information upon request

3. TERM
   This Agreement shall remain in effect for 2 years from the date of execution.

4. GOVERNING LAW
   This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement.

For ${companyProfile.companyName}          For [RECIPIENT]
_______________________                    _______________________
Name:                                      Name:
Title:                                     Title:
Date:                                      Date:`,

    'Founder Agreement': `FOUNDER'S AGREEMENT

This Agreement is made on [DATE] between the following founders of ${companyProfile.companyName}:

1. [FOUNDER 1 NAME]
2. [FOUNDER 2 NAME]
[Add more as needed]

BACKGROUND
The Founders wish to establish ${companyProfile.companyName} in the ${companyProfile.industry} industry and agree to the following terms:

1. EQUITY DISTRIBUTION
   The initial equity shall be distributed as follows:
   • [Founder 1]: [__]%
   • [Founder 2]: [__]%
   Total: 100%

2. VESTING SCHEDULE
   All founder shares shall vest over 4 years with a 1-year cliff:
   • Year 1: 0% (cliff period)
   • Years 2-4: 25% per year (monthly vesting)

3. ROLES AND RESPONSIBILITIES
   • [Founder 1]: [Role] - [Key Responsibilities]
   • [Founder 2]: [Role] - [Key Responsibilities]

4. DECISION MAKING
   Major decisions require unanimous consent:
   • Raising capital
   • Selling the company
   • Changing business direction
   • Hiring C-level executives

5. INTELLECTUAL PROPERTY
   All IP created shall be owned by ${companyProfile.companyName}.
   Founders assign all rights to the company.

6. NON-COMPETE
   During employment and 1 year after, founders shall not compete in ${companyProfile.industry}.

7. EXIT PROVISIONS
   • Voluntary Exit: Vested shares only
   • Termination for Cause: Company buyback at fair value
   • Death/Disability: Shares transfer per nominee

8. DISPUTE RESOLUTION
   Disputes shall be resolved through arbitration in ${companyProfile.location}.

SIGNATURES

Founder 1: _________________  Date: _______
Founder 2: _________________  Date: _______`,

    'Pitch Deck Outline': `PITCH DECK OUTLINE FOR ${companyProfile.companyName}

A comprehensive guide to structure your investor pitch deck:

SLIDE 1: COVER
• Company name: ${companyProfile.companyName}
• Tagline: [One compelling sentence]
• Contact information
• Visual: Strong brand image

SLIDE 2: PROBLEM
• The pain point in ${companyProfile.industry}
• Market size and impact
• Current inadequate solutions
• Why now is the right time

SLIDE 3: SOLUTION
• Your unique approach
• How ${companyProfile.companyName} solves the problem
• Key benefits and differentiators
• Demo or visual representation

SLIDE 4: PRODUCT
• Core features and functionality
• Technology stack (if relevant)
• Product roadmap
• Screenshots or demo

SLIDE 5: MARKET OPPORTUNITY
• Total Addressable Market (TAM)
• Serviceable Addressable Market (SAM)
• Serviceable Obtainable Market (SOM)
• Market trends in ${companyProfile.industry}

SLIDE 6: BUSINESS MODEL
• Revenue streams
• Pricing strategy
• Customer acquisition cost (CAC)
• Lifetime value (LTV)
• Unit economics

SLIDE 7: TRACTION
Current Status: ${companyProfile.stage} stage
• Revenue: $${companyProfile.revenue}
• Key metrics and growth
• Customer testimonials
• Partnerships and milestones

SLIDE 8: COMPETITION
• Competitive landscape in ${companyProfile.industry}
• Your unique advantages
• Market positioning
• Barriers to entry

SLIDE 9: GO-TO-MARKET STRATEGY
• Customer acquisition channels
• Marketing and sales strategy
• Partnership approach
• Geographic expansion plan

SLIDE 10: TEAM
Current Team Size: ${companyProfile.teamSize}
• Founder backgrounds and expertise
• Key team members
• Advisors and mentors
• Hiring plan

SLIDE 11: FINANCIALS
• Historical performance
• 3-year projections
• Key assumptions
• Path to profitability

SLIDE 12: FUNDING ASK
• Amount seeking: [Specify]
• Use of funds breakdown
• Expected milestones
• Future funding needs

SLIDE 13: VISION
• Long-term vision for ${companyProfile.companyName}
• Impact on ${companyProfile.industry}
• Exit opportunities
• Why you'll succeed

CLOSING: THANK YOU
• Contact information
• Call to action
• Meeting request

DESIGN TIPS:
✓ Keep each slide simple and visual
✓ Use consistent branding
✓ Limit text (max 3-5 bullets per slide)
✓ Tell a compelling story
✓ Practice delivery (10-15 minutes)`,

    'Loan Letter': `LOAN APPLICATION LETTER

Date: [DATE]

To,
The Branch Manager
[BANK NAME]
[BRANCH ADDRESS]

Subject: Application for Business Loan

Dear Sir/Madam,

I am writing to request a business loan for ${companyProfile.companyName}, a ${companyProfile.industry} company operating at the ${companyProfile.stage} stage.

COMPANY DETAILS:
• Company Name: ${companyProfile.companyName}
• Industry: ${companyProfile.industry}
• Business Stage: ${companyProfile.stage}
• Location: ${companyProfile.location}
• Current Revenue: $${companyProfile.revenue}
• Team Size: ${companyProfile.teamSize} employees
• Primary Objective: ${companyProfile.primaryGoal}

LOAN REQUIREMENT:
• Amount Requested: ₹ [AMOUNT]
• Purpose: [Working Capital / Equipment / Expansion / Other]
• Repayment Period: [X] months/years
• Proposed Collateral: [DETAILS]

BUSINESS OVERVIEW:
${companyProfile.companyName} is engaged in ${companyProfile.industry} with a focus on ${companyProfile.primaryGoal}. Our current operations demonstrate ${companyProfile.revenue > 100000 ? 'healthy' : 'growing'} revenue generation capacity.

USE OF FUNDS:
The loan will be utilized for:
1. [Specific use 1] - [Amount/Percentage]
2. [Specific use 2] - [Amount/Percentage]
3. [Specific use 3] - [Amount/Percentage]

REPAYMENT PLAN:
We project monthly revenues of ₹[AMOUNT] and commit to repaying [AMOUNT] per month starting from [DATE]. Our business model ensures consistent cash flow for timely repayment.

DOCUMENTS ENCLOSED:
1. Company Registration Certificate
2. GST Registration
3. PAN Card
4. Bank Statements (Last 6 months)
5. Income Tax Returns
6. Business Plan
7. Financial Projections
8. [Other relevant documents]

We request your favorable consideration of this loan application. I am available for any further information or documentation required.

Thank you for your time and consideration.

Yours sincerely,

_______________________
[FOUNDER NAME]
[DESIGNATION]
${companyProfile.companyName}
Phone: [PHONE]
Email: [EMAIL]`,

    'Employment Contract': `EMPLOYMENT CONTRACT

This Employment Agreement ("Agreement") is entered into on [DATE] between:

1. EMPLOYER
   ${companyProfile.companyName}
   ${companyProfile.location}
   ("Company")

AND

2. EMPLOYEE
   [EMPLOYEE NAME]
   [EMPLOYEE ADDRESS]
   ("Employee")

WHEREAS the Company wishes to employ the Employee and the Employee agrees to accept such employment under the terms and conditions set forth below:

1. POSITION AND DUTIES
   1.1 Position: [JOB TITLE]
   1.2 Department: [DEPARTMENT]
   1.3 Reporting To: [MANAGER NAME/TITLE]
   1.4 Location: ${companyProfile.location}
   1.5 The Employee shall perform duties as assigned by the Company in the ${companyProfile.industry} sector.

2. TERM OF EMPLOYMENT
   2.1 Start Date: [DATE]
   2.2 Probation Period: [3/6] months
   2.3 Employment Type: Full-time / Part-time / Contract

3. COMPENSATION
   3.1 Base Salary: ₹[AMOUNT] per month/annum
   3.2 Payment Schedule: Monthly on [DATE]
   3.3 Bonuses: Performance-based incentives as per company policy
   3.4 Annual Review: Salary review on [MONTH]

4. BENEFITS
   4.1 Leave Entitlement:
       • Earned Leave: [X] days per year
       • Casual Leave: [X] days per year
       • Sick Leave: [X] days per year
   4.2 Insurance: Health insurance as per company policy
   4.3 Provident Fund: Contribution as per statutory requirements
   4.4 Other Benefits: [List any additional benefits]

5. WORKING HOURS
   5.1 Standard Hours: [X] hours per week
   5.2 Schedule: [Days and timings]
   5.3 Overtime: As per applicable labor laws

6. CONFIDENTIALITY
   The Employee agrees to maintain confidentiality of all proprietary information, trade secrets, and business strategies of ${companyProfile.companyName}.

7. INTELLECTUAL PROPERTY
   All work product, inventions, and intellectual property created during employment shall be the exclusive property of ${companyProfile.companyName}.

8. NON-COMPETE AND NON-SOLICITATION
   8.1 During employment and for [X] months after termination, the Employee shall not:
       • Engage in competing business in ${companyProfile.industry}
       • Solicit company clients or employees
       • Work for direct competitors

9. TERMINATION
   9.1 Notice Period: [X] months by either party
   9.2 Termination without Notice: In cases of gross misconduct
   9.3 Severance: As per applicable labor laws

10. CODE OF CONDUCT
    The Employee shall adhere to company policies, code of conduct, and professional standards.

11. DISPUTE RESOLUTION
    Any disputes shall be resolved through arbitration in ${companyProfile.location}.

12. GOVERNING LAW
    This Agreement is governed by the laws of India and the jurisdiction of ${companyProfile.location}.

SIGNATURES

For ${companyProfile.companyName}:
_______________________          Date: _______
Name: [AUTHORIZED SIGNATORY]
Title: [DESIGNATION]

Employee:
_______________________          Date: _______
Name: [EMPLOYEE NAME]

Witness 1: _________________     Date: _______
Witness 2: _________________     Date: _______`,

    'Service Agreement': `SERVICE AGREEMENT

This Service Agreement ("Agreement") is made on [DATE] between:

1. SERVICE PROVIDER
   ${companyProfile.companyName}
   ${companyProfile.industry}
   ${companyProfile.location}
   ("Provider")

AND

2. CLIENT
   [CLIENT COMPANY NAME]
   [CLIENT ADDRESS]
   ("Client")

WHEREAS the Provider agrees to provide services to the Client under the following terms:

1. SCOPE OF SERVICES
   The Provider shall provide the following services:
   1.1 [SERVICE DESCRIPTION 1]
   1.2 [SERVICE DESCRIPTION 2]
   1.3 [SERVICE DESCRIPTION 3]
   
   Related to ${companyProfile.industry} sector expertise.

2. TERM
   2.1 Start Date: [DATE]
   2.2 Duration: [X] months/years
   2.3 Renewal: [Auto-renewal / Manual renewal terms]

3. DELIVERABLES
   The Provider shall deliver:
   • [DELIVERABLE 1]: By [DATE]
   • [DELIVERABLE 2]: By [DATE]
   • [DELIVERABLE 3]: By [DATE]

4. FEES AND PAYMENT
   4.1 Service Fee: ₹[AMOUNT]
   4.2 Payment Terms: [Monthly/Quarterly/Milestone-based]
   4.3 Payment Schedule:
       • [PERCENTAGE]% on signing
       • [PERCENTAGE]% on [MILESTONE]
       • [PERCENTAGE]% on completion
   4.4 Late Payment: [X]% interest per month on overdue amounts

5. RESPONSIBILITIES
   5.1 Provider Responsibilities:
       • Provide services professionally
       • Meet agreed timelines
       • Maintain quality standards
       • Provide regular updates
   
   5.2 Client Responsibilities:
       • Provide necessary information/access
       • Timely feedback and approvals
       • Timely payments
       • Cooperate with Provider team

6. INTELLECTUAL PROPERTY
   6.1 Pre-existing IP: Remains with respective parties
   6.2 New IP Created: [Specify ownership - Client/Provider/Shared]
   6.3 License: [Specify licensing terms if applicable]

7. CONFIDENTIALITY
   Both parties agree to maintain confidentiality of proprietary information shared during this engagement.

8. WARRANTIES
   8.1 Provider warrants:
       • Services performed with professional care
       • Compliance with applicable laws
       • No infringement of third-party rights
   8.2 Warranty Period: [X] days/months from delivery

9. LIMITATION OF LIABILITY
   9.1 Maximum Liability: Limited to fees paid under this Agreement
   9.2 Exclusions: No liability for indirect, incidental, or consequential damages

10. TERMINATION
    10.1 Notice Period: [X] days written notice
    10.2 Termination for Cause: Immediate termination for material breach
    10.3 Effect of Termination:
         • Payment for services rendered
         • Return of confidential information
         • Transfer of deliverables completed

11. FORCE MAJEURE
    Neither party liable for delays due to circumstances beyond reasonable control.

12. DISPUTE RESOLUTION
    12.1 Negotiation: Good faith negotiations first
    12.2 Mediation: If negotiation fails
    12.3 Arbitration: Binding arbitration in ${companyProfile.location}

13. GENERAL PROVISIONS
    13.1 Governing Law: Laws of India
    13.2 Jurisdiction: Courts of ${companyProfile.location}
    13.3 Amendment: Written agreement by both parties
    13.4 Entire Agreement: Supersedes all prior agreements

SIGNATURES

For ${companyProfile.companyName}:
_______________________          Date: _______
Name: [AUTHORIZED SIGNATORY]
Title: [DESIGNATION]

For Client:
_______________________          Date: _______
Name: [AUTHORIZED SIGNATORY]
Title: [DESIGNATION]`,

    'Pitch Deck': `PITCH DECK FOR ${companyProfile.companyName}

A comprehensive 13-slide investor pitch deck template:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 1: COVER SLIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${companyProfile.companyName}
[Your Compelling Tagline]
${companyProfile.industry} · ${companyProfile.stage} Stage

Contact: [Your Name] | [Email] | [Phone]
Location: ${companyProfile.location}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 2: THE PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 What major pain point exists in ${companyProfile.industry}?

• Problem Statement 1: [Describe specific issue]
• Problem Statement 2: [Quantify the impact]
• Problem Statement 3: [Current inadequate solutions]

💡 Why Now? [Market timing and urgency]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 3: THE SOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ How ${companyProfile.companyName} Solves This

Our Unique Approach:
• Solution Point 1: [Key innovation]
• Solution Point 2: [Differentiation]
• Solution Point 3: [Customer benefit]

[Include: Product screenshot or demo visual]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 4: PRODUCT DEMONSTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Core Features:
1. [Feature Name]: [Benefit]
2. [Feature Name]: [Benefit]
3. [Feature Name]: [Benefit]

Technology Stack: [If relevant to your story]
Product Roadmap: Current → Q2 → Q4

[Add: Screenshots, workflow diagrams, or demo video]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 5: MARKET OPPORTUNITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ${companyProfile.industry} Market Size

• TAM (Total Addressable Market): $[X]B
• SAM (Serviceable Addressable Market): $[X]B
• SOM (Serviceable Obtainable Market): $[X]M

Market Growth: [X]% CAGR
Key Trends: [List 2-3 favorable market trends]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 6: BUSINESS MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 How We Make Money

Revenue Streams:
• [Stream 1]: [Pricing model]
• [Stream 2]: [Pricing model]

Unit Economics:
• Customer Acquisition Cost (CAC): $[X]
• Lifetime Value (LTV): $[X]
• LTV:CAC Ratio: [X]:1
• Gross Margin: [X]%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 7: TRACTION & MILESTONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Current Status: ${companyProfile.stage}

Key Metrics:
• Revenue: $${companyProfile.revenue}
• Customers: [Number]
• Growth Rate: [X]% MoM/YoY
• [Other relevant metrics]

Recent Achievements:
✓ [Milestone 1]
✓ [Milestone 2]
✓ [Milestone 3]

[Add: Growth chart or customer testimonials]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 8: COMPETITIVE LANDSCAPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Market Position in ${companyProfile.industry}

Competitors:
• [Competitor 1]: [Their approach]
• [Competitor 2]: [Their approach]

Our Competitive Advantages:
✓ [Unique advantage 1]
✓ [Unique advantage 2]
✓ [Unique advantage 3]

Barriers to Entry: [What makes you defensible]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 9: GO-TO-MARKET STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Customer Acquisition Plan

Channels:
• Channel 1: [Strategy and CAC]
• Channel 2: [Strategy and CAC]
• Channel 3: [Strategy and CAC]

Marketing Strategy: [Key campaigns]
Sales Strategy: [Sales motion]
Partnership Strategy: [Strategic alliances]

Expansion Plan: ${companyProfile.location} → [Next markets]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 10: TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Current Team: ${companyProfile.teamSize} members

Founders:
• [Name], [Title]
  [Background, relevant experience, achievements]
• [Name], [Title]
  [Background, relevant experience, achievements]

Key Team Members:
• [Role]: [Name] - [Brief background]
• [Role]: [Name] - [Brief background]

Advisors:
• [Name] - [Expertise]
• [Name] - [Expertise]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 11: FINANCIAL PROJECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💹 3-Year Forecast

         Year 1    Year 2    Year 3
Revenue  $[X]M     $[X]M     $[X]M
Gross    [X]%      [X]%      [X]%
Margin
EBITDA   $[X]M     $[X]M     $[X]M

Key Assumptions:
• [Assumption 1]
• [Assumption 2]
• [Assumption 3]

Break-even: [Month/Year]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 12: THE ASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 Funding Round: [Series A / Series B / Seed]

Amount Seeking: $[X]M

Use of Funds:
• [X]% - Product Development
• [X]% - Sales & Marketing
• [X]% - Team Expansion
• [X]% - Operations
• [X]% - Working Capital

Milestones with This Capital:
✓ [Milestone 1] by [Date]
✓ [Milestone 2] by [Date]
✓ [Milestone 3] by [Date]

Runway: [X] months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 13: VISION & CLOSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Where We're Going

Our Vision:
[Your long-term vision for ${companyProfile.companyName}]

Impact:
[How you'll transform ${companyProfile.industry}]

Exit Opportunities:
• [Potential acquirers or IPO path]

Why We'll Win:
✓ [Reason 1]
✓ [Reason 2]
✓ [Reason 3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THANK YOU

Let's discuss how we can work together.

Contact: [Name]
Email: [email@${companyProfile.companyName}.com]
Phone: [Phone]
Website: [www.${companyProfile.companyName}.com]

[Schedule a follow-up meeting]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESENTATION TIPS:
✓ Keep deck to 10-15 minutes
✓ Practice your story arc
✓ Use visuals over text
✓ Show passion and conviction
✓ Be ready for tough questions
✓ Have backup slides for deep dives`
  };

  // Normalize document type name to match template keys
  let normalizedType = documentType;
  
  // Handle full names with descriptions in parentheses
  if (documentType.includes('(')) {
    normalizedType = documentType.split('(')[0].trim();
  }
  
  // Try exact match first, then normalized match
  return templates[documentType] || templates[normalizedType] || `Document template for "${documentType}" will be generated here.`;
}

// Generate Topic-Specific Advice
export async function generateTopicAdvice(companyProfile, topic) {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    return generateMockTopicAdvice(topic);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `You are an expert startup mentor specializing in ${topic}.

COMPANY CONTEXT:
Company: ${companyProfile.name || 'Startup'}
Industry: ${companyProfile.industry || 'Technology'}
Stage: ${companyProfile.stage || 'Early Stage'}
Location: ${companyProfile.location || 'India'}
Team Size: ${companyProfile.teamSize || '1-5'}
Funding Status: ${companyProfile.fundingStatus || 'Bootstrapped'}
Description: ${companyProfile.description || 'No description provided'}

TASK: Provide comprehensive, actionable advice for the topic "${topic}" tailored to this company's profile.

Your response should include:
1. Overview of why this topic is critical for their stage
2. Specific action items (5-7 concrete steps)
3. Common mistakes to avoid
4. Resources or tools they should use
5. Timeline expectations
6. Success metrics

Make it practical, actionable, and specific to their industry and stage. Use a friendly, mentor-like tone.
Length: 300-500 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Topic advice generation error:', error);
    return generateMockTopicAdvice(topic);
  }
}

// Generate Personalized Roadmap
export async function generateRoadmap(companyProfile, completedTopics = []) {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    return generateMockRoadmap(companyProfile);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `You are a strategic startup advisor creating a personalized 90-day roadmap.

COMPANY PROFILE:
Company: ${companyProfile.name || 'Startup'}
Type: ${companyProfile.companyType || 'Private Limited'}
Industry: ${companyProfile.industry || 'Technology'}
Stage: ${companyProfile.stage || 'Early Stage'}
Location: ${companyProfile.location || 'India'}
Team Size: ${companyProfile.teamSize || '1-5'}
Funding Status: ${companyProfile.fundingStatus || 'Bootstrapped'}
Description: ${companyProfile.description || 'No description provided'}

COMPLETED TOPICS: ${completedTopics.length > 0 ? completedTopics.join(', ') : 'None yet'}

TASK: Create a detailed 90-day roadmap with specific milestones and actions.

Structure your response as JSON:
{
  "days30": [
    {"milestone": "Title", "description": "What to do", "priority": "High/Medium/Low"},
    ...
  ],
  "days60": [
    {"milestone": "Title", "description": "What to do", "priority": "High/Medium/Low"},
    ...
  ],
  "days90": [
    {"milestone": "Title", "description": "What to do", "priority": "High/Medium/Low"},
    ...
  ]
}

Requirements:
- 4-5 milestones per 30-day period
- Each milestone should be specific and actionable
- Prioritize based on stage and funding status
- Include compliance, growth, and operational milestones
- Consider what they've already completed

Return ONLY the JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return generateMockRoadmap(companyProfile);
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return generateMockRoadmap(companyProfile);
  }
}

// Generate Financial Guidance
export async function generateFinancialGuidance(companyProfile) {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    return generateMockFinancialGuidance(companyProfile);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `You are a financial advisor for startups specializing in fundraising and financial planning.

COMPANY PROFILE:
Company: ${companyProfile.name || 'Startup'}
Industry: ${companyProfile.industry || 'Technology'}
Stage: ${companyProfile.stage || 'Early Stage'}
Location: ${companyProfile.location || 'India'}
Team Size: ${companyProfile.teamSize || '1-5'}
Funding Status: ${companyProfile.fundingStatus || 'Bootstrapped'}

TASK: Provide comprehensive financial guidance covering:

1. FUNDRAISING OPTIONS
   - Suitable for their stage and industry
   - Approximate amounts and equity expectations
   - Application process and requirements
   - Success rates and timelines

2. CASH FLOW MANAGEMENT
   - Revenue projections guidance
   - Burn rate management
   - Break-even analysis approach
   - Cash runway recommendations

3. FINANCIAL PLANNING
   - Budget allocation recommendations
   - Cost optimization strategies
   - Financial milestones to track
   - When to raise next round

4. FUNDING SOURCES
   - Government grants and schemes (India-specific)
   - Angel investors and VCs
   - Bank loans and credit lines
   - Alternative funding (crowdfunding, revenue-based)

Make it actionable and specific to their stage. Include specific schemes, amounts, and timelines.
Length: 400-600 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Financial guidance error:', error);
    return generateMockFinancialGuidance(companyProfile);
  }
}

// Generate Compliance and Rules Guidance
export async function generateComplianceGuidance(companyProfile) {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    return generateMockComplianceGuidance(companyProfile);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `You are a legal and compliance expert for Indian startups.

COMPANY PROFILE:
Company: ${companyProfile.name || 'Startup'}
Type: ${companyProfile.companyType || 'Private Limited'}
Industry: ${companyProfile.industry || 'Technology'}
Location: ${companyProfile.location || 'India'}
Team Size: ${companyProfile.teamSize || '1-5'}

TASK: Provide a comprehensive compliance checklist and legal obligations.

Cover these areas:

1. COMPANY REGISTRATION
   - Required registrations for their company type
   - Documents needed
   - Costs and timelines
   - Renewal requirements

2. LICENSES & PERMITS
   - Industry-specific licenses for ${companyProfile.industry}
   - Location-specific permits for ${companyProfile.location}
   - Professional licenses if needed
   - Digital/online business licenses

3. TAX COMPLIANCE
   - GST registration requirements
   - Income tax obligations
   - TDS compliance
   - Tax filing deadlines

4. LEGAL PROTECTIONS
   - Intellectual property (trademark, copyright, patent)
   - NDA requirements
   - Founder agreements
   - Employment contracts

5. REGULATORY COMPLIANCE
   - Data protection (if applicable)
   - Industry-specific regulations
   - Labor laws
   - Foreign investment rules (if applicable)

6. ONGOING OBLIGATIONS
   - Annual filings and reports
   - Board meetings and resolutions
   - Audit requirements
   - Compliance calendar

Make it specific, actionable, and checklist-style. Include deadlines and penalties for non-compliance.
Length: 500-700 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Compliance guidance error:', error);
    return generateMockComplianceGuidance(companyProfile);
  }
}

// Generate Mentor Matching Recommendations
export async function generateMentorMatch(companyProfile, availableMentors) {
  companyProfile = normalizeCompanyProfile(companyProfile);
  
  if (!genAI) {
    return generateMockMentorMatch(availableMentors);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.6,
        topP: 0.8,
        topK: 40,
      }
    });

    const mentorsList = availableMentors.map(m => 
      `${m.name} - ${m.expertise.join(', ')} - ${m.industry}`
    ).join('\n');

    const prompt = `You are a mentor matching expert for startups.

COMPANY NEEDS:
Company: ${companyProfile.name}
Industry: ${companyProfile.industry}
Stage: ${companyProfile.stage}
Focus: ${companyProfile.description}

AVAILABLE MENTORS:
${mentorsList}

TASK: Rank these mentors by relevance and provide match scores (0-100).

Return JSON only:
{
  "matches": [
    {"name": "Mentor Name", "score": 95, "reason": "Why they're a great fit (1 sentence)"},
    ...
  ]
}

Consider industry alignment, stage expertise, and skills needed. Return ONLY JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return generateMockMentorMatch(availableMentors);
  } catch (error) {
    console.error('Mentor matching error:', error);
    return generateMockMentorMatch(availableMentors);
  }
}

// Mock responses for fallback
function generateMockTopicAdvice(topic) {
  return `**${topic} Guidance**

As your startup mentor, here's what you need to know about ${topic}:

**Why This Matters**
${topic} is crucial at your stage because it directly impacts your company's sustainability and growth potential.

**Action Steps:**
1. Assess your current status in this area
2. Identify immediate gaps or requirements
3. Create a checklist of necessary actions
4. Set realistic timelines for completion
5. Allocate resources (time, money, people)
6. Track progress weekly
7. Seek expert advice when needed

**Common Mistakes:**
- Delaying action until it becomes urgent
- Not budgeting adequately
- Trying to handle everything yourself
- Ignoring industry-specific requirements

**Next Steps:**
Start by documenting your current state, then prioritize the most critical actions. Consider consulting with a specialist in this area if needed.

**Timeline:** Most activities in this area can be completed within 2-4 weeks with focused effort.

Mark this topic as complete once you've taken the core actions!`;
}

function generateMockRoadmap(companyProfile) {
  return {
    "days30": [
      {"milestone": "Complete Legal Setup", "description": "Register company, get GST, open bank account", "priority": "High"},
      {"milestone": "Build MVP", "description": "Develop minimum viable product for testing", "priority": "High"},
      {"milestone": "Initial Market Research", "description": "Interview 20+ potential customers", "priority": "Medium"},
      {"milestone": "Setup Accounting", "description": "Choose accounting software, setup books", "priority": "Medium"}
    ],
    "days60": [
      {"milestone": "Launch Beta", "description": "Release product to first 50 users", "priority": "High"},
      {"milestone": "Fundraising Prep", "description": "Prepare pitch deck and financial projections", "priority": "High"},
      {"milestone": "Hire Key Team Member", "description": "Recruit technical co-founder or key developer", "priority": "Medium"},
      {"milestone": "Marketing Foundation", "description": "Setup website, social media, content strategy", "priority": "Medium"}
    ],
    "days90": [
      {"milestone": "Revenue Milestone", "description": "Achieve first ₹1L in revenue", "priority": "High"},
      {"milestone": "Start Fundraising", "description": "Pitch to 10+ investors", "priority": "High"},
      {"milestone": "Scale Operations", "description": "Systemize processes, prepare for growth", "priority": "Medium"},
      {"milestone": "Compliance Audit", "description": "Review all legal and tax obligations", "priority": "Low"}
    ]
  };
}

function generateMockFinancialGuidance(companyProfile) {
  return `**Financial Guidance for ${companyProfile.name}**

**FUNDRAISING OPTIONS**

Based on your ${companyProfile.stage} stage, consider:

1. **Bootstrapping** - Retain full control, slower growth
2. **Angel Investment** - ₹25L-₹2Cr, 10-20% equity
3. **Government Grants** - SISFS, Startup India Seed Fund (₹20L-₹50L)
4. **Incubators/Accelerators** - ₹10L-₹50L + mentorship
5. **Venture Capital** - (if post-revenue) ₹2Cr+ for 15-25% equity

**CASH FLOW MANAGEMENT**

Your burn rate should not exceed ₹2-3L/month at this stage. Maintain:
- 12+ months runway minimum
- Clear revenue projections
- Monthly cash flow tracking
- Emergency fund (3 months operating costs)

**FINANCIAL PLANNING**

Recommended budget allocation:
- Product Development: 40%
- Marketing & Sales: 30%
- Operations: 20%
- Legal & Compliance: 10%

**FUNDING SOURCES IN INDIA**

**Government Programs:**
- Startup India Seed Fund Scheme (SISFS)
- Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)
- MUDRA Loans (up to ₹10L)
- Stand-Up India (₹10L-₹1Cr)

**Private Funding:**
- Angel investors through networks (LetsVenture, Indian Angel Network)
- Early-stage VCs (specializing in ${companyProfile.industry})
- Revenue-based financing options

**TIMELINE RECOMMENDATIONS**

- Month 1-3: Bootstrap and validate
- Month 4-6: Approach angels if traction exists
- Month 7-12: Prepare for institutional funding
- Month 12+: Series A readiness

**KEY METRICS TO TRACK**

1. Monthly Recurring Revenue (MRR)
2. Customer Acquisition Cost (CAC)
3. Lifetime Value (LTV)
4. Burn Rate and Runway
5. Gross Margin

Start tracking these now to be investor-ready.`;
}

function generateMockComplianceGuidance(companyProfile) {
  return `**Compliance Checklist for ${companyProfile.name}**

**1. COMPANY REGISTRATION**

${companyProfile.companyType === 'Private Limited' ? `
✓ Certificate of Incorporation (MCA)
✓ PAN Card for Company
✓ TAN (Tax Deduction Account Number)
✓ Director Identification Number (DIN)
Cost: ₹8,000-₹15,000 | Timeline: 15-30 days
` : `
✓ Business Registration (appropriate type)
✓ PAN Card
✓ Shop & Establishment License
Cost: ₹3,000-₹8,000 | Timeline: 7-15 days
`}

**2. LICENSES & PERMITS**

**Essential:**
- GST Registration (if turnover > ₹40L services / ₹20L goods)
- Professional Tax Registration (state-specific)
- Shop & Establishment License
- MSME Registration (Udyam)

**Industry-Specific (${companyProfile.industry}):**
${companyProfile.industry.toLowerCase().includes('food') ? '- FSSAI License\n- Health & Safety Permits' : ''}
${companyProfile.industry.toLowerCase().includes('tech') ? '- Import Export Code (if importing)\n- Data Protection compliance' : ''}
- Sector-specific certifications

**3. TAX COMPLIANCE**

**GST Obligations:**
- Monthly/Quarterly returns (GSTR-1, GSTR-3B)
- Annual return (GSTR-9)
- Deadline: 20th of following month
- Penalty: ₹200/day for late filing

**Income Tax:**
- TDS compliance if applicable
- Advance tax payments (quarterly)
- ITR filing by July 31st
- Maintain proper books of accounts

**4. LEGAL PROTECTIONS**

**Intellectual Property:**
- Trademark registration: ₹4,500-₹10,000, 12-18 months
- Copyright for content/software: ₹500-₹5,000, 6-12 months
- Patents (if applicable): ₹8,000-₹20,000, 2-3 years

**Agreements Needed:**
- Founders' Agreement (equity, vesting, exit)
- NDA templates for employees/partners
- Employment contracts
- Service agreements with customers
- Vendor/supplier contracts

**5. REGULATORY COMPLIANCE**

**Data Protection:**
${companyProfile.industry.toLowerCase().includes('tech') || companyProfile.industry.toLowerCase().includes('software') ? `
- Follow IT Act 2000 and amendments
- Implement data security measures
- Privacy policy on website
- User consent management
` : '- Basic data security best practices\n- Privacy policy if collecting customer data'}

**Labor Laws:**
- Provident Fund (if 20+ employees)
- ESI (if applicable)
- Labor Welfare Fund
- Professional Tax deduction

**6. ONGOING OBLIGATIONS**

**Annual Requirements:**
- Income Tax Return (by July 31)
- Annual GST Return (by December 31)
- MCA Annual Filing - AOC-4 & MGT-7 (by Oct 31)
- Board Meetings (minimum 4 per year)
- AGM within 6 months of financial year end

**Quarterly:**
- Board meetings
- Advance tax payments
- TDS returns

**Monthly:**
- GST returns
- TDS payments
- Salary payments and compliance

**COMPLIANCE CALENDAR**

**Critical Deadlines:**
- July 31: Income Tax Return
- September 30: Due date extensions (if applicable)
- October 31: MCA annual filings
- December 31: GST annual return
- March 31: Financial year end

**NON-COMPLIANCE PENALTIES**

- Late GST filing: ₹200/day
- Late ITR: ₹5,000-₹10,000
- Late MCA filing: ₹100/day
- Missing TDS payments: Interest + penalty

**RECOMMENDED ACTIONS**

1. Hire a CA for tax compliance (₹5,000-₹15,000/month)
2. Use accounting software (Zoho Books, Tally, QuickBooks)
3. Set calendar reminders for all deadlines
4. Conduct quarterly compliance audits
5. Keep all documents digitally organized

Stay compliant! It's easier to maintain than to fix later.`;
}

function generateMockMentorMatch(mentors) {
  return {
    "matches": mentors.slice(0, 5).map((mentor, index) => ({
      "name": mentor.name,
      "score": 90 - (index * 10),
      "reason": `Strong expertise in ${mentor.expertise[0]} and ${mentor.expertise[1]}, relevant to your needs.`
    }))
  };
}