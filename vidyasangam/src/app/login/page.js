/* eslint-disable */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "../components/navBar";
import { login, isLoggedIn } from "../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in, redirect them to the home page
    if (isLoggedIn()) {
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      if (isAdmin) {
        router.push("/adminDashboard"); // Redirect admins to admin dashboard
      } else {
        router.push("/"); // Redirect regular users to homepage
      }
    }
  }, [router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
  
   // Special case for admin login (hardcoded check)
if (email === "ycce_ct_admin@gmail.com" && password === "admin@ctycce") {
  try {
    setIsLoading(true);
    // Call admin login API using the user endpoint instead
    const response = await fetch("https://project-api-qgho.onrender.com/api/user/admin-login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log("Admin login response:", data); // Debug log
    
    if (response.ok) {
      // Store token in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      
      // Store the token correctly - adjust this based on your actual token structure
      if (data.token && data.token.access) {
        localStorage.setItem("authToken", data.token.access);
      } else if (typeof data.token === 'string') {
        localStorage.setItem("authToken", data.token);
      }
      
      router.push("/adminDashboard");
    } else {
      // Show error message from API
      if (data.errors && data.errors.non_field_errors) {
        setError(data.errors.non_field_errors.join(", "));
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Admin login failed. Please check credentials.");
      }
      
      // For development only: fallback if API doesn't work but credentials are correct
      // In production, remove this fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn("Using development fallback for admin login");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("authToken", "dev-fallback-token");
        router.push("/adminDashboard");
      }
    }
  } catch (error) {
    console.error("Admin login API error:", error);
    setError("Connection error. Could not reach authentication server.");
    
    // For development only: fallback if API doesn't work
    // In production, remove this fallback
    if (process.env.NODE_ENV === 'development') {
      console.warn("Using development fallback for admin login");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("authToken", "dev-fallback-token");
      router.push("/adminDashboard");
    }
  } finally {
    setIsLoading(false);
  }
  return;
} 
  
    try {
      const result = await login(email, password);
      
      if (result.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "false"); // Explicitly set as non-admin
        router.push("/"); // Navigate to the homepage for regular users
      } else {
        setErrorMessage(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] flex flex-col p-2">
      <NavBar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {errorMessage && (
                  <div className="text-red-500 text-sm">{errorMessage}</div>
                )}
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}