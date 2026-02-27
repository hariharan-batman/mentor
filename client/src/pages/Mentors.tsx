import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { Users, Star, Briefcase, MapPin, Loader2, Sparkles, Award } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  bio: string;
  avatar?: string;
}

interface MentorMatch {
  name: string;
  score: number;
  reason: string;
}

export const Mentors: React.FC = () => {
  const { companyData } = useAppContext();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const result = await api.getMentors();
        if (result.mentors) {
          setMentors(result.mentors);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleGetMatches = async () => {
    setMatchLoading(true);
    try {
      const result = await api.getMentorMatch();
      if (result.success && result.matches) {
        setMatches(result.matches.matches || []);
      }
    } catch (error) {
      console.error('Error getting mentor matches:', error);
    } finally {
      setMatchLoading(false);
    }
  };

  const getMentorMatch = (mentorName: string): MentorMatch | undefined => {
    return matches.find(m => m.name === mentorName);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Mentor Profiles
          </h1>
          <p className="text-slate-500 mt-1">
            Connect with experienced mentors to guide your startup journey.
          </p>
        </div>
        {companyData.name && (
          <button
            onClick={handleGetMatches}
            disabled={matchLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {matchLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            AI Match
          </button>
        )}
      </div>

      {!companyData.name && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900">Complete Your Company Profile</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Get AI-powered mentor matching by completing your company profile first.
              </p>
            </div>
          </div>
        </Card>
      )}

      {matches.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <Sparkles className="text-green-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">AI Matching Complete</h3>
              <p className="text-sm text-green-800 mt-1">
                Mentors are ranked by relevance to your startup's needs. Check the match scores below!
              </p>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="ml-3 text-slate-600">Loading mentors...</span>
          </div>
        </Card>
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const match = getMentorMatch(mentor.name);
            
            return (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {mentor.avatar && (
                      <img 
                        src={mentor.avatar} 
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
                      <p className="text-sm text-slate-500">{mentor.specialization}</p>
                    </div>
                  </div>
                  {match && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-bold">
                      {match.score}% Match
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(mentor.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}
                    />
                  ))}
                  <span className="text-sm text-slate-600 ml-1">({mentor.rating})</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Award size={16} className="text-slate-400" />
                    <span>{mentor.experienceYears} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase size={16} className="text-slate-400" />
                    <span>{mentor.specialization}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{mentor.bio}</p>

                {match && match.reason && (
                  <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                    <strong>Why matched:</strong> {match.reason}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Available for consultation</span>
                  <button className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                    Book Session
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Mentors Available</h3>
            <p>Check back soon for mentor profiles.</p>
          </div>
        </Card>
      )}
    </div>
  );
};
