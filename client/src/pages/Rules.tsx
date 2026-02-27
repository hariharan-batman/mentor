import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Loader2, FileCheck } from 'lucide-react';

export const Rules: React.FC = () => {
  const { companyData } = useAppContext();
  const [guidance, setGuidance] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      const result = await api.getComplianceGuidance();
      if (result.success) {
        setGuidance(result.guidance);
      }
    } catch (error) {
      console.error('Error fetching compliance guidance:', error);
      setGuidance('Failed to load compliance guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyData.name) {
      fetchGuidance();
    }
  }, [companyData.name]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" /> Rules & Compliance
          </h1>
          <p className="text-slate-500 mt-1">
            Legal obligations, regulatory requirements, and compliance checklist tailored to your business.
          </p>
        </div>
        <button
          onClick={fetchGuidance}
          disabled={loading || !companyData.name}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <FileCheck size={18} />}
          Refresh
        </button>
      </div>

      {!companyData.name && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900">Complete Your Company Profile First</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Compliance requirements vary by company type, industry, and location. Please complete your profile.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="ml-3 text-slate-600">Generating compliance guidance...</span>
          </div>
        ) : guidance ? (
          <div>
            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-indigo-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-indigo-900">Compliance Checklist for {companyData.name}</h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    {companyData.companyType} • {companyData.industry} • {companyData.location}
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: guidance
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br/>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
              }}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <ShieldCheck size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Compliance Guidance Available</h3>
            <p>Complete your company profile to get personalized compliance and legal requirements.</p>
          </div>
        )}
      </Card>

      {guidance && (
        <Card className="bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ Important Reminders</h3>
          <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
            <li>Mark all compliance deadlines on your calendar</li>
            <li>Set up reminders 2 weeks before each deadline</li>
            <li>Maintain a compliance tracker spreadsheet</li>
            <li>Keep all documents organized and easily accessible</li>
            <li>Consult with a CA or legal advisor for complex matters</li>
            <li>Non-compliance can result in penalties and legal issues</li>
          </ul>
        </Card>
      )}
    </div>
  );
};
