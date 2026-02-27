import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

// 14 Mentorship Topics
export const TOPICS = [
  'Fund',
  'Strategic',
  'Taxation',
  'Land / Legal',
  'Licence',
  'Loans',
  'Risk Management',
  'Project Management',
  'Cyber Security',
  'Registration / Structure',
  'Export',
  'NDA / Exit',
  'Industrial Connect',
  'Customer Support'
];

interface CompanyData {
  name: string;
  companyType: string;
  industry: string;
  stage: string;
  fundingStatus: string;
  teamSize: string;
  location: string;
  description: string;
}

interface TopicProgress {
  [key: string]: boolean;
}

interface HealthScores {
  overall: number;
  compliance: number;
  funding: number;
  risk: number;
  operations: number;
  cyber: number;
}

interface AppContextType {
  companyData: CompanyData;
  setCompanyData: (data: CompanyData) => void;
  topicProgress: TopicProgress;
  markTopicComplete: (topic: string) => void;
  completionPercentage: number;
  healthScores: HealthScores;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    companyType: '',
    industry: '',
    stage: '',
    fundingStatus: '',
    teamSize: '',
    location: '',
    description: ''
  });

  const [topicProgress, setTopicProgress] = useState<TopicProgress>(() => {
    const initial: TopicProgress = {};
    TOPICS.forEach(topic => {
      initial[topic] = false;
    });
    return initial;
  });

  // Load company data on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const data = await api.getCompany();
      if (data) {
        setCompanyData({
          name: data.name || '',
          companyType: data.companyType || '',
          industry: data.industry || '',
          stage: data.stage || '',
          fundingStatus: data.fundingStatus || '',
          teamSize: data.teamSize || '',
          location: data.location || '',
          description: data.description || ''
        });
      }
    } catch (error) {
      console.error('Failed to load company data:', error);
    }
  };

  const markTopicComplete = (topic: string) => {
    setTopicProgress(prev => ({
      ...prev,
      [topic]: true
    }));
  };

  const completionPercentage = Math.round(
    (Object.values(topicProgress).filter(Boolean).length / TOPICS.length) * 100
  );

  // Calculate Health Scores based on completed topics
  const calculateHealthScores = (): HealthScores => {
    // Define topic mappings to health categories
    const complianceTopics = ['Land / Legal', 'Licence', 'Registration / Structure', 'NDA / Exit', 'Taxation'];
    const fundingTopics = ['Fund', 'Loans'];
    const riskTopics = ['Risk Management', 'Taxation'];
    const operationsTopics = ['Project Management', 'Strategic', 'Industrial Connect', 'Customer Support'];
    const cyberTopics = ['Cyber Security'];

    // Calculate score for each category (percentage of completed topics)
    const calculateCategoryScore = (topics: string[]) => {
      const completed = topics.filter(topic => topicProgress[topic]).length;
      return Math.round((completed / topics.length) * 100);
    };

    const compliance = calculateCategoryScore(complianceTopics);
    const funding = calculateCategoryScore(fundingTopics);
    const risk = calculateCategoryScore(riskTopics);
    const operations = calculateCategoryScore(operationsTopics);
    const cyber = calculateCategoryScore(cyberTopics);

    // Overall health is the average of all categories
    const overall = Math.round((compliance + funding + risk + operations + cyber) / 5);

    return {
      overall,
      compliance,
      funding,
      risk,
      operations,
      cyber
    };
  };

  const healthScores = calculateHealthScores();

  const value: AppContextType = {
    companyData,
    setCompanyData,
    topicProgress,
    markTopicComplete,
    completionPercentage,
    healthScores,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
