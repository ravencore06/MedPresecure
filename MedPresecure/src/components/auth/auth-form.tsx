
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuth, useFirestore, useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, Lock, Phone, ArrowRight, User, Calendar, Upload, X, UserCircle, Building2 } from 'lucide-react';
import { Branding } from './branding';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const toDummyEmail = (mobile: string) => `${mobile}@aarogyam.app`;

const mobileRegex = new RegExp(/^\d{10}$/);
const mobileError = 'Mobile number must be 10 digits.';

const LoginSchema = z.object({
  mobile: z.string().regex(mobileRegex, { message: mobileError }),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const SignupSchema = z
  .object({
    userType: z.enum(['patient', 'hospital'], {
      required_error: 'Please select user type',
    }),
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    age: z.coerce.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120'),
    mobile: z.string().regex(mobileRegex, { message: mobileError }),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const ForgotPasswordSchema = z.object({
  mobile: z.string().regex(mobileRegex, { message: mobileError }),
});

type FormType = 'login' | 'signup' | 'forgotPassword';

function AuthFormCore({
  formType,
  setFormType,
}: {
  formType: FormType;
  setFormType: (type: FormType) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  const currentSchema =
    formType === 'login'
      ? LoginSchema
      : formType === 'signup'
        ? SignupSchema
        : ForgotPasswordSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues:
      formType === 'login'
        ? { mobile: '', password: '' }
        : formType === 'signup'
          ? { userType: 'patient' as const, name: '', age: 0, mobile: '', password: '', confirmPassword: '' }
          : { mobile: '' },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Profile photo must be less than 5MB',
        });
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
  };

  const uploadProfilePhoto = async (userId: string): Promise<string | null> => {
    if (!profilePhoto || !storage) return null;

    try {
      const photoRef = ref(storage, `users/${userId}/profile.jpg`);
      await uploadBytes(photoRef, profilePhoto);
      const downloadURL = await getDownloadURL(photoRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      return null;
    }
  };

  const onSubmit = async (data: z.infer<typeof currentSchema>) => {
    setLoading(true);
    const email = toDummyEmail(data.mobile);

    try {
      if (formType === 'login' && 'password' in data) {
        await signInWithEmailAndPassword(auth, email, data.password);

        // Fetch user profile to determine role
        if (firestore) {
          const userDocRef = doc(firestore, 'users', auth.currentUser!.uid);
          const userDocSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(userDocRef));

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const redirectPath = userData.userType === 'hospital' ? '/hospital-dashboard' : '/dashboard';

            toast({
              title: 'Login Successful',
              description: 'Welcome back!',
            });
            router.push(redirectPath);
          } else {
            // Fallback if no profile found
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } else if (formType === 'signup' && 'password' in data && 'name' in data && 'age' in data) {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
        const user = userCredential.user;

        // Upload profile photo if provided
        const photoURL = await uploadProfilePhoto(user.uid);

        // Update user profile with display name and photo
        await updateProfile(user, {
          displayName: data.name,
          photoURL: photoURL || undefined,
        });

        // Save user profile to Firestore
        if (firestore && 'userType' in data) {
          await setDoc(doc(firestore, 'users', user.uid), {
            userType: data.userType,
            name: data.name,
            age: data.age,
            mobileNumber: data.mobile,
            photoURL: photoURL || null,
            email: email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        toast({
          title: 'Account Created',
          description: 'You have successfully signed up. Please log in.',
        });
        setFormType('login');
      } else if (formType === 'forgotPassword') {
        await sendPasswordResetEmail(auth, email);
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your inbox for password reset instructions.',
        });
        setFormType('login');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.code
          ? error.code.replace('auth/', '').replace(/-/g, ' ')
          : 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    if (formType === 'forgotPassword') {
      return (
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="10-digit mobile number"
                    {...field}
                    className="pl-10 bg-white/50"
                    maxLength={10}
                    suppressHydrationWarning
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <>
        {formType === 'signup' && (
          <>
            {/* User Type Selection */}
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="patient"
                          id="patient"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="patient"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                        >
                          <UserCircle className="mb-2 h-8 w-8 text-blue-600" />
                          <span className="font-semibold">Patient</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="hospital"
                          id="hospital"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="hospital"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50 cursor-pointer transition-all"
                        >
                          <Building2 className="mb-2 h-8 w-8 text-teal-600" />
                          <span className="font-semibold">Hospital</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="pl-10"
                        suppressHydrationWarning
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        type="number"
                        placeholder="Enter your age"
                        {...field}
                        className="pl-10"
                        min={1}
                        max={120}
                        suppressHydrationWarning
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Profile Photo (Optional)</FormLabel>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-primary">
                      <AvatarImage src={photoPreview} alt="Profile preview" />
                      <AvatarFallback>Preview</AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Avatar className="w-20 h-20 border-2 border-dashed border-gray-300">
                    <AvatarFallback className="bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoChange}
                    className="cursor-pointer"
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 5MB</p>
                </div>
              </div>
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="10-digit mobile number"
                    {...field}
                    className="pl-10"
                    maxLength={10}
                    suppressHydrationWarning
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>{formType === 'signup' ? 'New Password' : 'Password'}</FormLabel>
                {formType === 'login' && (
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => setFormType('forgotPassword')}
                    suppressHydrationWarning
                  >
                    Forgot password?
                  </Button>
                )}
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...field}
                    className="pr-10 pl-10"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    suppressHydrationWarning
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {formType === 'signup' && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...field}
                      className="pr-10 pl-10"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      suppressHydrationWarning
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </>
    );
  };

  const getButtonText = () => {
    switch (formType) {
      case 'login':
        return 'Login to Account';
      case 'signup':
        return 'Create Account';
      case 'forgotPassword':
        return 'Send Reset Link';
    }
  };

  const renderFooter = () => {
    if (formType === 'forgotPassword') {
      return (
        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-blue-600"
            onClick={() => setFormType('login')}
            suppressHydrationWarning
          >
            Login
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-6 text-center text-sm text-gray-600">
        {formType === 'login'
          ? "Don't have an account?"
          : 'Already have an account?'}{' '}
        <Button
          variant="link"
          className="p-0 h-auto font-semibold text-blue-600"
          onClick={() =>
            setFormType(formType === 'login' ? 'signup' : 'login')
          }
          suppressHydrationWarning
        >
          {formType === 'login' ? 'Sign up' : 'Login'}
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl">
      <Branding />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">{renderFormFields()}</div>

          <Button
            type="submit"
            className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
            suppressHydrationWarning
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
            {formType === 'login' && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>

      {renderFooter()}
    </div>
  );
}

export function AuthForm() {
  const [formType, setFormType] = useState<FormType>('login');
  return (
    <AuthFormCore
      key={formType}
      formType={formType}
      setFormType={setFormType}
    />
  );
}
