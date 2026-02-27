export function calculateReadinessScore(companyProfile) {
  let score = 0;
  
  // Base score by stage
  const stageScores = {
    'Idea': 30,
    'Validation': 50,
    'MVP': 65,
    'Growth': 80
  };
  score = stageScores[companyProfile.stage] || 30;
  
  // Additional factors
  if (companyProfile.revenue > 0) score += 10;
  if (companyProfile.teamSize > 3) score += 5;
  if (companyProfile.isRegistered) score += 10;
  
  return Math.min(score, 100);
}

export function calculateFundingScore(companyProfile) {
  let score = 40; // Base score
  
  if (companyProfile.stage === 'MVP' || companyProfile.stage === 'Growth') {
    score += 20;
  }
  
  if (companyProfile.revenue > 100000) score += 15;
  if (companyProfile.revenue > 500000) score += 10;
  if (companyProfile.teamSize >= 5) score += 10;
  if (companyProfile.isRegistered) score += 5;
  
  return Math.min(score, 100);
}

export function calculateScores(companyProfile) {
  return {
    readinessScore: calculateReadinessScore(companyProfile),
    fundingScore: calculateFundingScore(companyProfile)
  };
}

/**
 * Calculate category score based on completed tasks
 */
export function calculateCategoryScore(tasks, category) {
  const categoryTasks = tasks.filter(t => t.category === category);
  
  if (categoryTasks.length === 0) return 0;
  
  const totalWeight = categoryTasks.reduce((sum, task) => sum + task.scoreWeight, 0);
  const completedWeight = categoryTasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.scoreWeight, 0);
  
  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

/**
 * Calculate all health scores dynamically based on task completion
 */
export function calculateHealthScores(tasks) {
  return {
    compliance: calculateCategoryScore(tasks, 'compliance'),
    fundingReadiness: calculateCategoryScore(tasks, 'fundingReadiness'),
    riskControl: calculateCategoryScore(tasks, 'riskControl'),
    operations: calculateCategoryScore(tasks, 'operations'),
    cyberSecurity: calculateCategoryScore(tasks, 'cyberSecurity')
  };
}

/**
 * Calculate overall startup health score
 */
export function calculateOverallScore(healthScores) {
  const weights = {
    compliance: 0.20,
    fundingReadiness: 0.25,
    riskControl: 0.20,
    operations: 0.20,
    cyberSecurity: 0.15
  };
  
  const overall = 
    healthScores.compliance * weights.compliance +
    healthScores.fundingReadiness * weights.fundingReadiness +
    healthScores.riskControl * weights.riskControl +
    healthScores.operations * weights.operations +
    healthScores.cyberSecurity * weights.cyberSecurity;
  
  return Math.round(overall);
}

/**
 * Calculate what's missing for next score milestone
 */
export function calculateScoreGaps(tasks, healthScores) {
  const gaps = {};
  const categories = ['compliance', 'fundingReadiness', 'riskControl', 'operations', 'cyberSecurity'];
  
  categories.forEach(category => {
    const categoryTasks = tasks.filter(t => t.category === category && t.status !== 'completed');
    const currentScore = healthScores[category];
    const nextMilestone = Math.ceil(currentScore / 10) * 10 + 10;
    
    const improvementTasks = categoryTasks
      .sort((a, b) => b.scoreWeight - a.scoreWeight)
      .slice(0, 3)
      .map(task => ({
        id: task.id,
        title: task.title,
        impact: task.scoreWeight,
        priority: task.priority
      }));
    
    gaps[category] = {
      currentScore,
      nextMilestone: Math.min(nextMilestone, 100),
      tasksToImprove: improvementTasks,
      potentialGain: improvementTasks.reduce((sum, t) => sum + t.impact, 0)
    };
  });
  
  return gaps;
}

/**
 * Calculate funding readiness message
 */
export function getFundingReadinessMessage(fundingScore, gaps) {
  if (fundingScore >= 80) {
    return {
      message: "You are ready for institutional funding!",
      stage: "Series A/B Ready",
      color: "green"
    };
  } else if (fundingScore >= 60) {
    return {
      message: `You are ${fundingScore}% ready for seed funding.`,
      stage: "Seed Ready",
      color: "blue",
      improvements: gaps.fundingReadiness.tasksToImprove
    };
  } else if (fundingScore >= 40) {
    return {
      message: `You are ${fundingScore}% ready for angel investment.`,
      stage: "Angel Ready",
      color: "yellow",
      improvements: gaps.fundingReadiness.tasksToImprove
    };
  } else {
    return {
      message: "Focus on building foundation before fundraising.",
      stage: "Not Ready",
      color: "red",
      improvements: gaps.fundingReadiness.tasksToImprove
    };
  }
}

/**
 * Calculate gamification progress
 */
export function calculateGamification(tasks) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const tasksCompletedCount = completedTasks.length;
  
  const xpValues = { critical: 100, high: 75, medium: 50, low: 25 };
  const totalXP = completedTasks.reduce((sum, task) => {
    return sum + (xpValues[task.priority] || 25);
  }, 0);
  
  const level = Math.floor(totalXP / 500) + 1;
  
  const badges = [];
  if (tasksCompletedCount >= 5) badges.push({ name: "Getting Started", icon: "🌱" });
  if (tasksCompletedCount >= 10) badges.push({ name: "Task Master", icon: "⭐" });
  if (tasksCompletedCount >= 20) badges.push({ name: "Execution Expert", icon: "🚀" });
  if (tasksCompletedCount >= 50) badges.push({ name: "Founder Pro", icon: "👑" });
  
  return {
    completionStreak: 0,
    tasksCompleted: tasksCompletedCount,
    badges,
    level,
    xp: totalXP
  };
}

/**
 * Complete calculation package - Main function used by tasks router
 */
export function calculateCompleteScoring(tasks) {
  const healthScores = calculateHealthScores(tasks);
  const overallScore = calculateOverallScore(healthScores);
  const gaps = calculateScoreGaps(tasks, healthScores);
  const fundingMessage = getFundingReadinessMessage(healthScores.fundingReadiness, gaps);
  const gamification = calculateGamification(tasks);
  
  return {
    healthScores: {
      compliance: healthScores.compliance,
      fundingReadiness: healthScores.fundingReadiness,
      riskControl: healthScores.riskControl,
      operations: healthScores.operations,
      cyberSecurity: healthScores.cyberSecurity,
      overall: overallScore
    },
    gaps,
    fundingMessage,
    gamification,
    lastCalculated: new Date().toISOString()
  };
}
