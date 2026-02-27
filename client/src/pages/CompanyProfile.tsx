import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Building2, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CompanyProfile: React.FC = () => {
    const { refreshData } = useAppContext();
    const [data, setData] = useState<any>({
        name: '', 
        companyType: '', 
        industry: '', 
        stage: '', 
        fundingStatus: '', 
        teamSize: '', 
        location: '', 
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.getCompany()
            .then(res => {
                if (res) {
                    setData({
                        name: res.name || '',
                        companyType: res.companyType || '',
                        industry: res.industry || '',
                        stage: res.stage || '',
                        fundingStatus: res.fundingStatus || '',
                        teamSize: res.teamSize || '',
                        location: res.location || '',
                        description: res.description || ''
                    });
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.saveCompany(data);
            await refreshData(); // Update context
            setMessage('✅ Profile saved successfully! All pages updated.');
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            setMessage('❌ Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="text-indigo-600" /> Company Details
                </h1>
                <p className="text-slate-500 mt-1">
                    Enter your company information once - used across all AI features, documents, and guidance.
                </p>
            </div>

            <Card>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                value={data.name || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                required 
                                placeholder="e.g., TechStartup Inc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Company Type <span className="text-red-500">*</span>
                            </label>
                            <select 
                                name="companyType" 
                                value={data.companyType || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                <option value="Partnership">Partnership</option>
                                <option value="LLP">LLP</option>
                                <option value="Private Limited">Private Limited</option>
                                <option value="Public Limited">Public Limited</option>
                                <option value="One Person Company">One Person Company</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Industry <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="industry" 
                                value={data.industry || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                required 
                                placeholder="e.g., SaaS, E-commerce, FinTech"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Stage <span className="text-red-500">*</span>
                            </label>
                            <select 
                                name="stage" 
                                value={data.stage || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Stage</option>
                                <option value="Idea">Idea</option>
                                <option value="Early Stage">Early Stage</option>
                                <option value="Pre-Revenue">Pre-Revenue</option>
                                <option value="Revenue">Revenue</option>
                                <option value="Growth">Growth</option>
                                <option value="Scaling">Scaling</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Funding Status <span className="text-red-500">*</span>
                            </label>
                            <select 
                                name="fundingStatus" 
                                value={data.fundingStatus || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Funding Status</option>
                                <option value="Bootstrapped">Bootstrapped</option>
                                <option value="Pre-Seed">Pre-Seed</option>
                                <option value="Seed">Seed</option>
                                <option value="Series A">Series A</option>
                                <option value="Series B+">Series B+</option>
                                <option value="Funded">Funded</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Team Size <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="teamSize" 
                                value={data.teamSize || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                required
                                placeholder="e.g., 1-5, 5-10, 10-25"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="location" 
                                value={data.location || ''} 
                                onChange={handleChange} 
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                required
                                placeholder="e.g., Bangalore, India"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea 
                            name="description" 
                            value={data.description || ''} 
                            onChange={handleChange} 
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Brief description of your company, what you do, and your primary goals..."
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Company Details'}
                        </button>
                        {message && (
                            <span className={`text-sm font-medium ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </span>
                        )}
                    </div>
                </form>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Why This Matters</h3>
                <p className="text-sm text-blue-800">
                    Your company details power all AI features in this platform. Once saved, this information is used to:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Generate personalized topic advice for all 14 mentorship areas</li>
                    <li>Create tailored 90-day roadmaps based on your stage</li>
                    <li>Provide industry-specific compliance guidance</li>
                    <li>Recommend suitable funding options</li>
                    <li>Generate customized documents (NDAs, pitch decks, etc.)</li>
                    <li>Match you with relevant mentors</li>
                </ul>
            </Card>
        </div>
    );
};
