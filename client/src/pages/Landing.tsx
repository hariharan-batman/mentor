import React from 'react';

export const Landing: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center px-4">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
                FounderDock AI
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
                Your Complete Startup Operating System. Get AI diagnostics, actionable roadmaps, and instantly generate the legal documents you need.
            </p>
            <div className="flex gap-4">
                <a href="/dashboard" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Go to Dashboard
                </a>
                <a href="/startup-analyzer" className="bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
                    Analyze My Idea
                </a>
            </div>
        </div>
    );
};
