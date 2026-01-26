"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "admin" && password === "admin") {
            router.push("/dashboard");
        } else if (email.includes("@") && password.length >= 6) {
            // Allow common email format for demo too
            router.push("/dashboard");
        } else {
            setError("Please use 'admin' / 'admin' or a valid email/password.");
        }
    };
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md border-0 glass premium-shadow sm:border sm:rounded-3xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 premium-shadow">
                        <svg
                            className="h-8 w-8 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Engram
                    </CardTitle>
                    <CardDescription className="text-xl text-primary italic">
                        "Knowledge that stays."
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Email or Username
                            </label>
                            <Input
                                id="email"
                                placeholder="admin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="admin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                        <Button type="submit" className="w-full" size="lg">
                            Continue learning
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-primary hover:underline"
                        >
                            Create an account
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
