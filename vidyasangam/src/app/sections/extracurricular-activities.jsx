import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from '../file-upload'

export function ExtracurricularActivities({ data, updateData, updateFiles, errors = {}, required = false }) {
  const [hasExtracurricularActivities, setHasExtracurricularActivities] = useState(data?.hasExtracurricularActivities || '')
  const [describeExtracurricularActivities, setDescribeExtracurricularActivities] = useState(data?.describeExtracurricularActivities || '')

  useEffect(() => {
    setHasExtracurricularActivities(data?.hasExtracurricularActivities || '');
    setDescribeExtracurricularActivities(data?.describeExtracurricularActivities || '');
  }, [data?.hasExtracurricularActivities, data?.describeExtracurricularActivities]);

  const handleChange = (name, value) => {
    updateData({ [name]: value })
  }

  const handleFileChange = (name, files) => {
    if (files) {
      updateFiles(name, Array.from(files))
    }
  }

  // Determine if file upload is required
  const isFileUploadRequired = hasExtracurricularActivities === 'yes';

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <Label htmlFor="hasExtracurricularActivities" className="flex items-center">
            Participated in extracurricular activities?
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={hasExtracurricularActivities}
            onValueChange={(value) => {
              setHasExtracurricularActivities(value)
              handleChange('hasExtracurricularActivities', value)
            }}
          >
            <SelectTrigger id="hasExtracurricularActivities" className={errors.hasExtracurricularActivities ? "border-red-500" : ""}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {errors.hasExtracurricularActivities && (
            <p className="text-sm text-red-500">{errors.hasExtracurricularActivities}</p>
          )}
        </div>

        {hasExtracurricularActivities === 'yes' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="describeExtracurricularActivities" className="flex items-center">
                Describe your extracurricular activities
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea 
                id="describeExtracurricularActivities"
                placeholder="List your activities including sports, cultural activities, volunteer work, etc."
                value={describeExtracurricularActivities}
                onChange={(e) => {
                  setDescribeExtracurricularActivities(e.target.value);
                  handleChange('describeExtracurricularActivities', e.target.value);
                }}
                className={`min-h-[150px] ${errors.describeExtracurricularActivities ? "border-red-500" : ""}`}
              />
              {errors.describeExtracurricularActivities && (
                <p className="text-sm text-red-500">{errors.describeExtracurricularActivities}</p>
              )}
            </div>

            <FileUpload 
              label="Proof of Extracurricular Activities"
              name="extracurricularActivitiesProof"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple={true}
              maxSize={5}
              tooltip="Upload certificates or proofs of your extracurricular activities (Max 5MB)"
              onChange={handleFileChange}
              required={isFileUploadRequired}
              error={errors.extracurricularActivitiesProof}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
