'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import NavBar from '../components/navBar'
import LinkedInButton from '../components/linkedinButton';

export default function Profile() {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    status: '',
    email: '',
    phone: '',
    section: '',
    year: '',
    semester: '',
    linkedin_access_token: '',
  })

  const [mentorMenteeData, setMentorMenteeData] = useState({
    mentor: null,
    mentees: [],
    branch: '',
    tech_stack: '',
    areas_of_interest: '',
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    privacy: 'public',
    dataSharing: 'yes',
    twoFactor: 'on',
    phoneNumber: '',
  })

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) throw new Error('No auth token found')

        const response = await fetch('http://127.0.0.1:8000/api/user/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        if (!response.ok) throw new Error('Failed to fetch user data')

        const data = await response.json()
        setFormData({
          registrationNumber: data.reg_no || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          organizationName: 'Yeshwantrao Chavan College of Engineering (YCCE), Nagpur',
          status: 'Loading...',
          email: data.email || '',
          phone: data.mobile_number || '',
          section: data.section || '',
          year: data.year || '',
          semester: data.semester || '',
          linkedin_access_token: data.linkedin_access_token || '',
        })

        // Fetch mentor/mentee status
        if (data.reg_no) {
          fetchMentorMenteeStatus(data.reg_no)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const fetchMentorMenteeStatus = async (registrationNo) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/mentor_mentee/profile/${registrationNo}/`)
      
      if (!response.ok) throw new Error('Failed to fetch mentor/mentee data')
      
      const data = await response.json()
      console.log('Mentor/Mentee API response:', data)
      
      setMentorMenteeData({
        mentor: data.mentor,
        mentees: data.mentees || [],
        branch: data.branch || '',
        tech_stack: data.tech_stack || '',
        areas_of_interest: data.areas_of_interest || '',
      })
      
      // Determine status based on the mentor/mentee data
      let status = 'Student'
      
      // If the person has mentoring_preferences set to mentor in the API
      if (data.mentoring_preferences && data.mentoring_preferences.toLowerCase() === 'mentor') {
        status = 'Mentor'
      }
      // If they have mentees assigned (regardless of preferences)
      else if (data.mentees && data.mentees.length > 0) {
        status = 'Mentor'
      }
      // If they have a mentor assigned
      else if (data.mentor !== null) {
        status = 'Mentee'
      }
      
      console.log('Determined status:', status)
      
      setFormData(prev => ({
        ...prev,
        status
      }))
      
    } catch (error) {
      console.error('Error fetching mentor/mentee status:', error)
      setFormData(prev => ({
        ...prev,
        status: 'Student'
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSecurityChange = (e) => {
    const { name, value } = e.target
    setSecurityData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsEditing(false)
    console.log('Form Data Saved:', formData)
    // Implement API call to save data
  }

  const handleSecuritySubmit = (e) => {
    e.preventDefault()
    console.log('Security Data Saved:', securityData)
    // Implement API call to save security data
  }

  return (
    <div className="container mx-auto px-4 py-2">
      <NavBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
          <Avatar className="w-32 h-32 mb-4">
        <AvatarImage src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1730071119~exp=1730074719~hmac=37544826c51ddd25b4d265c9336deff7b884deb1771c551bcf5b23bbfa75a336&w=1380" alt="Profile" />
        <AvatarFallback>PP</AvatarFallback>
      </Avatar>
            <p className="text-sm text-muted-foreground mb-4">JPG or PNG no larger than 5 MB</p>
            <Button>Upload new image</Button>
            <br />
            {formData.linkedin_access_token && formData.linkedin_access_token.length > 1 ? (
              <Button style={{ backgroundColor: 'skyblue' }}>LinkedIn connected</Button>
            ) : (
              <LinkedInButton />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <Button type="submit" disabled={!isEditing} onClick={() => !isEditing && setIsEditing(true)}>
                {isEditing ? "Save Changes" : "Edit Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mentorMenteeData.mentor !== null && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Your Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-700 mb-2">
                  {mentorMenteeData.mentor?.name || "Not assigned yet"}
                </h3>
                {mentorMenteeData.mentor && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Registration No:</p>
                      <p>{mentorMenteeData.mentor.registration_no}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Semester:</p>
                      <p>{mentorMenteeData.mentor.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Tech Stack:</p>
                      <p>{mentorMenteeData.mentor.tech_stack || "Not specified"}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {mentorMenteeData.mentees.length > 0 && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Your Mentees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tech Stack</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mentorMenteeData.mentees.map((mentee, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mentee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.registration_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.branch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentee.tech_stack}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="password">Change Password</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="twoFactor">Two-Factor Auth</TabsTrigger>
              </TabsList>
              <TabsContent value="password">
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  <Button type="submit">Change Password</Button>
                </form>
              </TabsContent>
              <TabsContent value="privacy">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Account Privacy</h3>
                    <RadioGroup
                      name="privacy"
                      value={securityData.privacy}
                      onValueChange={(value) => setSecurityData(prev => ({ ...prev, privacy: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public">Public (posts are available to all users)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private">Private (posts are only available to friends)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Data Sharing</h3>
                    <RadioGroup
                      name="dataSharing"
                      value={securityData.dataSharing}
                      onValueChange={(value) => setSecurityData(prev => ({ ...prev, dataSharing: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="data-sharing-yes" />
                        <Label htmlFor="data-sharing-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="data-sharing-no" />
                        <Label htmlFor="data-sharing-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="twoFactor">
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <RadioGroup
                      name="twoFactor"
                      value={securityData.twoFactor}
                      onValueChange={(value) => setSecurityData(prev => ({ ...prev, twoFactor: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on" id="two-factor-on" />
                        <Label htmlFor="two-factor-on">On</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="off" id="two-factor-off" />
                        <Label htmlFor="two-factor-off">Off</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number for Verification</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={securityData.phoneNumber}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  <Button type="submit">Save Security Settings</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
