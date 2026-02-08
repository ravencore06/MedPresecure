'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Upload,
  Video,
  Building,
  LogOut,
} from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { doctors } from '@/lib/doctors';


type Status = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';

const statusColors: Record<Status, string> = {
  Confirmed: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
  Completed: 'bg-blue-100 text-blue-800',
};

export default function AppointmentsPage() {
  const { user, isUserLoading, auth } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [dateRange, setDateRange] = useState('all');

  const appointmentsQuery = useMemoFirebase(() => {
    if (!user) return null;

    let q = query(
      collection(firestore, `patients/${user.uid}/appointments`),
      orderBy('appointmentDateTime', 'desc')
    );

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }

    if (dateRange !== 'all') {
      let startDate;
      const now = new Date();
      if (dateRange === 'today') {
        startDate = startOfDay(now);
      } else if (dateRange === 'this_week') {
        startDate = subDays(now, 7);
      }
      if (startDate) {
        const endDate = endOfDay(now);
        q = query(q, where('appointmentDateTime', '>=', Timestamp.fromDate(startDate)), where('appointmentDateTime', '<=', Timestamp.fromDate(endDate)));
      }
    }

    return q;
  }, [firestore, user, statusFilter, dateRange]);

  const { data: appointments, isLoading } = useCollection(appointmentsQuery);

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(
      (a) =>
        doctors.find(d => d.id === a.doctorId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const upcomingCount = appointments?.filter(a => a.status === 'Confirmed' && a.appointmentDateTime.toDate() > new Date()).length || 0;
  const completedTodayCount = appointments?.filter(a => a.status === 'Completed' && a.appointmentDateTime.toDate() >= startOfDay(new Date())).length || 0;
  const cancelledCount = appointments?.filter(a => a.status === 'Cancelled').length || 0;

  const getDoctorInfo = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId);
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
              <SidebarMenuButton onClick={() => handleNavigation('/dashboard/appointments')} isActive>Appointments</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => handleNavigation('/dashboard/doctors')}>Doctors</SidebarMenuButton>
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
              <h1 className="text-xl font-bold">Appointments</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Button onClick={() => router.push('/dashboard/book-appointment')}>
                <Plus className="mr-2 h-4 w-4" /> Book Appointment
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                  <CalendarClock className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                  <CalendarCheck className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTodayCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
                  <CalendarX className="w-5 h-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cancelledCount}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                {/* Filter Sidebar Trigger could go here on mobile */}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date &amp; Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                    ) : filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appt) => {
                        const doctor = getDoctorInfo(appt.doctorId);
                        return (
                          <TableRow key={appt.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="https://i.pravatar.cc/300" />
                                  <AvatarFallback>SN</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">Sarah Noor</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={doctor?.avatar} />
                                  <AvatarFallback>{doctor?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{doctor?.name}</p>
                                  <p className="text-sm text-gray-500">{doctor?.specialty}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{appt.appointmentDateTime.toDate().toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {appt.type === 'Video' ? <Video className="h-4 w-4 text-blue-500" /> : <Building className="h-4 w-4 text-purple-500" />}
                                {appt.type}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[appt.status as Status] || 'bg-gray-100 text-gray-800'}>{appt.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500">Cancel</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center">No appointments found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
