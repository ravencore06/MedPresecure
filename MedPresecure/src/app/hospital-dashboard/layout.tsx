'use client';

import React from 'react';
import { Sidebar } from '@/components/hospital/sidebar';
import { Header } from '@/components/hospital/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function HospitalDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <div className="flex flex-col min-h-screen bg-slate-50">
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
