"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteUrls } from "@/config/urls";
import type { UserDropdownNavItems } from "@/config/user-dropdown";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";
import type { User } from "next-auth";
import Link from "next/link";
import { Fragment } from "react";
import { SignoutTrigger } from "@/components/signout-trigger";

export type UserDropdownContentProps = {
    user: User | null;
    navItems: UserDropdownNavItems[];
    isCollapsed?: boolean;
};

export function UserDropdownContent({
    user,
    navItems,
    isCollapsed = false,
}: UserDropdownContentProps) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "flex w-full min-w-0 justify-start gap-2 overflow-hidden p-2",
                        isCollapsed &&
                            "!size-8 !min-w-0 !shrink-0 p-0 justify-center",
                    )}
                    aria-label="user dropdown"
                >
                    <Avatar
                        className={cn(
                            "h-6 w-6 shrink-0",
                            isCollapsed && "h-5 w-5",
                        )}
                    >
                        <AvatarImage src={user?.image ?? ""} />
                        <AvatarFallback className="text-xs">
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {!isCollapsed && (
                        <span className="truncate">{user?.email}</span>
                    )}

                    <span className="sr-only">user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="start">
                <DropdownMenuLabel className="flex w-56 flex-col items-start gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.image ?? ""} />
                        <AvatarFallback>
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex w-full flex-col">
                        <p className="truncate text-sm">
                            {user?.name ?? "Name not found"}
                        </p>
                        <p className="w-full truncate text-sm font-light text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {navItems.map((nav) => (
                    <Fragment key={nav.id}>
                        <DropdownMenuLabel>{nav.label}</DropdownMenuLabel>
                        {nav.items.map((item) => (
                            <DropdownMenuItem key={item.label} asChild>
                                <Link
                                    href={item.href}
                                    className="flex w-full cursor-pointer items-center gap-2"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                    </Fragment>
                ))}
                <SignoutTrigger callbackUrl={siteUrls.home} asChild>
                    <DropdownMenuItem asChild>
                        <button className="flex w-full cursor-pointer items-center gap-2 text-red-500 ">
                            <LogOutIcon className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </DropdownMenuItem>
                </SignoutTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
