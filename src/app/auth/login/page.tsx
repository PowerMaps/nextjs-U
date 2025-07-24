"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLogin, useAuthRedirect, GuestOnlyRoute, useAuthStore } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/auth-layout";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  // Use the new authentication hooks
  const { login, isLoading, error, clearError } = useLogin();
  const { reason, returnUrl } = useAuthRedirect();
  const { setLastLoginEmail, setRememberMe } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const watchedEmail = watch("email");
  const watchedRememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormValues) => {
    try {
      clearError(); // Clear any previous errors
      
      // Store preferences
      if (data.rememberMe) {
        setLastLoginEmail(data.email);
        setRememberMe(true);
      }
      
      await login(data);
      
      toast({
        title: "Login successful",
        description: "Welcome back to PowerMaps!",
      });
      
      // Redirect is handled automatically by useAuthRedirect
    } catch (error: any) {
      // Error is already handled by the auth context
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    }
  };

  // Get reason-specific messages
  const getReasonMessage = () => {
    switch (reason) {
      case 'session-expired':
        return {
          type: 'warning' as const,
          message: 'Your session has expired. Please log in again.',
        };
      case 'logout':
        return {
          type: 'info' as const,
          message: 'You have been logged out successfully.',
        };
      case 'unauthorized':
        return {
          type: 'error' as const,
          message: 'You need to log in to access this page.',
        };
      default:
        return null;
    }
  };

  const reasonMessage = getReasonMessage();

  return (
    <GuestOnlyRoute>
      <AuthLayout 
        title="Welcome back"
        subtitle="Sign in to your PowerMaps account"
      >
        <div className="w-full">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
              {returnUrl && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  You'll be redirected after login
                </span>
              )}
            </CardDescription>
            
            {/* Reason message */}
            {reasonMessage && (
              <div className={`rounded-md p-3 text-sm ${
                reasonMessage.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : reasonMessage.type === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {reasonMessage.message}
              </div>
            )}
            
            {/* Auth error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <div className="flex justify-between items-start">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 ml-2"
                    aria-label="Dismiss error"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...register("rememberMe")}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal leading-none"
              >
                Remember me
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
        </div>
      </AuthLayout>
    </GuestOnlyRoute>
  );
}