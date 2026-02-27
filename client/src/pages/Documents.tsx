import React, { useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { FileText, Download, Loader2, FileSignature, Presentation, Banknote, FileCheck } from 'lucide-react';

const DOCUMENT_TYPES = [
  { name: 'NDA (Non-Disclosure Agreement)', icon: FileSignature, description: 'Protect confidential information' },
  { name: 'Founder Agreement', icon: FileCheck, description: 'Define equity, roles, and responsibilities' },
  { name: 'Employment Contract', icon: FileText, description: 'Formal employment terms and conditions' },
  { name: 'Service Agreement', icon: FileCheck, description: 'Client/vendor service contracts' },
  { name: 'Pitch Deck', icon: Presentation, description: 'Investor presentation (13-slide template)' },
  { name: 'Loan Letter', icon: Banknote, description: 'Bank loan application letter' }
];

export const Documents: React.FC = () => {
  const { companyData } = useAppContext();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [document, setDocument] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (docType: string) => {
    setSelectedDoc(docType);
    setDocument('');
    setLoading(true);

    try {
      const result = await api.generateDocument(docType);
      if (result.success) {
        setDocument(result.document);
      } else {
        setDocument('Failed to generate document. Please try again.');
      }
    } catch (error) {
      setDocument('Error generating document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!document || !selectedDoc) return;

    const blob = new Blob([document], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-indigo-600" /> Document Generator
        </h1>
        <p className="text-slate-500 mt-1">
          Generate AI-powered legal documents, agreements, and presentations customized for your startup.
        </p>
      </div>

      {!companyData.name && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900">Complete Your Company Profile First</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Documents are personalized using your company details. Please complete your profile first.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Types */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Available Documents</h2>
          {DOCUMENT_TYPES.map((docType) => {
            const Icon = docType.icon;
            const isSelected = selectedDoc === docType.name;
            
            return (
              <button
                key={docType.name}
                onClick={() => handleGenerate(docType.name)}
                disabled={!companyData.name}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={24} className={isSelected ? 'text-indigo-600' : 'text-slate-600'} />
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {docType.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{docType.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Document Preview */}
        <div className="lg:col-span-2">
          <Card>
            {!selectedDoc ? (
              <div className="text-center py-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a Document Type</h3>
                <p>Choose from the list to generate a customized document for your startup.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedDoc}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Generated for: <strong>{companyData.name || 'Your Company'}</strong>
                    </p>
                  </div>
                  {document && !loading && (
                    <button
                      onClick={handleDownload}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Download size={18} /> Download
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <span className="ml-3 text-slate-600">Generating document...</span>
                  </div>
                ) : document ? (
                  <div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800">
                        {document}
                      </pre>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>📝 Note:</strong> This is a template generated by AI. Please review carefully and customize as needed. 
                        Consider consulting with a legal professional before using any legal documents.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No document generated.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
