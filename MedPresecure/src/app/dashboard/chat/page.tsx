'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    LogOut,
    Menu,
} from 'lucide-react';

import { useUser } from '@/firebase';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarInset,
    SidebarFooter,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/dashboard/chat/chat-interface';

export default function ChatPage() {
    const { user, isUserLoading, auth } = useUser();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    if (isUserLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;

    if (!user) {
        router.push('/');
        return null;
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="text-lg font-semibold">Aarogyam</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => handleNavigation('/dashboard')}>Dashboard</SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => handleNavigation('/dashboard/prescriptions')}>Prescriptions</SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => handleNavigation('/dashboard/appointments')}>Appointments</SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => handleNavigation('/dashboard/doctors')}>Doctors</SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            {/* Active state for Chat */}
                            <SidebarMenuButton isActive onClick={() => handleNavigation('/dashboard/chat')}>AI Health Assistant</SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => handleNavigation('/dashboard/settings')}>Settings</SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarSeparator />
                    <div className="flex items-center gap-3 p-2">
                        <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/300" alt="User avatar" />
                            <AvatarFallback>SN</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">Sarah Noor</p>
                            <p className="text-xs text-muted-foreground">Patient ID: {user.uid.slice(0, 7)}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => auth?.signOut()}><LogOut className="w-5 h-5" /></Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-col min-h-screen bg-slate-50">
                    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold">Health Assistant</h1>
                        </div>
                    </header>
                    <main className="flex-1 p-6 relative">
                        <ChatInterface />
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
