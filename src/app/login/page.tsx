"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createAdminAccountAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    const result = await createAdminAccountAction();
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      toast({
        title: "Success",
        description: result.message,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              For development
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleCreateAdmin}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Admin Account
        </Button>
      </div>
    </div>
  );
}