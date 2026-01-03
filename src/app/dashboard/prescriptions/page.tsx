'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { sub, formatISO } from 'date-fns';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bell,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Upload,
  X,
  FileSearch,
  LogOut,
  Bot,
  AlertTriangle,
  Info,
  ListChecks,
  Siren,
  Loader2,
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
import { AddPrescriptionModal } from '@/components/dashboard/add-prescription-modal';
import { useRouter } from 'next/navigation';
import { analyzePrescription, PrescriptionInsightsOutput } from '@/ai/flows/prescription-insights-flow';
import { Skeleton } from '@/components/ui/skeleton';

type Status = 'Active' | 'Completed' | 'Emergency';

const statusColors: Record<Status, string> = {
  Active: 'bg-green-100 text-green-800',
  Completed: 'bg-blue-100 text-blue-800',
  Emergency: 'bg-red-100 text-red-800',
};

type Prescription = {
    id: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    status: Status;
    notes?: string;
    createdAt: Timestamp;
};

export default function PrescriptionsPage() {
  const { user, isUserLoading, auth } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [dateRange, setDateRange] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [insights, setInsights] = useState<PrescriptionInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);


  const prescriptionsQuery = useMemoFirebase(() => {
    if (!user) return null;

    let q = query(
      collection(firestore, `patients/${user.uid}/prescriptions`),
      orderBy('createdAt', 'desc')
    );

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }

    if (dateRange !== 'all') {
      let startDate;
      const now = new Date();
      if (dateRange === '30d') {
        startDate = sub(now, { days: 30 });
      } else if (dateRange === '6m') {
        startDate = sub(now, { months: 6 });
      }
      if (startDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }
    }

    return q;
  }, [firestore, user, statusFilter, dateRange]);

  const { data: allPrescriptions, isLoading } = useCollection<Prescription>(
    prescriptionsQuery
  );

  const filteredPrescriptions = useMemo(() => {
    if (!allPrescriptions) return [];
    return allPrescriptions.filter((p) =>
      p.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPrescriptions, searchTerm]);
  
  const handleViewDetails = async (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsLoadingInsights(true);
    setInsights(null); // Clear previous insights
    try {
      const pastPrescriptions = allPrescriptions
        ?.filter(p => p.id !== prescription.id && p.createdAt.toDate() < prescription.createdAt.toDate())
        .map(p => ({
            medicineName: p.medicineName,
            dosage: p.dosage,
            startDate: p.createdAt.toDate().toISOString(),
        })) || [];
        
      const result = await analyzePrescription({
        medicineName: prescription.medicineName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        notes: prescription.notes,
        pastPrescriptions,
      });
      setInsights(result);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      // You could set an error state here to show in the UI
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange('all');
  };

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

  const renderFilters = (isMobile = false) => (
    <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row items-center space-x-4'}`}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search by medicine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="6m">Last 6 Months</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        {(['all', 'Active', 'Completed', 'Emergency'] as const).map(
          (status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          )
        )}
      </div>
      <Button variant="ghost" onClick={resetFilters}>
        <X className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );

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
              <SidebarMenuButton onClick={() => handleNavigation('/dashboard')}>Dashboard</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => handleNavigation('/dashboard/prescriptions')} isActive>Prescriptions</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => handleNavigation('/dashboard/appointments')}>Appointments</SidebarMenuButton>
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
              <p className="text-xs text-muted-foreground">
                Patient ID: {user.uid.slice(0, 7)}
              </p>
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
              <h1 className="text-xl font-bold">Prescriptions</h1>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </header>

          <main className="flex-1 p-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <CardTitle>Prescription History</CardTitle>
                  <div className="hidden md:flex md:items-center md:space-x-4 mt-4 md:mt-0">
                    {renderFilters()}
                  </div>
                  <div className="flex md:hidden items-center justify-between mt-4">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Filter Prescriptions</SheetTitle>
                          <SheetDescription>
                            Refine your search criteria.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                           {renderFilters(true)}
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading prescriptions...
                        </TableCell>
                      </TableRow>
                    ) : filteredPrescriptions.length > 0 ? (
                      filteredPrescriptions.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.medicineName}
                          </TableCell>
                          <TableCell>{p.dosage}</TableCell>
                          <TableCell>{p.frequency}</TableCell>
                          <TableCell>
                            {p.createdAt?.toDate().toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusColors[p.status as Status] ||
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {p.status}
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
                                <DropdownMenuItem onClick={() => handleViewDetails(p)}>View Details</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                             <FileSearch className="h-12 w-12 text-gray-400" />
                            <p className="font-semibold">No records found</p>
                            <p className="text-sm text-gray-500">
                              Try adjusting your filters to find what you're looking for.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>

        <Sheet open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Bot /> AI-Powered Insights
              </SheetTitle>
              <SheetDescription>
                This AI analysis is for informational purposes only and is not a substitute for professional medical advice.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
            {isLoadingInsights ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : insights ? (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Medication Details</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm p-3 bg-slate-50 rounded-md">
                      <div><span className="font-medium text-gray-500 block">Medicine</span>{selectedPrescription?.medicineName}</div>
                      <div><span className="font-medium text-gray-500 block">Dosage</span>{selectedPrescription?.dosage}</div>
                      <div><span className="font-medium text-gray-500 block">Frequency</span>{selectedPrescription?.frequency}</div>
                  </div>
                </div>

                {insights.alerts && insights.alerts.length > 0 && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <h3 className="font-semibold flex items-center gap-2 text-yellow-800"><Siren size={18} /> AI-Detected Alerts</h3>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-yellow-700">
                      {insights.alerts.map((alert, i) => <li key={i}>({alert.level}) {alert.message}</li>)}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-4">
                   <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><Info size={18} /> Medicine Purpose</h3>
                    <p className="text-sm text-gray-600">{insights.medicinePurpose}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><ListChecks size={18} /> Intake Schedule</h3>
                    <p className="text-sm text-gray-600">{insights.intakeSchedule}</p>
                  </div>
                   <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><AlertTriangle size={18} /> Common Side Effects</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {insights.commonSideEffects.map((effect, i) => <li key={i}>{effect}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><Bell size={18} /> Follow-up Suggestions</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {insights.followUpSuggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
               <div className="text-center py-10">
                  <p className="text-gray-500">No insights available for this prescription.</p>
                </div>
            )}
            </div>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  );
}
