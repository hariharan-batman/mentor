// ─── TASK GENERATOR — Auto-generate tasks based on company profile ────────

/**
 * Generate tasks based on company profile
 * Tasks are categorized and weighted for scoring
 */
export function generateTasksFromProfile(companyProfile) {
  const tasks = [];
  let taskId = 1;

  // ─── COMPLIANCE TASKS ────────────────────────────────────
  
  // Basic Registration
  if (!companyProfile.isRegistered) {
    tasks.push(createTask(taskId++, 'Company Registration', 
      'Register your company with appropriate authorities',
      'compliance', 'critical', 15, 
      { penalty: 'High', cost: '₹10,000-₹25,000', time: '7-14 days' }));
  }

  // GST Registration
  if (companyProfile.revenue > 2000000 || companyProfile.stage !== 'Idea') {
    tasks.push(createTask(taskId++, 'GST Registration',
      'Register for GST - mandatory if revenue exceeds ₹20 lakhs',
      'compliance', 'critical', 10,
      { penalty: 'High - ₹10,000 fine + 18% interest', cost: '₹2,000-₹5,000', time: '5-7 days' }));
  }

  // PAN/TAN
  tasks.push(createTask(taskId++, 'PAN & TAN Registration',
    'Obtain PAN and TAN for tax compliance',
    'compliance', 'high', 5,
    { penalty: 'High', cost: '₹500-₹2,000', time: '2-3 days' }));

  // ESI/PF Registration
  if (companyProfile.teamSize >= 10) {
    tasks.push(createTask(taskId++, 'ESI & PF Registration',
      `Mandatory for ${companyProfile.teamSize} employees - Register with ESIC and EPFO`,
      'compliance', 'critical', 10,
      { penalty: 'High - Criminal prosecution possible', cost: '₹5,000-₹15,000', time: '7-10 days' }));
  }

  // Professional Tax
  if (companyProfile.teamSize >= 1 && ['Maharashtra', 'Karnataka', 'West Bengal', 'Tamil Nadu'].includes(companyProfile.location)) {
    tasks.push(createTask(taskId++, 'Professional Tax Registration',
      'State-specific professional tax registration required',
      'compliance', 'high', 5,
      { penalty: 'Medium', cost: '₹2,500-₹5,000', time: '3-5 days' }));
  }

  // Trade License
  tasks.push(createTask(taskId++, 'Trade License',
    'Obtain trade license from local municipal authority',
    'compliance', 'high', 5,
    { penalty: 'Medium', cost: '₹5,000-₹20,000', time: '7-15 days' }));

  // Shops & Establishment
  if (companyProfile.teamSize >= 1) {
    tasks.push(createTask(taskId++, 'Shops & Establishment Registration',
      'Register under Shops and Establishment Act',
      'compliance', 'medium', 3,
      { penalty: 'Low-Medium', cost: '₹1,000-₹3,000', time: '2-5 days' }));
  }

  // Data Protection
  if (companyProfile.industry === 'Technology' || companyProfile.teamSize > 20) {
    tasks.push(createTask(taskId++, 'Data Protection Policy',
      'Create comprehensive data protection and privacy policy',
      'compliance', 'high', 8,
      { penalty: 'High - GDPR/DPDP violations costly', cost: '₹15,000-₹50,000', time: '5-10 days' }));
  }

  // ─── LEGAL STRUCTURE TASKS ────────────────────────────────

  // Founder Agreement
  if (companyProfile.teamSize > 1 && companyProfile.stage !== 'Idea') {
    tasks.push(createTask(taskId++, 'Founder Agreement',
      'Establish clear founder roles, equity split, and vesting schedule',
      'fundingReadiness', 'critical', 12,
      { penalty: 'N/A - Prevents future conflicts', cost: '₹20,000-₹50,000', time: '3-7 days' }));
  }

  // Board Resolutions
  if (companyProfile.isRegistered) {
    tasks.push(createTask(taskId++, 'Board Resolutions Documentation',
      'Maintain proper board resolution records for key decisions',
      'operations', 'medium', 5,
      { penalty: 'Medium - Required for audits', cost: '₹5,000-₹15,000', time: '1-3 days' }));
  }

  // Shareholders Agreement
  if (companyProfile.stage === 'Growth' || companyProfile.stage === 'MVP') {
    tasks.push(createTask(taskId++, 'Shareholders Agreement',
      'Formalize shareholder rights, obligations, and exit terms',
      'fundingReadiness', 'high', 10,
      { penalty: 'N/A - Critical for funding', cost: '₹25,000-₹75,000', time: '5-10 days' }));
  }

  // ─── FUNDING READINESS TASKS ────────────────────────────────

  // Financial Model
  if (companyProfile.stage !== 'Idea') {
    tasks.push(createTask(taskId++, 'Financial Projections Model',
      'Create 3-year financial projections with revenue, costs, and burn rate',
      'fundingReadiness', 'critical', 15,
      { penalty: 'N/A - Essential for fundraising', cost: '₹30,000-₹100,000', time: '7-14 days' }));
  }

  // Pitch Deck
  if (companyProfile.stage === 'Validation' || companyProfile.stage === 'MVP' || companyProfile.stage === 'Growth') {
    tasks.push(createTask(taskId++, 'Investor Pitch Deck',
      'Prepare professional pitch deck covering problem, solution, market, traction',
      'fundingReadiness', 'critical', 12,
      { penalty: 'N/A - Required for investor meetings', cost: '₹20,000-₹80,000', time: '5-10 days' }));
  }

  // Cap Table
  if (companyProfile.stage !== 'Idea') {
    tasks.push(createTask(taskId++, 'Capitalization Table',
      'Maintain accurate cap table showing ownership structure',
      'fundingReadiness', 'high', 8,
      { penalty: 'N/A - Critical for funding rounds', cost: '₹10,000-₹30,000', time: '2-5 days' }));
  }

  // Due Diligence Folder
  if (companyProfile.stage === 'MVP' || companyProfile.stage === 'Growth') {
    tasks.push(createTask(taskId++, 'Due Diligence Data Room',
      'Organize all legal, financial, and operational documents for investor review',
      'fundingReadiness', 'high', 10,
      { penalty: 'N/A - Speeds up fundraising', cost: '₹15,000-₹40,000', time: '3-7 days' }));
  }

  // ─── RISK CONTROL TASKS ────────────────────────────────

  // IP Protection
  if (companyProfile.industry === 'Technology' || companyProfile.stage !== 'Idea') {
    tasks.push(createTask(taskId++, 'Intellectual Property Protection',
      'Trademark registration, copyright, and patent filing if applicable',
      'riskControl', 'high', 10,
      { penalty: 'High - Loss of brand/IP', cost: '₹10,000-₹100,000', time: '30-180 days' }));
  }

  // Insurance
  if (companyProfile.teamSize >= 5) {
    tasks.push(createTask(taskId++, 'Business Insurance',
      'Professional indemnity, D&O insurance, and general liability coverage',
      'riskControl', 'medium', 7,
      { penalty: 'High - Uninsured losses', cost: '₹25,000-₹200,000/year', time: '3-7 days' }));
  }

  // Legal Audit
  if (companyProfile.stage === 'Growth') {
    tasks.push(createTask(taskId++, 'Legal Compliance Audit',
      'Comprehensive audit of all legal and regulatory compliance',
      'riskControl', 'high', 8,
      { penalty: 'Varies - Identify hidden risks', cost: '₹50,000-₹200,000', time: '14-30 days' }));
  }

  // Contracts Review
  if (companyProfile.teamSize >= 5 || companyProfile.revenue > 1000000) {
    tasks.push(createTask(taskId++, 'Contract Templates & Review',
      'Standardize customer, vendor, and employment contracts',
      'riskControl', 'medium', 6,
      { penalty: 'Medium - Contract disputes', cost: '₹20,000-₹60,000', time: '5-10 days' }));
  }

  // ─── OPERATIONS TASKS ────────────────────────────────

  // Employment Contracts
  if (companyProfile.teamSize >= 1) {
    tasks.push(createTask(taskId++, 'Employment Contracts',
      'Formalize employment agreements with all team members',
      'operations', 'high', 8,
      { penalty: 'Medium - Labor disputes', cost: '₹5,000-₹15,000', time: '2-5 days' }));
  }

  // HR Policies
  if (companyProfile.teamSize >= 10) {
    tasks.push(createTask(taskId++, 'HR Policy Manual',
      'Create comprehensive HR policies covering leave, conduct, grievances',
      'operations', 'medium', 6,
      { penalty: 'Medium - HR conflicts', cost: '₹15,000-₹40,000', time: '5-10 days' }));
  }

  // Org Structure
  if (companyProfile.teamSize >= 20) {
    tasks.push(createTask(taskId++, 'Organizational Structure',
      'Define reporting hierarchy, roles, and responsibilities',
      'operations', 'medium', 5,
      { penalty: 'Low - Operational inefficiency', cost: '₹10,000-₹30,000', time: '3-7 days' }));
  }

  // Bookkeeping
  if (companyProfile.revenue > 0) {
    tasks.push(createTask(taskId++, 'Proper Bookkeeping System',
      'Implement accounting software and maintain clean books',
      'operations', 'critical', 10,
      { penalty: 'High - Tax and audit issues', cost: '₹15,000-₹50,000/year', time: '2-5 days setup' }));
  }

  // ─── CYBER SECURITY TASKS ────────────────────────────────

  // Basic Security
  if (companyProfile.teamSize >= 1) {
    tasks.push(createTask(taskId++, 'Basic Cybersecurity Setup',
      '2FA, password policies, endpoint protection, secure email',
      'cyberSecurity', 'critical', 10,
      { penalty: 'High - Data breach risk', cost: '₹10,000-₹30,000', time: '1-3 days' }));
  }

  // Security Training
  if (companyProfile.teamSize >= 5) {
    tasks.push(createTask(taskId++, 'Security Awareness Training',
      'Conduct cybersecurity training for all employees',
      'cyberSecurity', 'medium', 5,
      { penalty: 'Medium - Human error risk', cost: '₹5,000-₹20,000', time: '1-2 days' }));
  }

  // Security Audit
  if (companyProfile.teamSize >= 20 || companyProfile.industry === 'Technology') {
    tasks.push(createTask(taskId++, 'Cybersecurity Audit',
      'Professional penetration testing and security assessment',
      'cyberSecurity', 'high', 8,
      { penalty: 'High - Undetected vulnerabilities', cost: '₹50,000-₹200,000', time: '7-14 days' }));
  }

  // Data Backup
  tasks.push(createTask(taskId++, 'Data Backup & Recovery Plan',
    'Implement automated backups and disaster recovery procedures',
    'cyberSecurity', 'high', 7,
    { penalty: 'Critical - Data loss', cost: '₹10,000-₹50,000', time: '2-5 days' }));

  return tasks;
}

/**
 * Create standardized task object
 */
function createTask(id, title, description, category, priority, scoreWeight, details) {
  return {
    id,
    title,
    description,
    category, // compliance, fundingReadiness, riskControl, operations, cyberSecurity
    priority, // critical, high, medium, low
    status: 'not-started', // not-started, in-progress, completed
    scoreWeight, // How much this affects the category score
    details: {
      whyItMatters: description,
      penaltyRisk: details.penalty,
      estimatedCost: details.cost,
      estimatedTime: details.time
    },
    completedDate: null,
    createdDate: new Date().toISOString(),
    dueDate: null // Can be calculated based on priority
  };
}

/**
 * Get critical tasks (top 5 most important incomplete)
 */
export function getCriticalTasks(tasks) {
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      const aPriority = priorityWeight[a.priority] || 0;
      const bPriority = priorityWeight[b.priority] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.scoreWeight - a.scoreWeight;
    })
    .slice(0, 5);
}

/**
 * Get next 7-day action plan
 */
export function getWeeklyActionPlan(tasks) {
  const incompleteTasks = tasks.filter(task => task.status !== 'completed');
  const criticalTasks = getCriticalTasks(tasks);
  
  // Get 3 most actionable tasks
  return criticalTasks.slice(0, 3).map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    estimatedTime: task.details.estimatedTime,
    priority: task.priority
  }));
}

export default {
  generateTasksFromProfile,
  getCriticalTasks,
  getWeeklyActionPlan
};
