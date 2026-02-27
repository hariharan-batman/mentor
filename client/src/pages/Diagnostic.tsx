import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { useAppContext } from '../context/AppContext';
import { Activity, Play, CheckCircle, AlertCircle, TrendingUp, DollarSign, Shield, Briefcase } from 'lucide-react';

export const Diagnostic: React.FC = () => {
    const { topicProgress, healthScores, completionPercentage } = useAppContext();
    const [result, setResult] = useState<any>(null);
    const [running, setRunning] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDiagnostic()
            .then(res => setResult(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const runAnalysis = async () => {
        setRunning(true);
        try {
            const res = await api.runDiagnostic();
            if (res.success && res.data) {
                setResult(res.data);
            } else {
                setResult(res);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRunning(false);
        }
    };

    // Calculate readiness and funding scores based on topic completion
    const readinessScore = completionPercentage; // Overall completion
    const fundingScore = healthScores.funding; // Funding-specific topics

    if (loading) return <div className="p-8"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Activity className="text-indigo-600" /> AI Diagnostic</h1>
                    <p className="text-slate-500 mt-1">Your readiness and funding scores update as you complete topics.</p>
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={running}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {running ? <span className="animate-spin text-xl">⏳</span> : <Play size={18} />}
                    {running ? 'Analyzing...' : 'Run Detailed Analysis'}
                </button>
            </div>

            {/* Always show dynamic scores based on topic completion */}
            <div className="space-y-6">
                {/* Dynamic Scores Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-600 mb-1">Readiness Score</h3>
                                <p className="text-4xl font-bold text-indigo-600">{readinessScore}<span className="text-2xl text-slate-500">/100</span></p>
                                <p className="text-xs text-slate-500 mt-2">Based on {completionPercentage}% topics completed</p>
                            </div>
                            <TrendingUp className="text-indigo-400" size={48} />
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-600 mb-1">Funding Score</h3>
                                <p className="text-4xl font-bold text-green-600">{fundingScore}<span className="text-2xl text-slate-500">/100</span></p>
                                <p className="text-xs text-slate-500 mt-2">Complete Fund & Loans topics</p>
                            </div>
                            <DollarSign className="text-green-400" size={48} />
                        </div>
                    </Card>
                </div>

                {completionPercentage === 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <div className="flex items-start gap-3">
                            <div className="text-yellow-600 mt-1">💡</div>
                            <div>
                                <h3 className="font-semibold text-yellow-900">Start Completing Topics to Increase Scores</h3>
                                <p className="text-sm text-yellow-800 mt-1">
                                    Visit the <strong>Topics</strong> page to get AI guidance and mark topics as complete. Your scores will update automatically!
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {result && (
                    <>
                        {/* Compliance Checklist */}
                        <Card title="Compliance Checklist">
                            <ul className="space-y-2">
                                {result.complianceChecklist?.map((item: string, i: number) => (
                                    <li key={i} className="flex gap-2 items-start text-sm">
                                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Required Licenses */}
                        <Card title="Required Licenses">
                            <div className="flex flex-wrap gap-2">
                                {result.requiredLicenses?.map((license: string, i: number) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {license}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Risk Analysis */}
                        <Card title="Risk Analysis">
                            <div className="space-y-4">
                                {result.riskAnalysis && Object.entries(result.riskAnalysis).map(([key, value]: [string, any]) => (
                                    <div key={key} className="border-l-4 border-orange-300 pl-4 py-2">
                                        <h4 className="font-semibold text-slate-800 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </h4>
                                        <p className="text-sm text-slate-600 mt-1">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Funding Opportunities */}
                        <Card title="Funding Opportunities">
                            <ul className="space-y-2">
                                {result.fundingOpportunities?.map((opportunity: string, i: number) => (
                                    <li key={i} className="flex gap-2 items-start text-sm">
                                        <span className="text-green-500 mt-0.5 shrink-0">💰</span>
                                        <span>{opportunity}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* 90-Day Action Plan */}
                        <Card title="90-Day Action Plan">
                            <div className="space-y-4">
                                {result.actionPlan90Days?.map((item: any, i: number) => (
                                    <div key={i} className="border-l-2 border-indigo-200 pl-4 py-2">
                                        <h4 className="font-semibold text-slate-800">Week {item.week}</h4>
                                        <p className="text-sm text-slate-600 mt-1">{item.action}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {result.lastRun && (
                            <p className="text-xs text-slate-400 text-center">
                                Last detailed analysis: {new Date(result.lastRun).toLocaleString()}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
