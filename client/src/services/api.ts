const API_URL = '/api';

export const api = {
    // Health
    checkHealth: async () => {
        const res = await fetch(`${API_URL}/health`);
        return res.json();
    },

    // Company
    getCompany: async () => {
        const res = await fetch(`${API_URL}/company`);
        return res.json();
    },
    saveCompany: async (data: any) => {
        const res = await fetch(`${API_URL}/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Tasks & Scores
    getTasks: async () => {
        const res = await fetch(`${API_URL}/tasks`);
        return res.json();
    },
    getCriticalTasks: async () => {
        const res = await fetch(`${API_URL}/tasks/critical`);
        return res.json();
    },
    getWeeklyPlan: async () => {
        const res = await fetch(`${API_URL}/tasks/weekly-plan`);
        return res.json();
    },
    getScores: async () => {
        const res = await fetch(`${API_URL}/tasks/scores`);
        return res.json();
    },
    completeTask: async (id: string) => {
        const res = await fetch(`${API_URL}/tasks/${id}/complete`, { method: 'POST' });
        return res.json();
    },

    // AI Services
    runDiagnostic: async () => {
        const res = await fetch(`${API_URL}/ai/diagnostic`, { method: 'POST' });
        return res.json();
    },
    getDiagnostic: async () => {
        const res = await fetch(`${API_URL}/ai/diagnostic`);
        return res.json();
    },
    chatWithAI: async (message: string) => {
        const res = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        return res.json();
    },
    getChatHistory: async () => {
        const res = await fetch(`${API_URL}/ai/chat`);
        return res.json();
    },
    generateRoadmap: async (ideaData: any) => {
        const res = await fetch(`${API_URL}/ai/comprehensive-roadmap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ideaData),
        });
        return res.json();
    },

    // NEW: Topic Advice (14 topics)
    getTopicAdvice: async (topic: string) => {
        const res = await fetch(`${API_URL}/ai/topic-advice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic }),
        });
        return res.json();
    },

    // NEW: Personalized Roadmap (90 days)
    getPersonalizedRoadmap: async (completedTopics: string[]) => {
        const res = await fetch(`${API_URL}/ai/personalized-roadmap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completedTopics }),
        });
        return res.json();
    },

    // NEW: Financial Guidance
    getFinancialGuidance: async () => {
        const res = await fetch(`${API_URL}/ai/financial-guidance`);
        return res.json();
    },

    // NEW: Compliance Guidance
    getComplianceGuidance: async () => {
        const res = await fetch(`${API_URL}/ai/compliance-guidance`);
        return res.json();
    },

    // NEW: Generate Document
    generateDocument: async (documentType: string) => {
        const res = await fetch(`${API_URL}/ai/generate-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentType }),
        });
        return res.json();
    },

    // NEW: Mentor Matching
    getMentorMatch: async () => {
        const res = await fetch(`${API_URL}/ai/mentor-match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        return res.json();
    },

    // Mentors
    getMentors: async () => {
        const res = await fetch(`${API_URL}/mentors`);
        return res.json();
    },
};

