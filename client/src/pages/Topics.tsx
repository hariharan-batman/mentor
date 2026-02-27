import React, { useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { useAppContext, TOPICS } from '../context/AppContext';
import { 
  DollarSign, 
  Target, 
  Calculator, 
  FileText, 
  Award, 
  Banknote, 
  Shield, 
  FolderKanban, 
  Lock, 
  Building, 
  Plane, 
  FileSignature, 
  Network, 
  Headphones,
  CheckCircle,
  Loader2,
  Lightbulb
} from 'lucide-react';

// Map topics to icons
const topicIcons: { [key: string]: any } = {
  'Fund': DollarSign,
  'Strategic': Target,
  'Taxation': Calculator,
  'Land / Legal': FileText,
  'Licence': Award,
  'Loans': Banknote,
  'Risk Management': Shield,
  'Project Management': FolderKanban,
  'Cyber Security': Lock,
  'Registration / Structure': Building,
  'Export': Plane,
  'NDA / Exit': FileSignature,
  'Industrial Connect': Network,
  'Customer Support': Headphones
};

export const Topics: React.FC = () => {
  const { companyData, topicProgress, markTopicComplete } = useAppContext();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTopicClick = async (topic: string) => {
    setSelectedTopic(topic);
    setAdvice('');
    setLoading(true);

    try {
      const result = await api.getTopicAdvice(topic);
      if (result.success) {
        setAdvice(result.advice);
      } else {
        setAdvice('Failed to load advice. Please try again.');
      }
    } catch (error) {
      setAdvice('Error loading advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = () => {
    if (selectedTopic) {
      markTopicComplete(selectedTopic);
    }
  };

  const isCompleted = (topic: string) => topicProgress[topic];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="text-indigo-600" /> AI Topics Advisor
        </h1>
        <p className="text-slate-500 mt-1">
          Select a topic to get personalized AI guidance for your startup. Mark topics as completed to track your progress.
        </p>
      </div>

      {!companyData.name && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900">Complete Your Company Profile First</h3>
              <p className="text-sm text-yellow-800 mt-1">
                To get personalized AI advice, please fill out your company details on the Company Profile page.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Topic Buttons */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">14 Mentorship Topics</h2>
          {TOPICS.map((topic) => {
            const Icon = topicIcons[topic] || Target;
            const completed = isCompleted(topic);
            
            return (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group ${
                  selectedTopic === topic
                    ? 'border-indigo-600 bg-indigo-50'
                    : completed
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${
                    selectedTopic === topic 
                      ? 'text-indigo-600' 
                      : completed 
                      ? 'text-green-600' 
                      : 'text-slate-600 group-hover:text-indigo-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`font-medium ${
                    selectedTopic === topic 
                      ? 'text-indigo-900' 
                      : completed 
                      ? 'text-green-900' 
                      : 'text-slate-900'
                  }`}>
                    {topic}
                  </span>
                </div>
                {completed && (
                  <CheckCircle size={20} className="text-green-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Advice Display */}
        <div className="lg:col-span-2">
          <Card>
            {!selectedTopic ? (
              <div className="text-center py-12 text-slate-500">
                <Lightbulb size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a Topic to Begin</h3>
                <p>Click on any of the 14 topics to receive AI-powered guidance tailored to your company.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      {React.createElement(topicIcons[selectedTopic] || Target, { 
                        size: 28, 
                        className: 'text-indigo-600' 
                      })}
                      {selectedTopic}
                    </h2>
                    {isCompleted(selectedTopic) && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-700 mt-2 bg-green-100 px-3 py-1 rounded-full">
                        <CheckCircle size={16} /> Completed
                      </span>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <span className="ml-3 text-slate-600">Generating personalized advice...</span>
                  </div>
                ) : advice ? (
                  <div>
                    <div 
                      className="prose prose-slate max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{ 
                        __html: advice.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                      }}
                    />
                    
                    {!isCompleted(selectedTopic) && (
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <button
                          onClick={handleMarkComplete}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle size={18} /> Mark as Completed
                        </button>
                        <p className="text-xs text-slate-500 mt-2">
                          Marking this topic as complete updates your dashboard progress.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No advice available.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
