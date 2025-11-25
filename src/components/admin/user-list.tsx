
'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, MoreHorizontal, User } from "lucide-react";
import { useCollection, useFirestore } from "@/lib/firebase";
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    points: number;
    status?: "Active" | "Suspended";
    role: 'user' | 'admin';
}

function UserRow({ user }: { user: UserProfile }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarFallback>{user.email ? user.email.charAt(0).toUpperCase() : <User />}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant={"secondary"}>Active</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.points.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                        <div className="md:hidden">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                                    <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                    <DropdownMenuItem>Suspend user</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                    <TableRow className="md:hidden">
                        <TableCell colSpan={2} className="pt-0">
                            <div className="p-4 space-y-4 bg-muted/50 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Status</span>
                                    <Badge variant={"secondary"}>Active</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Points</span>
                                    <span>{user.points.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                     <Button variant="outline" size="sm">View details</Button>
                                     <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/5">Suspend</Button>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </CollapsibleContent>
            </TableBody>
        </Collapsible>
    );
}

export function UserList() {
    const firestore = useFirestore();
    
    const usersQuery = firestore ? query(collection(firestore, "users"), where("role", "==", "user")) : null;
    const { data: users, loading, error } = useCollection<UserProfile>(usersQuery);

    if (loading) {
        return (
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="hidden md:table-cell">Points</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (error) {
        return <div>Error loading users. Please try again.</div>
    }

    if (!users || users.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No users found.</div>
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">Points</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                {users.map((user) => (
                    <UserRow key={user.uid} user={user} />
                ))}
            </Table>
        </div>
    );
}
