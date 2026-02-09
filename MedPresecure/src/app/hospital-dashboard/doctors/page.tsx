'use client';

import React, { useState } from 'react';
import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    Calendar,
    UserPlus,
    Filter,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function HospitalDoctorsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { title: 'Total Doctors', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Available Today', value: '86', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'New This Month', value: '12', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const [doctors, setDoctors] = useState([
        {
            id: 'DOC-1024',
            name: 'Dr. Sarah Wilson',
            specialty: 'Cardiology',
            status: 'Available',
            email: 'sarah.wilson@med.co',
            phone: '+1 (555) 012-3456',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        {
            id: 'DOC-1025',
            name: 'Dr. James Carter',
            specialty: 'Neurology',
            status: 'On Leave',
            email: 'james.carter@med.co',
            phone: '+1 (555) 987-6543',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
        },
        {
            id: 'DOC-1026',
            name: 'Dr. Emily Chen',
            specialty: 'Pediatrics',
            status: 'In Surgery',
            email: 'emily.chen@med.co',
            phone: '+1 (555) 246-8101',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
        },
        {
            id: 'DOC-1027',
            name: 'Dr. Michael Ross',
            specialty: 'Orthopedics',
            status: 'Available',
            email: 'michael.ross@med.co',
            phone: '+1 (555) 777-9999',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
        }
    ]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Available': return { dot: 'bg-emerald-500', text: 'text-emerald-600' };
            case 'On Leave': return { dot: 'bg-slate-400', text: 'text-slate-500' };
            case 'In Surgery': return { dot: 'bg-orange-500', text: 'text-orange-600' };
            default: return { dot: 'bg-slate-400', text: 'text-slate-500' };
        }
    };

    const getSpecialtyColor = (specialty: string) => {
        switch (specialty) {
            case 'Cardiology': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Neurology': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Pediatrics': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Orthopedics': return 'bg-sky-50 text-sky-600 border-sky-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-fade-in bg-slate-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctors Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your medical network and specialists</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64 lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search doctors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 shadow-sm transition-smooth"
                        />
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-smooth h-11 px-6 gap-2 border-none">
                                <Plus className="w-5 h-5" />
                                <span className="font-bold">Add Doctor</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-slate-900">Add New Doctor</DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    Register a new specialist to the directory.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right font-semibold text-slate-700">Full Name</Label>
                                        <Input id="name" placeholder="Dr. John Doe" className="col-span-3 rounded-xl bg-slate-50 border-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="specialty" className="text-right font-semibold text-slate-700">Specialty</Label>
                                        <Input id="specialty" placeholder="e.g. Cardiology" className="col-span-3 rounded-xl bg-slate-50 border-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right font-semibold text-slate-700">Email</Label>
                                        <Input id="email" type="email" placeholder="doctor@med.co" className="col-span-3 rounded-xl bg-slate-50 border-slate-200" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl h-12 font-bold shadow-lg transition-smooth border-none">
                                    Add Specialist
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-premium bg-white group overflow-hidden">
                        <CardContent className="p-6 flex items-center justify-between relative">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Directory List Table */}
            <Card className="border-none shadow-premium bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Directory List</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-lg">
                            <Filter className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-lg">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-slate-50 hover:bg-slate-50/50">
                                <TableHead className="py-4 pl-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Name</TableHead>
                                <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Specialty</TableHead>
                                <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Contact</TableHead>
                                <TableHead className="py-4 pr-6 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDoctors.map((doc) => {
                                const styles = getStatusStyles(doc.status);
                                return (
                                    <TableRow key={doc.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                                        <TableCell className="py-5 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                                        <AvatarImage src={doc.avatar} />
                                                        <AvatarFallback>{doc.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${styles.dot}`} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm">{doc.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">ID: #{doc.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-xl px-3 py-1 font-bold text-[11px] ${getSpecialtyColor(doc.specialty)} border-none shadow-sm`}>
                                                {doc.specialty}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                                                <span className={`text-sm font-bold ${styles.text}`}>{doc.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-slate-700">{doc.email}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{doc.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400">
                            Showing <span className="text-slate-900">1 to {filteredDoctors.length}</span> of <span className="text-slate-900">142</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-xs h-9 px-4 hover:bg-slate-50">
                                Previous
                            </Button>
                            <div className="flex items-center gap-1 mx-2">
                                <Button size="sm" className="h-9 w-9 bg-cyan-500 text-white font-black rounded-xl border-none shadow-sm">1</Button>
                                <Button size="sm" variant="ghost" className="h-9 w-9 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">2</Button>
                                <Button size="sm" variant="ghost" className="h-9 w-9 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">3</Button>
                                <span className="text-slate-300 px-1">...</span>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-xs h-9 px-4 hover:bg-slate-50">
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center py-4">
                <p className="text-[11px] font-bold text-slate-300 tracking-wider">© 2026 MedPreserve Inc. All rights reserved.</p>
            </div>
        </div>
    );
}
