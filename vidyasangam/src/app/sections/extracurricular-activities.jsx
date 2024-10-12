import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from '../file-upload'

export function ExtracurricularActivities({ data, updateData }) {
  const [hasSeminarsWorkshops, setHasSeminarsWorkshops] = useState(data?.hasSeminarsWorkshops || 'no')
  const [hasExtracurricularActivities, setHasExtracurricularActivities] = useState(data?.hasExtracurricularActivities || 'no')
  const [seminarsWorkshops, setSeminarsWorkshops] = useState(data?.seminarsWorkshops || '')
  const [extracurricularActivities, setExtracurricularActivities] = useState(data?.extracurricularActivities || '')

  const handleChange = (name, value) => {
    updateData({ [name]: value })
  }

  const handleFileChange = (name, files) => {
    if (files) {
      updateData({ [name]: Array.from(files) })
    }
  }

  const handleSeminarsWorkshopsChange = (e) => {
    const value = e.target.value
    setSeminarsWorkshops(value)
    handleChange('seminarsWorkshops', value)
  }

  const handleExtracurricularActivitiesChange = (e) => {
    const value = e.target.value
    setExtracurricularActivities(value)
    handleChange('extracurricularActivities', value)
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <Label htmlFor="hasSeminarsWorkshops">Attended seminars or workshops?</Label>
          <Select
            value={hasSeminarsWorkshops}
            onValueChange={(value) => {
              setHasSeminarsWorkshops(value)
              handleChange('hasSeminarsWorkshops', value)
            }}
          >
            <SelectTrigger id="hasSeminarsWorkshops">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasSeminarsWorkshops === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="seminarsWorkshops">Seminars/Workshops Attended</Label>
            <Textarea 
              id="seminarsWorkshops"
              placeholder="List your seminars/workshops"
              value={seminarsWorkshops}
              onChange={handleSeminarsWorkshopsChange}
              className="min-h-[150px]"
            />
          </div>
        )}

        <div className="space-y-4">
          <Label htmlFor="hasExtracurricularActivities">Participated in extracurricular activities?</Label>
          <Select
            value={hasExtracurricularActivities}
            onValueChange={(value) => {
              setHasExtracurricularActivities(value)
              handleChange('hasExtracurricularActivities', value)
            }}
          >
            <SelectTrigger id="hasExtracurricularActivities">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasExtracurricularActivities === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="extracurricularActivities">Extracurricular Activities</Label>
            <Textarea 
              id="extracurricularActivities"
              placeholder="List your activities"
              value={extracurricularActivities}
              onChange={handleExtracurricularActivitiesChange}
              className="min-h-[150px]"
            />
          </div>
        )}

        {(hasSeminarsWorkshops === 'yes' || hasExtracurricularActivities === 'yes') && (
          <FileUpload 
            label="Proof of Activities"
            name="activitiesProof"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple={true}
            maxSize={5}
            tooltip="Upload certificates or proofs (Max 5MB)"
            onChange={(files) => handleFileChange('activitiesProof', files)}
          />
        )}
      </CardContent>
    </Card>
  )
}
