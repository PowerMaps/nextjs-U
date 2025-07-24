"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
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
import { GuestOnlyRoute } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/auth-layout";
import { apiClient } from "@/lib/api/client";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("No reset token found. Please request a new password reset.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.post("/auth/reset-password", {
        token,
        password: data.password,
      });

      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });

    } catch (error: any) {
      setError(error.message || "Failed to reset password. The link may be invalid or expired.");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <GuestOnlyRoute>
        <AuthLayout 
          title="Password Reset"
          subtitle="Your password has been successfully reset"
        >
          <div className="w-full">
            <Card>
              <CardHeader className="text-center">
                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">Password Reset Successful</CardTitle>
                <CardDescription>
                  You can now log in with your new password.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </AuthLayout>
      </GuestOnlyRoute>
    );
  }

  return (
    <GuestOnlyRoute>
      <AuthLayout 
        title="Reset your password"
        subtitle="Enter a new password for your account"
      >
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              {!token && (
                <CardDescription className="text-destructive">
                  {error}
                </CardDescription>
              )}
            </CardHeader>
            {token ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
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
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            ) : (
                <CardFooter>
                    <Link href="/auth/forgot-password" className="w-full">
                        <Button variant="outline" className="w-full">Request a new link</Button>
                    </Link>
                </CardFooter>
            )}
          </Card>
        </div>
      </AuthLayout>
    </GuestOnlyRoute>
  );
}
