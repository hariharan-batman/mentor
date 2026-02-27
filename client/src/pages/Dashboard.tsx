import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { useAppContext, TOPICS } from '../context/AppContext';
import { Activity, ShieldCheck, DollarSign, AlertTriangle, Briefcase, Lock, Target, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { companyData, topicProgress, completionPercentage, healthScores } = useAppContext();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const scores = await api.getScores();
                setData(scores);
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const completedTopics = Object.keys(topicProgress).filter(topic => topicProgress[topic]);
    const remainingTopics = TOPICS.length - completedTopics.length;

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        {companyData.name ? `${companyData.name} - ${companyData.stage}` : 'Welcome to your dashboard'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500 font-medium">Overall Progress</div>
                    <div className="font-bold text-2xl text-indigo-600">{completionPercentage}%</div>
                </div>
            </div>

            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Target className="text-indigo-600" size={24} />
                            Mentorship Topics Progress
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {completedTopics.length} of {TOPICS.length} topics completed • {remainingTopics} remaining
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">{completionPercentage}%</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-indigo-200 mb-4">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>

                {/* Completed Topics */}
                {completedTopics.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            Completed Topics:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {completedTopics.map((topic) => (
                                <span 
                                    key={topic}
                                    className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium border border-green-300"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {remainingTopics > 0 && (
                    <div className="mt-4 p-3 bg-white bg-opacity-70 rounded-lg border border-indigo-200">
                        <p className="text-sm text-slate-700">
                            <strong>Next Steps:</strong> Visit the <strong>Topics</strong> page to explore and complete the remaining {remainingTopics} topic{remainingTopics !== 1 ? 's' : ''}.
                        </p>
                    </div>
                )}
            </Card>

            {/* Health Scores - Now Dynamic Based on Completed Topics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ScoreCard 
                    title="Overall Health" 
                    score={healthScores.overall} 
                    icon={Activity}
                    description="Average across all categories" 
                />
                <ScoreCard 
                    title="Compliance" 
                    score={healthScores.compliance} 
                    icon={ShieldCheck}
                    description="Legal, Licence, Registration, NDA topics" 
                />
                <ScoreCard 
                    title="Funding Readiness" 
                    score={healthScores.funding} 
                    icon={DollarSign}
                    description="Fund and Loans topics" 
                />
                <ScoreCard 
                    title="Risk Control" 
                    score={healthScores.risk} 
                    icon={AlertTriangle}
                    description="Risk Management and Taxation topics" 
                />
                <ScoreCard 
                    title="Operations" 
                    score={healthScores.operations} 
                    icon={Briefcase}
                    description="Project, Strategic, Industrial, Support topics" 
                />
                <ScoreCard 
                    title="Cyber Security" 
                    score={healthScores.cyber} 
                    icon={Lock}
                    description="Cyber Security topic" 
                />
            </div>

            {/* Critical Tasks and Activity */}
            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Card title="Critical Tasks">
                        {data.gaps?.length > 0 ? (
                            <ul className="space-y-3">
                                {data.gaps.slice(0, 5).map((gap: any, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm items-start">
                                        <span className="text-red-500 mt-0.5"><AlertTriangle size={16} /></span>
                                        <span>{gap.message}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500">No critical gaps identified.</p>
                        )}
                    </Card>

                    <Card title="Quick Actions">
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-3">
                                <Target className="text-indigo-600" size={20} />
                                <div>
                                    <div className="font-medium text-slate-900">Explore Topics</div>
                                    <div className="text-xs text-slate-600">Get AI guidance on {remainingTopics} topics</div>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition flex items-center gap-3">
                                <DollarSign className="text-green-600" size={20} />
                                <div>
                                    <div className="font-medium text-slate-900">View Funds</div>
                                    <div className="text-xs text-slate-600">Explore fundraising options</div>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center gap-3">
                                <ShieldCheck className="text-purple-600" size={20} />
                                <div>
                                    <div className="font-medium text-slate-900">Check Compliance</div>
                                    <div className="text-xs text-slate-600">Review legal requirements</div>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const ScoreCard: React.FC<{ title: string; score: number; icon: any; description?: string }> = ({ title, score, icon: Icon, description }) => (
    <Card className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-slate-700">{title}</h3>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600">
                <Icon size={20} />
            </div>
        </div>
        {description && (
            <p className="text-xs text-slate-500 mb-3">{description}</p>
        )}
        <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{score}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
        </div>
    </Card>
);
