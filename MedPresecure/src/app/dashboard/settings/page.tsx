'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Settings,
  User as UserIcon,
  Bell,
  Lock,
  LogOut,
  Camera,
  Loader2,
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


function SettingsPage() {
  const { user, isUserLoading, auth } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({ name: '', dob: '', bloodGroup: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const userSettingsRef = useMemoFirebase(() => user ? doc(firestore, `userSettings/${user.uid}`) : null, [firestore, user]);
  const { data: userSettings, isLoading: settingsLoading } = useDoc(userSettingsRef);

  const patientRef = useMemoFirebase(() => user ? doc(firestore, `patients/${user.uid}`) : null, [firestore, user]);
  const { data: patientData, isLoading: patientLoading } = useDoc(patientRef);

  React.useEffect(() => {
    if (patientData) {
      setProfileData({
        name: patientData.name || '',
        dob: patientData.dateOfBirth || '',
        bloodGroup: patientData.bloodGroup || '',
      });
    }
  }, [patientData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patientRef) return;

    setIsLoading(true);
    const updatedData = {
      name: profileData.name,
      dateOfBirth: profileData.dob,
      bloodGroup: profileData.bloodGroup
    };

    setDocumentNonBlocking(patientRef, updatedData, { merge: true });

    toast({ title: 'Success', description: 'Profile updated successfully!' });
    setIsLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth) return;
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
      return;
    }
    setIsLoading(true);
    try {
      // Reauthentication might be needed here in a real app for security.
      await updatePassword(user, passwordData.newPassword);
      toast({ title: 'Success', description: 'Password changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    if (!user || !userSettingsRef) return;
    const currentPreferences = userSettings?.notificationPreferences || {};
    const updatedPreferences = { ...currentPreferences, [key]: value };
    setDocumentNonBlocking(userSettingsRef, { notificationPreferences: updatedPreferences }, { merge: true });
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (isUserLoading || patientLoading || settingsLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://i.pravatar.cc/300" alt="User avatar" />
                      <AvatarFallback>SN</AvatarFallback>
                    </Avatar>
                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Profile Picture</Label>
                    <Input id="picture" type="file" />
                    <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={profileData.dob} onChange={e => setProfileData({ ...profileData, dob: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input id="bloodGroup" value={profileData.bloodGroup} onChange={e => setProfileData({ ...profileData, bloodGroup: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin mr-2" />} Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        );
      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={passwordData.confirmNewPassword} onChange={e => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })} />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin mr-2" />} Update Password</Button>
              </CardFooter>
            </form>
          </Card>
        );
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <div className="flex items-center justify-between py-4">
                <div>
                  <Label htmlFor="med-reminders">Medication Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts for your prescribed medicines.</p>
                </div>
                <Switch id="med-reminders" checked={userSettings?.notificationPreferences?.medicationReminders ?? true} onCheckedChange={(c) => handleNotificationToggle('medicationReminders', c)} />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <Label htmlFor="appt-alerts">Appointment Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about upcoming appointments.</p>
                </div>
                <Switch id="appt-alerts" checked={userSettings?.notificationPreferences?.appointmentAlerts ?? true} onCheckedChange={(c) => handleNotificationToggle('appointmentAlerts', c)} />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <Label htmlFor="lab-results">Lab Result Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get an alert when new lab results are available.</p>
                </div>
                <Switch id="lab-results" checked={userSettings?.notificationPreferences?.labResults ?? false} onCheckedChange={(c) => handleNotificationToggle('labResults', c)} />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">Changes are saved automatically.</p>
            </CardFooter>
          </Card>
        );
      case 'privacy':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Privacy &amp; Data</CardTitle>
              <CardDescription>Manage who can see your medical records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border rounded-lg bg-slate-50">
                <p className="font-semibold">Feature Coming Soon</p>
                <p className="text-sm text-muted-foreground mt-2">We are working on providing granular controls over your data sharing preferences.</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };


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
              <SidebarMenuButton onClick={() => handleNavigation('/dashboard/settings')} isActive>Settings</SidebarMenuButton>
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
              <h1 className="text-xl font-bold">Account &amp; Security</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-5xl mx-auto flex gap-12">
              <aside className="w-1/4">
                <nav className="flex flex-col gap-2">
                  <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveTab('profile')}><UserIcon className="mr-2 h-5 w-5" /> Profile</Button>
                  <Button variant={activeTab === 'security' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveTab('security')}><Lock className="mr-2 h-5 w-5" /> Security</Button>
                  <Button variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveTab('notifications')}><Bell className="mr-2 h-5 w-5" /> Notifications</Button>
                  <Button variant={activeTab === 'privacy' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveTab('privacy')}><Shield className="mr-2 h-5 w-5" /> Privacy &amp; Data</Button>
                </nav>
              </aside>
              <div className="flex-1">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SettingsPage;
