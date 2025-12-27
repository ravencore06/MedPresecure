"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Image from 'next/image';

import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock, Shield, ArrowRight } from "lucide-react";
import { Branding } from "./branding";

const toDummyEmail = (aadhaar: string) => `${aadhaar}@medpreserve.com`;

const aadhaarRegex = new RegExp(/^\d{12}$/);
const aadhaarError = "Aadhaar number must be 12 digits.";

const LoginSchema = z.object({
  aadhaar: z.string().regex(aadhaarRegex, { message: aadhaarError }),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const SignupSchema = z
  .object({
    aadhaar: z.string().regex(aadhaarRegex, { message: aadhaarError }),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const ForgotPasswordSchema = z.object({
  aadhaar: z.string().regex(aadhaarRegex, { message: aadhaarError }),
});

type FormType = "login" | "signup" | "forgotPassword";

function AuthFormCore({ formType, setFormType }: { formType: FormType; setFormType: (type: FormType) => void; }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const currentSchema =
    formType === "login"
      ? LoginSchema
      : formType === "signup"
      ? SignupSchema
      : ForgotPasswordSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues:
      formType === "login"
        ? { aadhaar: "", password: "" }
        : formType === "signup"
        ? { aadhaar: "", password: "", confirmPassword: "" }
        : { aadhaar: "" },
  });

  const onSubmit = async (data: z.infer<typeof currentSchema>) => {
    setLoading(true);
    const email = toDummyEmail(data.aadhaar);

    try {
      if (formType === "login" && "password" in data) {
        await signInWithEmailAndPassword(auth, email, data.password);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else if (formType === "signup" && "password" in data) {
        await createUserWithEmailAndPassword(auth, email, data.password);
        toast({
          title: "Account Created",
          description: "You have successfully signed up. Please log in.",
        });
        setFormType("login");
      } else if (formType === "forgotPassword") {
        await sendPasswordResetEmail(auth, email);
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox for password reset instructions.",
        });
        setFormType("login");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : "An unexpected error occurred.",
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
            name="aadhaar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhaar Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="1234 5678 9012"
                      {...field}
                      className="pl-10 bg-white/50"
                      maxLength={12}
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
            <FormField
              control={form.control}
              name="aadhaar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        placeholder="12-Digit Aadhaar Number"
                        {...field}
                        className="pl-10"
                        maxLength={12}
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
                    <FormLabel>Password</FormLabel>
                    {formType === 'login' && (
                       <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                        onClick={() => setFormType("forgotPassword")}
                      >
                        Forgot password?
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        className="pr-10 pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
             {formType === "signup" && (
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
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          {...field}
                          className="pr-10 pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
    )
  }

  const getButtonText = () => {
    switch (formType) {
      case "login": return "Login to Account";
      case "signup": return "Create Account";
      case "forgotPassword": return "Send Reset Link";
    }
  }

  const renderFooter = () => {
     if (formType === 'forgotPassword') {
        return (
             <div className="mt-6 text-center text-sm text-gray-600">
                Remembered your password?{" "}
                <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-blue-600"
                    onClick={() => setFormType("login")}
                >
                    Login
                </Button>
            </div>
        )
     }
     
     return (
        <div className="mt-6 text-center text-sm text-gray-600">
            {formType === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
                variant="link"
                className="p-0 h-auto font-semibold text-blue-600"
                onClick={() => setFormType(formType === 'login' ? "signup" : "login")}
            >
                {formType === 'login' ? "Sign up" : "Login"}
            </Button>
        </div>
     );
  }


  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl">
      <Branding />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {renderFormFields()}
          </div>
          
          <Button type="submit" className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
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
    const [formType, setFormType] = useState<FormType>("login");
    return <AuthFormCore key={formType} formType={formType} setFormType={setFormType} />
}
