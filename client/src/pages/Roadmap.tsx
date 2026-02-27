import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { Map, Loader2, Calendar, CheckCircle } from 'lucide-react';

interface Milestone {
  milestone: string;
  description: string;
  priority: string;
}

interface RoadmapData {
  days30: Milestone[];
  days60: Milestone[];
  days90: Milestone[];
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const colors = {
    High: 'bg-red-100 text-red-800 border-red-300',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Low: 'bg-green-100 text-green-800 border-green-300'
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colors[priority as keyof typeof colors] || colors.Medium}`}>
      {priority}
    </span>
  );
};

export const Roadmap: React.FC = () => {
  const { companyData, topicProgress } = useAppContext();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);

  const completedTopics = Object.keys(topicProgress).filter(topic => topicProgress[topic]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const result = await api.getPersonalizedRoadmap(completedTopics);
      if (result.success) {
        setRoadmap(result.roadmap);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyData.name) {
      fetchRoadmap();
    }
  }, [companyData.name]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="text-indigo-600" /> 90-Day Roadmap
          </h1>
          <p className="text-slate-500 mt-1">
            Personalized milestone plan based on your company profile and completed topics.
          </p>
        </div>
        <button
          onClick={fetchRoadmap}
          disabled={loading || !companyData.name}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
          Regenerate
        </button>
      </div>

      {!companyData.name && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900">Complete Your Company Profile First</h3>
              <p className="text-sm text-yellow-800 mt-1">
                The roadmap is personalized based on your company details and progress. Please complete your profile.
              </p>
            </div>
          </div>
        </Card>
      )}

      {completedTopics.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">
                {completedTopics.length} Topic{completedTopics.length !== 1 ? 's' : ''} Completed
              </h3>
              <p className="text-sm text-green-800 mt-1">
                {completedTopics.join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {loading && !roadmap ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="ml-3 text-slate-600">Generating your personalized roadmap...</span>
          </div>
        </Card>
      ) : roadmap ? (
        <div className="space-y-6">
          {/* 30 Days */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-indigo-600 rounded"></div>
              Days 1-30: Foundation
            </h2>
            <div className="space-y-3">
              {roadmap.days30.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{item.milestone}</h3>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 60 Days */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-purple-600 rounded"></div>
              Days 31-60: Growth
            </h2>
            <div className="space-y-3">
              {roadmap.days60.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{item.milestone}</h3>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 90 Days */}
          <Card>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-green-600 rounded"></div>
              Days 61-90: Scale
            </h2>
            <div className="space-y-3">
              {roadmap.days90.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{item.milestone}</h3>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-slate-500">
            <Map size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Roadmap Generated</h3>
            <p>Complete your company profile to generate a personalized 90-day roadmap.</p>
          </div>
        </Card>
      )}
    </div>
  );
};
