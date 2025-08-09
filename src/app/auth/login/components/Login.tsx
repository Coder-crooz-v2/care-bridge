"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StethoscopeIcon } from "lucide-react";
import { login } from "../../actions";
import { loginSchema } from "@/schema/loginSchema";
import { ApiError } from "next/dist/server/api-utils";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPageComponent() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore(); // Assuming you have a useAuthStore hook to manage user state
  const router  = useRouter();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });
  const handleLogin = async () => {
    setLoading(true);
    try {
      loginSchema.parse(formData); // Validate form data against schema
      const { error, user: userData } = await login({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        throw new ApiError(400, error);
      }
      if(userData) {
        setUser(userData); // Set user data in the store
        toast.success("Login successful!");
        router.push("/dashboard/chat"); // Redirect to dashboard or home page
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach(err => {
          toast.error(err.message);
        })
      } else if (error instanceof ApiError) {
        // Handle API errors
        toast.error(error.message)
      } else if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        // Handle unexpected errors
        toast.error(error.message)
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Login Form */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-full md:w-1/2 bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center py-12 px-6"
      >
        {/* Logo and Company Name */}
        <div className="flex items-center mb-8 absolute top-0 left-0 p-6">
          <div className="bg-blue-600 rounded-lg p-2 mr-3">
            {/* Simple medical icon, replace with your logo if available */}
            <StethoscopeIcon color="white" />
          </div>
          <span className="text-xl font-bold text-blue-900 tracking-wide">
            CareBridge
          </span>
        </div>

        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-blue-900 text-center">
              Login to your account
            </CardTitle>
            <CardDescription className="text-center text-blue-600/70">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-blue-800">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-blue-50/50 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-blue-800">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="******"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-blue-50/50 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="mt-2 text-xs text-center text-blue-700">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Right: Image */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
        className="hidden md:flex w-1/2 relative bg-blue-100 items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/60 to-blue-400/40 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1546659934-038aab8f3f3b?q=80&w=899&auto=format&fit=crop"
          alt="Healthcare illustration"
          fill
          style={{ objectFit: "cover" }}
          className="z-0"
          priority
        />
        {/* Optional: Overlay text or logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative z-20 text-white text-2xl font-semibold text-center px-8"
        >
          <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-900 transition-all duration-300">
            Welcome to <span className="text-blue-200">CareBridge</span>
            <div className="text-base font-normal mt-2 text-blue-100/90">
              Bridging you to better health, every day.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
