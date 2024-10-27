"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NavBar from "../components/navBar";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    registrationNumber: "",
    year: "",
    semester: "",
    section: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const {
    email,
    otp,
    firstName,
    lastName,
    registrationNumber,
    year,
    semester,
    section,
    mobileNumber,
    password,
    confirmPassword,
  } = formData;

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password);
    }
  }, [formData.password, router]); // Added router to dependency array

  useEffect(() => {
    const isValid =
      otpVerified &&
      Object.values(errors).every((error) => error === "") &&
      Object.values(formData).every((value) => value !== "") &&
      (passwordStrength === "Strong" || passwordStrength === "Very Strong");
    setIsFormValid(isValid);
  }, [formData, errors, otpVerified, passwordStrength, router]); // Added router to dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = async (name, value) => {
    let error = "";
    switch (name) {
      case "password":
        if (value.length < 8) {
          error = "Password must be at least 8 characters long";
        } else if (!/[A-Z]/.test(value)) {
          error = "Password must contain at least one uppercase letter";
        } else if (!/[a-z]/.test(value)) {
          error = "Password must contain at least one lowercase letter";
        } else if (!/[0-9]/.test(value)) {
          error = "Password must contain at least one number";
        } else if (!/[!@#$%^&*]/.test(value)) {
          error = "Password must contain at least one special character (!@#$%^&*)";
        }
        break;

      case "mobileNumber":
        error = !/^\d{10}$/.test(value) ? "Invalid mobile number" : "";
        break;

      default:
        error = value.trim() === "" ? "This field is required" : "";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        setPasswordStrength("Very Weak");
        break;
      case 2:
        setPasswordStrength("Weak");
        break;
      case 3:
        setPasswordStrength("Medium");
        break;
      case 4:
        setPasswordStrength("Strong");
        break;
      case 5:
        setPasswordStrength("Very Strong");
        break;
      default:
        setPasswordStrength("");
    }
  };

  const handleSendOTP = async () => {
    if (errors.email) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/user/send-otp/",
        { email: formData.email },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setOtpSent(true);
        setErrors((prev) => ({ ...prev, otpSent: "OTP sent to your email. Check Spam Folder." }));
      } else {
        setErrors((prev) => ({ ...prev, otpSent: "Failed to send OTP" }));
      }
    } catch (error) {
      console.error("Error sending OTP", error);
      setErrors((prev) => ({ ...prev, otpSent: "Error sending OTP" }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/user/verify-otp/",
        { email, otp },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setOtpVerified(true);
        setErrors((prev) => ({ ...prev, otpVerified: "" }));
        setFormData((prev) => ({ ...prev, otp: "" })); // Clear OTP field
      } else {
        setErrors((prev) => ({ ...prev, otpVerified: "Invalid OTP. Please try again." }));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        alert(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        alert("Error verifying OTP");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill all fields correctly and ensure a strong password before submitting.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/user/register/", {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.mobileNumber,
        reg_no: formData.registrationNumber,
        section: formData.section,
        year: formData.year,
        semester: formData.semester,
        password: formData.password,
        password2: formData.confirmPassword, // Fixed to use confirmPassword
      });

      if (response.status === 201) {
        alert("Registration Successful!");
        router.push("/login");
      } else {
        alert(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error", error);
      alert("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] p-2">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg border border-gray-300 shadow-lg rounded-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-[#3a3a3a]">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <span className="text-red-500">{errors.firstName}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && <span className="text-red-500">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={handleChange}
                  />
                  {errors.email && <span className="text-red-500">{errors.email}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    required
                    value={mobileNumber}
                    onChange={handleChange}
                  />
                  {errors.mobileNumber && <span className="text-red-500">{errors.mobileNumber}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    required
                    value={registrationNumber}
                    onChange={handleChange}
                  />
                  {errors.registrationNumber && <span className="text-red-500">{errors.registrationNumber}</span>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      name="year"
                      required
                      value={year}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.year && <span className="text-red-500">{errors.year}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      name="semester"
                      required
                      value={semester}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                        <SelectItem value="4">4th Semester</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.semester && <span className="text-red-500">{errors.semester}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select
                      name="section"
                      required
                      value={section}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.section && <span className="text-red-500">{errors.section}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={password}
                    onChange={handleChange}
                  />
                  {errors.password && <span className="text-red-500">{errors.password}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword}</span>}
                </div>
                {passwordStrength && (
                  <div className={`text-${passwordStrength === "Very Strong" ? "green" : "red"}-500`}>
                    Password Strength: {passwordStrength}
                  </div>
                )}
                <Button type="button" onClick={handleSendOTP} disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      required
                      value={otp}
                      onChange={handleChange}
                    />
                    <Button type="button" onClick={handleVerifyOTP}>
                      Verify OTP
                    </Button>
                  </div>
                )}
                {errors.otpVerified && <span className="text-red-500">{errors.otpVerified}</span>}
              </div>
              <CardFooter className="flex justify-center mt-4">
                <Button type="submit" disabled={!isFormValid}>
                  Register
                </Button>
              </CardFooter>
            </form>
            <div className="mt-4 text-center">
              Already have an account? <Link href="/login">Login here</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
