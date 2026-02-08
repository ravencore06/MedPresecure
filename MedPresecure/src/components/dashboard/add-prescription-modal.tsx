'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { Loader2, UploadCloud } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const prescriptionSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  notes: z.string().optional(),
  file: z.instanceof(File).optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddPrescriptionModal({
  isOpen,
  onOpenChange,
}: AddPrescriptionModalProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medicineName: '',
      dosage: '',
      frequency: '',
      notes: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: PrescriptionFormValues) => {
    if (!auth.currentUser || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a prescription.',
      });
      return;
    }

    setLoading(true);

    const currentUser = auth.currentUser;
    const prescriptionData = {
      patientId: currentUser.uid,
      medicineName: data.medicineName,
      dosage: data.dosage,
      frequency: data.frequency,
      notes: data.notes || '',
      attachmentUrl: '', // Initially empty
      createdAt: serverTimestamp(),
      status: 'Active',
    };

    try {
      // 1. Add prescription document to Firestore immediately to get a document ID
      const colRef = collection(firestore, `patients/${currentUser.uid}/prescriptions`);
      const docRef = await addDoc(colRef, prescriptionData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: colRef.path,
            operation: 'create',
            requestResourceData: prescriptionData,
          });
          errorEmitter.emit('permission-error', permissionError);
          // re-throw to be caught by outer try/catch
          throw serverError;
      });

      // 2. Close modal and show success toast immediately
      toast({
        title: 'Success!',
        description: 'Your prescription has been added.',
      });
      form.reset();
      setFile(null);
      onOpenChange(false);
      setLoading(false);

      // 3. Upload file in the background if it exists
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `prescriptions/${currentUser.uid}/${docRef.id}/${file.name}`);
        
        // This part now runs in the background, not blocking the UI
        uploadBytes(storageRef, file).then(uploadResult => {
          getDownloadURL(uploadResult.ref).then(fileUrl => {
            // 4. Update the Firestore document with the file URL
            const documentToUpdateRef = doc(firestore, `patients/${currentUser.uid}/prescriptions`, docRef.id);
            updateDoc(documentToUpdateRef, { attachmentUrl: fileUrl });
          });
        }).catch(uploadError => {
            console.error("Error uploading file:", uploadError);
            // Optionally: update the document to indicate upload failure or notify user
             toast({
                variant: 'destructive',
                title: 'File Upload Failed',
                description: 'Your prescription was saved, but the attachment failed to upload.',
            });
        });
      }

    } catch (error: any) {
      console.error('Error adding prescription:', error);
      if (!error.name?.includes('FirebaseError')) {
         toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error.message || 'Could not add prescription.',
         });
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Prescription</DialogTitle>
          <DialogDescription>
            Enter the details from your doctor's visit below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Amoxicillin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes & Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any special instructions from the doctor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Attachment</FormLabel>
              <FormControl>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {file ? file.name : 'Click to upload a file'}
                    </p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Prescription
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
