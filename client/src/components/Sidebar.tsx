import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Building2, 
  Activity, 
  ShieldCheck, 
  DollarSign, 
  AlertTriangle, 
  Map, 
  MessageSquare, 
  Users, 
  FileText, 
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/company-profile', label: 'Company Details', icon: Building2 },
    { path: '/topics', label: 'Topics Advisor', icon: Lightbulb },
    { path: '/roadmap', label: 'Roadmap', icon: Map },
    { path: '/funds', label: 'Funds & Finance', icon: DollarSign },
    { path: '/rules', label: 'Rules & Compliance', icon: ShieldCheck },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/mentors', label: 'Mentors', icon: Users },
    { path: '/diagnostic', label: 'Diagnostic', icon: Activity },
    { path: '/ai-chat', label: 'AI Chat Mentor', icon: MessageSquare }
];

export const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-white border-r h-full flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center gap-2 font-bold text-xl mb-8 px-2 text-indigo-600">
                <Sparkles size={24} /> MentorDock
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                }`
                            }
                        >
                            <Icon size={18} />
                            <span className="text-sm">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};
