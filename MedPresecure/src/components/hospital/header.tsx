'use client';

import { Bell, Search, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
}

export function Header({ title, showSearch = true }: HeaderProps) {
    const pathname = usePathname();

    // Determine title based on path if not provided
    const getTitle = () => {
        if (title) return title;
        if (pathname.includes('/doctors')) return 'Doctors Directory';
        if (pathname.includes('/appointments')) return 'Patient Appointments';
        if (pathname.includes('/prescriptions')) return 'Issue Prescription';
        if (pathname.includes('/settings')) return 'Hospital Settings';
        return 'Hospital Overview';
    };

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-teal-600 hover:bg-teal-50" />
                <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
            </div>

            <div className="flex items-center gap-4">
                {showSearch && (
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search patients, doctors, ID..."
                            className="w-80 pl-11 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500/20 shadow-sm transition-smooth"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {pathname === '/hospital-dashboard' && (
                        <Button className="hidden md:flex bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-smooth gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Quick Action
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-smooth"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                    </Button>

                    <div className="flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 leading-none">Dr. Alex Morgan</p>
                            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider mt-1">Cardiology Dept.</p>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-smooth ring-2 ring-slate-50">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                            <AvatarFallback className="bg-cyan-500 text-white font-bold">AM</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
}
