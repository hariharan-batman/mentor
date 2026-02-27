import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
    return (
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
            <div className="flex items-center w-full max-w-md bg-slate-100 rounded-lg px-3 py-2">
                <Search size={18} className="text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search tools, mentors, or documents..."
                    className="bg-transparent border-none outline-none w-full text-sm"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="text-slate-500 hover:text-indigo-600 relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer border-l pl-4 border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        P
                    </div>
                    <span className="text-sm font-medium">Founder Demo</span>
                </div>
            </div>
        </header>
    );
};
