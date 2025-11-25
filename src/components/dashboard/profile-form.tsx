
'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@/lib/firebase';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '../ui/skeleton';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfileForm() {
    const { user, userProfile, loading: userLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });
    
    const onSubmit = async (data: PasswordFormData) => {
        if (!user || !auth) return;
        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, data.newPassword);
            
            toast({
                title: "Success",
                description: "Your password has been updated successfully.",
            });
            reset();
        } catch (error: any) {
            console.error("Password update error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.code === 'auth/wrong-password' 
                    ? "Incorrect current password." 
                    : "Failed to update password. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };
    
    if (userLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                </div>
                <div className="space-y-4">
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <Separator />
                 <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        )
    }

    if (!userProfile) {
        return <p>User not found.</p>
    }

    return (
         <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarFallback>{userProfile.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">{userProfile.name}</h2>
                    <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
            </div>
            
            <Separator />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                        Update your password here. Please enter your current password to make changes.
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" {...register("currentPassword")} />
                        {errors.currentPassword && <p className="text-destructive text-sm mt-1">{errors.currentPassword.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" {...register("newPassword")} />
                        {errors.newPassword && <p className="text-destructive text-sm mt-1">{errors.newPassword.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                        {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>
                <div>
                     <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
