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
  
   // Handle admin login - now supports department admin emails from our created users
   // This will detect any standard admin emails including department admins
   if (email.endsWith("@ycceadmin.edu") || email === "ycce_ct_admin@gmail.com") {
     try {
       setIsLoading(true);
       // Call admin login API using the user endpoint instead
       const response = await fetch("http://127.0.0.1:8000/api/user/admin-login/", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ email, password }),
       });
       
       const data = await response.json();
       console.log("Admin login response:", data); // Debug log
       
       if (response.ok) {
         // Store token in localStorage - handle different possible token formats
         localStorage.setItem("isLoggedIn", "true");
         localStorage.setItem("isAdmin", "true");
         
         // Handle different token formats in the response
         if (data.token && data.token.access) {
           // JWT format
           localStorage.setItem("authToken", data.token.access);
           localStorage.setItem("refreshToken", data.token.refresh || ""); // Store refresh token if available
           localStorage.setItem("tokenType", "Bearer");
         } else if (typeof data.token === 'string') {
           // Simple token
           localStorage.setItem("authToken", data.token);
           // Default to Bearer, can be adjusted if needed
           localStorage.setItem("tokenType", "Bearer");
         }
         
         // Store department information
         if (data.department) {
           console.log("Department data from login:", data.department);
           localStorage.setItem("adminDepartment", JSON.stringify({
             id: data.department.id,
             name: data.department.name,
             code: data.department.code
           }));
           localStorage.setItem("isDepartmentAdmin", "true");
         } else if (data.user && data.user.department) {
           // Alternative structure
           console.log("Department data from user object:", data.user.department);
           localStorage.setItem("adminDepartment", JSON.stringify({
             id: data.user.department.id,
             name: data.user.department.name,
             code: data.user.department.code
           }));
           localStorage.setItem("isDepartmentAdmin", "true");
         } else {
           console.log("No department data found in response");
           localStorage.setItem("isDepartmentAdmin", "false");
         }
         
         router.push("/adminDashboard");
       } else {
         // Show error message from API
         if (data.errors && data.errors.non_field_errors) {
           setErrorMessage(data.errors.non_field_errors.join(", "));
         } else if (data.error) {
           setErrorMessage(data.error);
         } else {
           setErrorMessage("Admin login failed. Please check credentials.");
         }
         
         // Remove the development fallback completely - this was causing login with wrong credentials
       }
     } catch (error) {
       console.error("Admin login API error:", error);
       setErrorMessage("Connection error. Could not reach authentication server.");
       
       // Remove the development fallback completely
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
        localStorage.setItem("isDepartmentAdmin", "false");
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
    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 min-h-screen flex-col p-2">
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