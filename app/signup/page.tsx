import Link from "next/link";
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

export default function SignupPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Create your Engram
                    </CardTitle>
                    <CardDescription className="text-base">
                        Start building your permanent knowledge base.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="name"
                            className="text-sm font-medium leading-none"
                        >
                            Name
                        </label>
                        <Input
                            id="name"
                            placeholder="Jane Doe"
                            type="text"
                            autoComplete="name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium leading-none"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium leading-none"
                        >
                            Password
                        </label>
                        <Input id="password" type="password" />
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <input
                            type="checkbox"
                            id="study-pdf"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                            htmlFor="study-pdf"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I study with PDFs
                        </label>
                    </div>

                    <Button className="w-full" size="lg">
                        Create my Engram
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Log in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
