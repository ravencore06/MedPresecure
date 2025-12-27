'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Bell,
  Download,
  FileText,
  HeartPulse,
  MoreVertical,
  Pill,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Upload,
  User,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  SidebarGroup,
  SidebarSeparator,
  SidebarTrigger,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Shield } from 'lucide-react';
import React, { useState } from 'react';
import { AddPrescriptionModal } from '@/components/dashboard/add-prescription-modal';
import { collection } from 'firebase/firestore';

const appointments = [
  {
    doctor: 'Dr. John Doe',
    specialty: 'Cardiologist',
    date: 'Oct 24, 2024',
    time: '10:30 AM',
    type: 'Video Consultation',
    icon: <Video className="text-blue-500" />,
  },
  {
    doctor: 'Dr. Jane Smith',
    specialty: 'Dermatologist',
    date: 'Nov 12, 2024',
    time: '02:00 PM',
    type: 'In-Person',
    icon: <Stethoscope className="text-green-500" />,
  },
];


const uploads = [
  { name: 'Blood Test Results.pdf', date: '2024-07-15', icon: <FileText /> },
  { name: 'MRI Scan.jpg', date: '2024-07-10', icon: <FileText /> },
];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'patients', user.uid, 'prescriptions');
  }, [firestore, user]);

  const { data: medications, isLoading: medicationsLoading } = useCollection(prescriptionsQuery);


  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <SidebarProvider>
      <AddPrescriptionModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">MedPreserve</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Prescriptions</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Appointments</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Doctors</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Settings</SidebarMenuButton>
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
              <p className="text-xs text-muted-foreground">
                Patient ID: {user.uid.slice(0, 7)}
              </p>
            </div>
            <Settings className="w-5 h-5" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-slate-50">
          <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b">
          <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search anything..."
                  className="w-96 pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <Upload className="w-6 h-6" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Good Morning, Sarah</h1>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" /> Add New Prescription
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Prescriptions
                  </CardTitle>
                  <Pill className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{medications?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Medicines
                  </CardTitle>
                  <HeartPulse className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{medications?.filter(m => m.status === 'Active').length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Next Appointment
                  </CardTitle>
                  <Stethoscope className="w-5 h-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Oct 24</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicationsLoading && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              Loading medications...
                            </TableCell>
                          </TableRow>
                        )}
                        {!medicationsLoading && medications && medications.map((med, index) => (
                          <TableRow key={index}>
                            <TableCell>{med.medicineName}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                            <TableCell>
                              <Badge className={`${med.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {med.status || 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-5 h-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Set Reminder
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {uploads.map((upload, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {upload.icon}
                            <div>
                              <p className="font-semibold">{upload.name}</p>
                              <p className="text-sm text-gray-500">
                                {upload.date}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appt, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <div className="p-2 bg-gray-100 rounded-full">
                          {appt.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{appt.doctor}</p>
                          <p className="text-sm text-gray-500">
                            {appt.specialty}
                          </p>
                          <p className="mt-2 text-sm">
                            {appt.date} at {appt.time}
                          </p>
                          <p className="text-sm text-gray-500">{appt.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
