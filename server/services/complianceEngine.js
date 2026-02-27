export function generateComplianceReport(companyProfile) {
  const compliance = {
    status: 'pending',
    completedItems: [],
    pendingItems: [],
    criticalItems: []
  };

  // Basic compliance items
  const items = [
    { name: 'Company Registration', critical: true, completed: companyProfile.isRegistered },
    { name: 'GST Registration', critical: true, completed: false },
    { name: 'PAN Registration', critical: true, completed: false },
    { name: 'Trade License', critical: false, completed: false },
    { name: 'MSME Registration', critical: false, completed: false },
    { name: 'Professional Tax', critical: false, completed: false }
  ];

  items.forEach(item => {
    if (item.completed) {
      compliance.completedItems.push(item.name);
    } else if (item.critical) {
      compliance.criticalItems.push(item.name);
    } else {
      compliance.pendingItems.push(item.name);
    }
  });

  compliance.status = compliance.criticalItems.length === 0 ? 'good' : 'needs-attention';

  return compliance;
}

export function getComplianceChecklist(industry) {
  const commonItems = [
    'Company incorporation documents',
    'PAN and TAN registration',
    'GST registration',
    'Professional tax registration',
    'Bank account opening',
    'Founder agreements',
    'Employment contracts'
  ];

  const industrySpecific = {
    'Food & Beverage': ['FSSAI license', 'Health trade license'],
    'Fintech': ['RBI approval', 'Payment gateway license'],
    'Healthcare': ['Medical establishment license', 'Drug license'],
    'E-commerce': ['E-commerce registration', 'Consumer protection compliance']
  };

  return [...commonItems, ...(industrySpecific[industry] || [])];
}
