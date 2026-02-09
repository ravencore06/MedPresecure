'use client';

import {
    Sidebar as SidebarContainer,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Building2,
    LayoutDashboard,
    FileText,
    Calendar,
    Users,
    Settings,
    LogOut,
    UserPlus,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, auth } = useUser();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <SidebarContainer className="border-r shadow-sm">
            <SidebarHeader>
                <div className="flex items-center gap-3 px-6 py-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500 shadow-lg">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">MedPreserve</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3">
                <SidebarMenu className="space-y-1.5 pt-4">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => handleNavigation('/hospital-dashboard/prescriptions')}
                            isActive={isActive('/hospital-dashboard/prescriptions')}
                            tooltip="Prescriptions"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/hospital-dashboard/prescriptions')
                                    ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>Prescriptions</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => handleNavigation('/hospital-dashboard/appointments')}
                            isActive={isActive('/hospital-dashboard/appointments')}
                            tooltip="Appointments"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/hospital-dashboard/appointments')
                                    ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Calendar className="w-5 h-5" />
                            <span>Appointments</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => handleNavigation('/hospital-dashboard/doctors')}
                            isActive={isActive('/hospital-dashboard/doctors')}
                            tooltip="Doctors Directory"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/hospital-dashboard/doctors')
                                    ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Doctors</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => handleNavigation('/hospital-dashboard/settings')}
                            isActive={isActive('/hospital-dashboard/settings')}
                            tooltip="Settings"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${isActive('/hospital-dashboard/settings')
                                    ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2 py-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`} />
                        <AvatarFallback className="bg-cyan-500 text-white font-bold">AM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-cyan-600 transition-colors">
                            Dr. Alex Morgan
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Cardiology Dept.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => auth?.signOut()}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </SidebarContainer>
    );
}
