import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from '../file-upload';

export function ProfessionalExperience({ data, updateData }) {
  const [internshipCount, setInternshipCount] = useState(data?.internshipCount || '');

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateData({ [name]: Array.from(files) });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="hasInternship">Do you have internship experience?</Label>
          <Select
            onValueChange={(value) => handleChange('hasInternship', value)}
            value={data?.hasInternship || ''}
          >
            <SelectTrigger id="hasInternship">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data?.hasInternship === 'yes' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="internshipCount">How many internships?</Label>
              <Input
                id="internshipCount"
                type="number"
                value={internshipCount}
                onChange={(e) => {
                  setInternshipCount(e.target.value);
                  handleChange('internshipCount', e.target.value);
                }}
                min="0"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internshipExperience">Describe your internship experience</Label>
              <Textarea
                id="internshipExperience"
                value={data?.internshipExperience || ''}
                onChange={(e) => handleChange('internshipExperience', e.target.value)}
                placeholder="Please provide details about your internship(s), including company names, roles, and key responsibilities."
                className="min-h-[100px]"
              />
            </div>
          </>
        )}

        <FileUpload 
          label="Proof of Internships"
          name="internshipProof"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple={true}
          maxSize={5}
          tooltip="Upload PDFs or images of your internship certificates or offer letters. Max 5MB per file."
          onChange={(files) => handleFileChange('internshipProof', files)}
        />
      </CardContent>
    </Card>
  );
}
