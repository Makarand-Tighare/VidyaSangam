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

export default function Profile() {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    status: '',
    email: '',
    phone: '',
    birthday: '',
    section: '',
    year: '',
    semester: '',
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
          status: 'Mentor',
          email: data.email || '',
          phone: data.mobile_number || '',
          birthday: '',
          section: data.section || '',
          year: data.year || '',
          semester: data.semester || '',
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Vidya Sangam</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src="http://bootdey.com/img/Content/avatar/avatar1.png" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground mb-4">JPG or PNG no larger than 5 MB</p>
            <Button>Upload new image</Button>
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
                    disabled={!isEditing}
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
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <Button type="submit" disabled={!isEditing}>
                {isEditing ? "Save Changes" : "Edit Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

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
