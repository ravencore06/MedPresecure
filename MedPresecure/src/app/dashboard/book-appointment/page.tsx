'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Settings,
  User,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  LogOut,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  runTransaction,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

import { useUser, useFirestore } from '@/firebase';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { add, format } from 'date-fns';

import { doctors, Doctor } from '@/lib/doctors';

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

export default function BookAppointmentPage() {
  const { user, isUserLoading, auth } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [consultationType, setConsultationType] = useState('Video');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);


  React.useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchBookedSlots = async () => {
        if (!firestore) return;
        setIsCheckingSlots(true);
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const appointmentsRef = collection(firestore, 'appointments');
        const q = query(
          appointmentsRef,
          where('doctorId', '==', selectedDoctor.id),
          where('appointmentDateTime', '>=', Timestamp.fromDate(startOfDay)),
          where('appointmentDateTime', '<=', Timestamp.fromDate(endOfDay))
        );

        try {
          const querySnapshot = await getDocs(q);
          const slots = querySnapshot.docs.map(doc => {
            const date = doc.data().appointmentDateTime.toDate();
            return format(date, 'hh:mm a');
          });
          setBookedSlots(slots);
        } catch (error) {
          console.error("Error fetching booked slots: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch available slots.' });
        } finally {
          setIsCheckingSlots(false);
        }
      };
      fetchBookedSlots();
    }
  }, [selectedDoctor, selectedDate, firestore, toast]);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const parseTime = (timeString: string, date: Date): Date => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedDoctor || !selectedDate || !selectedTime || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Missing booking details.' });
      return;
    }
    setIsLoading(true);

    const appointmentDateTime = parseTime(selectedTime, selectedDate);
    const appointmentTimestamp = Timestamp.fromDate(appointmentDateTime);
    const appointmentRef = doc(collection(firestore, 'appointments'));

    try {
      await runTransaction(firestore, async (transaction) => {
        // Check for conflicting appointments for the doctor
        const doctorAppointmentsQuery = query(
          collection(firestore, 'appointments'),
          where('doctorId', '==', selectedDoctor.id),
          where('appointmentDateTime', '==', appointmentTimestamp)
        );
        const doctorSnapshot = await getDocs(doctorAppointmentsQuery);
        if (!doctorSnapshot.empty) {
          throw new Error('This time slot was just booked. Please select another time.');
        }

        const newAppointment = {
          patientId: user.uid,
          doctorId: selectedDoctor.id,
          appointmentDateTime: appointmentTimestamp,
          type: consultationType,
          status: 'Pending',
          notes: reason,
          createdAt: serverTimestamp(),
        };
        transaction.set(appointmentRef, newAppointment);

        // Also write to patient's subcollection
        const patientAppointmentRef = doc(firestore, `patients/${user.uid}/appointments`, appointmentRef.id);
        transaction.set(patientAppointmentRef, newAppointment);
      });

      toast({ title: 'Success!', description: 'Your appointment has been booked.' });
      setStep(4); // Move to confirmation step
    } catch (error: any) {
      console.error('Booking failed:', error);
      toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const today = new Date();
  const nextWeek = add(today, { days: 7 });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={doctor.avatar} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-lg">{doctor.name}</p>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                  <Button className="mt-4 w-full" onClick={() => handleSelectDoctor(doctor)}>
                    View Availability
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={today}
                toDate={nextWeek}
                disabled={(date) => date < today || date > nextWeek}
                className="rounded-md border"
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Select a Time Slot</h3>
              {isCheckingSlots ? <Loader2 className="animate-spin" /> : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map(time => {
                    const isBooked = bookedSlots.includes(time);
                    return (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        disabled={isBooked}
                        onClick={() => !isBooked && handleSelectTime(time)}
                      >
                        {time}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Confirm Your Details</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea id="reason" placeholder="Briefly describe the reason for your visit..." value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <div>
                <Label>Consultation Type</Label>
                <RadioGroup defaultValue="Video" value={consultationType} onValueChange={setConsultationType} className="flex items-center gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Video" id="video" />
                    <Label htmlFor="video">Video Consultation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="In-person" id="in-person" />
                    <Label htmlFor="in-person">In-person Visit</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleConfirmBooking} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-12">
            <Check className="w-24 h-24 mx-auto text-green-500 bg-green-100 rounded-full p-4" />
            <h2 className="mt-6 text-2xl font-bold">Appointment Booked!</h2>
            <p className="mt-2 text-muted-foreground">Your appointment with {selectedDoctor?.name} on {selectedDate && format(selectedDate, 'PPP')} at {selectedTime} is confirmed.</p>
            <Button className="mt-8" onClick={() => router.push('/dashboard/appointments')}>
              View All Appointments
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Select a Doctor';
      case 2: return `Select Date &amp; Time for ${selectedDoctor?.name}`;
      case 3: return 'Finalize Your Booking';
      case 4: return 'Booking Confirmed';
      default: return 'Book Appointment';
    }
  }

  if (isUserLoading) return <div>Loading...</div>;
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
              <div className="flex items-center gap-2">
                {step > 1 && step < 4 && <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}><ChevronLeft className="w-5 h-5" /></Button>}
                <h1 className="text-xl font-bold">{getStepTitle()}</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {renderStep()}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
