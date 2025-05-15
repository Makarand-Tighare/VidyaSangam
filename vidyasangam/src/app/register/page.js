'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import axios from "axios"
import NavBar from "../components/navBar"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    registrationNumber: "",
    year: "",
    semester: "",
    section: "",
    department_id: "",
    mobileNumber: "",
    mobileOtp: "",
    password: "",
    confirmPassword: "",
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [mobileOtpSent, setMobileOtpSent] = useState(false)
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [sendingMobileOtp, setSendingMobileOtp] = useState(false)
  const [verifyingMobileOtp, setVerifyingMobileOtp] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiErrors, setApiErrors] = useState([])
  const [passwordStrength, setPasswordStrength] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("https://vidyasangam.duckdns.org/api/user/departments-public/")
        if (response.status === 200) {
          setDepartments(response.data)
          console.log("Departments fetched:", response.data)
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }
    
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password)
    }
  }, [formData.password])

  useEffect(() => {
    const isValid =
      otpVerified &&
      // mobileOtpVerified &&
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.registrationNumber.trim() !== "" &&
      formData.year !== "" &&
      formData.semester !== "" &&
      formData.section.trim() !== "" &&
      formData.department_id !== "" &&
      formData.mobileNumber.trim() !== "" &&
      formData.password.trim() !== "" &&
      !Object.values(errors).some((error) => error !== "") &&
      (passwordStrength === "Strong" || passwordStrength === "Very Strong")
    setIsFormValid(isValid)
    console.log("Form validity updated:", isValid)
  }, [formData, errors, otpVerified, mobileOtpVerified, passwordStrength])

  useEffect(() => {
    console.log("Form State:", { formData, errors, otpVerified, mobileOtpVerified, passwordStrength, isFormValid })
  }, [formData, errors, otpVerified, mobileOtpVerified, passwordStrength, isFormValid])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const validateField = async (name, value) => {
    let error = ""
    switch (name) {
      case "password":
        if (value.length < 8) {
          error = "Password must be at least 8 characters long"
        } else if (!/[A-Z]/.test(value)) {
          error = "Password must contain at least one uppercase letter"
        } else if (!/[a-z]/.test(value)) {
          error = "Password must contain at least one lowercase letter"
        } else if (!/[0-9]/.test(value)) {
          error = "Password must contain at least one number"
        } else if (!/[!@#$%^&*]/.test(value)) {
          error = "Password must contain at least one special character (!@#$%^&*)"
        }
        break
      case "mobileNumber":
        if (!/^\+91\d{10}$/.test(value) && !/^\d{10}$/.test(value)) {
          error = "Invalid mobile number. Use format: +91XXXXXXXXXX or XXXXXXXXXX"
        }
        break
      default:
        error = value.trim() === "" ? "This field is required" : ""
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const checkPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++

    switch (strength) {
      case 0:
      case 1:
        setPasswordStrength("Very Weak")
        break
      case 2:
        setPasswordStrength("Weak")
        break
      case 3:
        setPasswordStrength("Medium")
        break
      case 4:
        setPasswordStrength("Strong")
        break
      case 5:
        setPasswordStrength("Very Strong")
        break
      default:
        setPasswordStrength("")
    }
  }

  const handleSendOTP = async () => {
    if (errors.email) return
    setLoading(true)
    setApiErrors([])
    try {
      const response = await axios.post(
        "https://vidyasangam.duckdns.org/api/user/send-otp/",
        { email: formData.email },
        { withCredentials: true }
      )
      if (response.status === 200) {
        setOtpSent(true)
        toast.success("OTP sent successfully. Check your email (including spam folder).")
      } else {
        toast.error("Failed to send OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error sending OTP", error)
      if (error.response?.data?.errors) {
        const errorMessages = []
        const errorData = error.response.data.errors
        
        // Handle non-field errors
        if (errorData.non_field_errors) {
          errorMessages.push(...errorData.non_field_errors)
        }
        
        // Handle field-specific errors
        Object.keys(errorData).forEach(key => {
          if (key !== 'non_field_errors') {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`)
          }
        })
        
        setApiErrors(errorMessages)
        errorMessages.forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response?.data?.message || "Error sending OTP. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setVerifyingOtp(true)
    setApiErrors([])
    try {
      const response = await axios.post(
        "https://vidyasangam.duckdns.org/api/user/verify-otp/",
        { email: formData.email, otp: formData.otp },
        { withCredentials: true }
      )
      if (response.status === 200) {
        setOtpVerified(true)
        toast.success("Email verified successfully")
        setFormData((prev) => ({ ...prev, otp: "" }))
      } else {
        toast.error("Invalid OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      if (error.response?.data?.errors) {
        const errorMessages = []
        const errorData = error.response.data.errors
        
        // Handle non-field errors
        if (errorData.non_field_errors) {
          errorMessages.push(...errorData.non_field_errors)
        }
        
        // Handle field-specific errors
        Object.keys(errorData).forEach(key => {
          if (key !== 'non_field_errors') {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`)
          }
        })
        
        setApiErrors(errorMessages)
        errorMessages.forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response?.data?.message || "Error verifying OTP. Please try again.")
      }
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleSendMobileOTP = async () => {
    if (!formData.mobileNumber || errors.mobileNumber) return
    setSendingMobileOtp(true)
    setApiErrors([])
    
    let formattedMobileNumber = formData.mobileNumber
    if (!formattedMobileNumber.startsWith('+91')) {
      formattedMobileNumber = '+91' + formattedMobileNumber
    }
    
    try {
      const response = await axios.post(
        "https://vidyasangam.duckdns.org/api/user/send-mobile-otp/",
        { mobile_number: formattedMobileNumber },
        { withCredentials: true }
      )
      if (response.status === 200) {
        setMobileOtpSent(true)
        toast.success("OTP sent successfully to your mobile number.")
      } else {
        toast.error("Failed to send mobile OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error sending mobile OTP", error)
      if (error.response?.data?.errors) {
        const errorMessages = []
        const errorData = error.response.data.errors
        
        // Handle non-field errors
        if (errorData.non_field_errors) {
          errorMessages.push(...errorData.non_field_errors)
        }
        
        // Handle field-specific errors
        Object.keys(errorData).forEach(key => {
          if (key !== 'non_field_errors') {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`)
          }
        })
        
        setApiErrors(errorMessages)
        errorMessages.forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response?.data?.message || "Error sending mobile OTP. Please try again later.")
      }
    } finally {
      setSendingMobileOtp(false)
    }
  }

  const handleVerifyMobileOTP = async () => {
    setVerifyingMobileOtp(true)
    setApiErrors([])
    
    let formattedMobileNumber = formData.mobileNumber
    if (!formattedMobileNumber.startsWith('+91')) {
      formattedMobileNumber = '+91' + formattedMobileNumber
    }
    
    try {
      const response = await axios.post(
        "https://vidyasangam.duckdns.org/api/user/verify-mobile-otp/",
        { mobile_number: formattedMobileNumber, otp: formData.mobileOtp },
        { withCredentials: true }
      )
      if (response.status === 200) {
        setMobileOtpVerified(true)
        toast.success("Mobile number verified successfully")
        setFormData((prev) => ({ ...prev, mobileOtp: "" }))
      } else {
        toast.error("Invalid mobile OTP. Please try again.")
      }
    } catch (error) {
      console.error("Error verifying mobile OTP:", error)
      if (error.response?.data?.errors) {
        const errorMessages = []
        const errorData = error.response.data.errors
        
        // Handle non-field errors
        if (errorData.non_field_errors) {
          errorMessages.push(...errorData.non_field_errors)
        }
        
        // Handle field-specific errors
        Object.keys(errorData).forEach(key => {
          if (key !== 'non_field_errors') {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`)
          }
        })
        
        setApiErrors(errorMessages)
        errorMessages.forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response?.data?.message || "Error verifying mobile OTP. Please try again.")
      }
    } finally {
      setVerifyingMobileOtp(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!isFormValid) {
      toast.error("Please fill all fields correctly and ensure a strong password before submitting.")
      return
    }

    setRegistering(true)
    setApiErrors([])
    // Debug log for department value
    console.log("Department ID before API call:", formData.department_id)
    console.log("Complete form data:", formData)
    
    let formattedMobileNumber = formData.mobileNumber
    if (!formattedMobileNumber.startsWith('+91')) {
      formattedMobileNumber = '+91' + formattedMobileNumber
    }

    try {
      const requestData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formattedMobileNumber,
        reg_no: formData.registrationNumber,
        section: formData.section,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        year: formData.year,
        semester: formData.semester,
        password: formData.password,
        password2: formData.password,
      }
      
      console.log("Request payload:", requestData)

      const response = await axios.post(
        "https://vidyasangam.duckdns.org/api/user/register/",
        requestData,
        { withCredentials: true }
      )

      console.log("Registration response:", response)

      if (response.status === 201) {
        toast.success("Registration successful! Redirecting to login...")
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        toast.error(response.data.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error", error)
      console.error("Error response:", error.response?.data)
      
      if (error.response?.data?.errors) {
        const errorMessages = []
        const errorData = error.response.data.errors
        
        // Handle non-field errors
        if (errorData.non_field_errors) {
          errorMessages.push(...errorData.non_field_errors)
        }
        
        // Handle field-specific errors
        Object.keys(errorData).forEach(key => {
          if (key !== 'non_field_errors') {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`)
          }
        })
        
        setApiErrors(errorMessages)
        errorMessages.forEach(msg => toast.error(msg))
      } else {
        toast.error(error.response?.data?.message || "An error occurred during registration. Please try again.")
      }
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] p-2">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg border border-gray-300 shadow-lg rounded-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-[#3a3a3a]">Register</CardTitle>
          </CardHeader>
          <CardContent>
            {apiErrors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {apiErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex space-x-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpSent || loading || errors.email}
                    className={`bg-[#4f83f8] hover:bg-[#357ae8] text-white`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : otpSent ? "OTP Sent" : "Send OTP"}
                  </Button>
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
              {otpSent && !otpVerified && (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="bg-[#4f83f8] hover:bg-[#357ae8] text-white"
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                  {errors.otpVerified && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>OTP Verification</AlertTitle>
                      <AlertDescription>{errors.otpVerified}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {otpVerified && (
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>OTP Verified</AlertTitle>
                  <AlertDescription>Your email has been successfully verified.</AlertDescription>
                </Alert>
              )}
              {otpVerified && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regNo">Registration Number</Label>
                    <Input
                      id="regNo"
                      name="registrationNumber"
                      required
                      value={formData.registrationNumber}
                      onChange={handleChange}
                    />
                    {errors.registrationNumber && <p className="text-red-500 text-xs">{errors.registrationNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      name="department_id" 
                      onValueChange={(value) => handleChange({ target: { name: "department_id", value } })}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name} ({dept.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.department_id && <p className="text-red-500 text-xs">{errors.department_id}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select name="year" onValueChange={(value) => handleChange({ target: { name: "year", value } })}>
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select name="semester" onValueChange={(value) => handleChange({ target: { name: "semester", value } })}>
                        <SelectTrigger id="semester">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.year === "1" && (
                            <>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                            </>
                          )}
                          {formData.year === "2" && (
                            <>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                            </>
                          )}
                          {formData.year === "3" && (
                            <>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                            </>
                          )}
                          {formData.year === "4" && (
                            <>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.semester && <p className="text-red-500 text-xs">{errors.semester}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      name="section"
                      required
                      value={formData.section}
                      onChange={handleChange}
                    />
                    {errors.section && <p className="text-red-500 text-xs">{errors.section}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="mobile"
                        name="mobileNumber"
                        type="tel"
                        required
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="+91XXXXXXXXXX or XXXXXXXXXX"
                      />
                      {/* Mobile OTP functionality temporarily disabled
                      <Button
                        type="button"
                        onClick={handleSendMobileOTP}
                        disabled={mobileOtpSent || sendingMobileOtp || errors.mobileNumber}
                        className={`bg-[#4f83f8] hover:bg-[#357ae8] text-white`}
                      >
                        {sendingMobileOtp ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : mobileOtpSent ? "OTP Sent" : "Send OTP"}
                      </Button>
                      */}
                    </div>
                    {errors.mobileNumber && <p className="text-red-500 text-xs">{errors.mobileNumber}</p>}
                    <p className="text-xs text-gray-500">Enter with or without +91 prefix</p>
                  </div>
                  
                  {/* Mobile OTP verification temporarily disabled
                  {mobileOtpSent && !mobileOtpVerified && (
                    <div className="space-y-2">
                      <Label htmlFor="mobileOtp">Mobile OTP</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="mobileOtp"
                          name="mobileOtp"
                          type="text"
                          value={formData.mobileOtp}
                          onChange={handleChange}
                          required
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyMobileOTP}
                          className="bg-[#4f83f8] hover:bg-[#357ae8] text-white"
                          disabled={verifyingMobileOtp}
                        >
                          {verifyingMobileOtp ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {mobileOtpVerified && (
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Mobile OTP Verified</AlertTitle>
                      <AlertDescription>Your mobile number has been successfully verified.</AlertDescription>
                    </Alert>
                  )}
                  */}

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                    {passwordStrength && (
                      <p className={`text-xs ${
                        passwordStrength === "Very Weak" || passwordStrength === "Weak"
                          ? "text-red-500"
                          : passwordStrength === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}>
                        Password Strength: {passwordStrength}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#4f83f8] hover:bg-[#357ae8] text-white"
                    disabled={!isFormValid || registering}
                  >
                    {registering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-[#3a3a3a]">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}