import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from '../file-upload';

export function ProfessionalExperience({ data, updateData, updateFiles, errors = {}, required = false }) {
  const [internshipCount, setInternshipCount] = useState(data?.internshipCount || '');

  useEffect(() => {
    setInternshipCount(data?.internshipCount || '');
  }, [data?.internshipCount]);

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateFiles(name, Array.from(files));
    }
  };

  // Determine if file upload is required
  const isFileUploadRequired = data?.hasInternship === 'yes' && internshipCount && parseInt(internshipCount) > 0;

  // Helper for matching count and files
  const internshipProofCountMismatch = isFileUploadRequired && data?.internshipProof && data.internshipProof.length !== parseInt(internshipCount);

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="hasInternship" className="flex items-center">
            Do you have internship experience?
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            onValueChange={(value) => handleChange('hasInternship', value)}
            value={data?.hasInternship || ''}
          >
            <SelectTrigger id="hasInternship" className={errors.hasInternship ? "border-red-500" : ""}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {errors.hasInternship && (
            <p className="text-sm text-red-500">{errors.hasInternship}</p>
          )}
        </div>

        {data?.hasInternship === 'yes' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="internshipCount" className="flex items-center">
                How many internships?
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="internshipCount"
                type="number"
                value={internshipCount}
                onChange={(e) => {
                  setInternshipCount(e.target.value);
                  handleChange('internshipCount', e.target.value);
                }}
                min="0"
                className={`w-full ${errors.internshipCount ? "border-red-500" : ""}`}
              />
              {errors.internshipCount && (
                <p className="text-sm text-red-500">{errors.internshipCount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internshipDescription" className="flex items-center">
                Describe your internship experience
                {required && parseInt(internshipCount) > 0 && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id="internshipDescription"
                value={data?.internshipDescription || ''}
                onChange={(e) => handleChange('internshipDescription', e.target.value)}
                placeholder="Please provide details about your internship(s), including company names, roles, and key responsibilities."
                className={`min-h-[100px] ${errors.internshipDescription ? "border-red-500" : ""}`}
              />
              {errors.internshipDescription && (
                <p className="text-sm text-red-500">{errors.internshipDescription}</p>
              )}
            </div>

            {/* Admin verification info for internship proofs */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-900 text-sm mb-2">
              Proofs are verified and approved by the admin. Please upload all certificates in a single PDF and submit.<br />
              The number of internships and certificates submitted should match.
            </div>
            {internshipProofCountMismatch && (
              <div className="text-red-600 text-sm mb-2">Number of certificates uploaded does not match the number of internships.</div>
            )}
            <FileUpload 
              label="Proof of Internships"
              name="internshipProof"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple={true}
              maxSize={5}
              tooltip="Upload PDFs or images of your internship certificates or offer letters. Max 5MB per file."
              onChange={handleFileChange}
              required={isFileUploadRequired}
              error={errors.internshipProof}
            />
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="hasSeminarsWorkshops" className="flex items-center">
            Have you attended any seminars or workshops?
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            onValueChange={(value) => handleChange('hasSeminarsWorkshops', value)}
            value={data?.hasSeminarsWorkshops || ''}
          >
            <SelectTrigger id="hasSeminarsWorkshops" className={errors.hasSeminarsWorkshops ? "border-red-500" : ""}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {errors.hasSeminarsWorkshops && (
            <p className="text-sm text-red-500">{errors.hasSeminarsWorkshops}</p>
          )}
        </div>

        {data?.hasSeminarsWorkshops === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="describeSeminarsWorkshops" className="flex items-center">
              Describe the seminars or workshops you&apos;ve attended
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="describeSeminarsWorkshops"
              value={data?.describeSeminarsWorkshops || ''}
              onChange={(e) => handleChange('describeSeminarsWorkshops', e.target.value)}
              placeholder="Please provide details about the seminars or workshops you've attended, including topics and organizers."
              className={`min-h-[100px] ${errors.describeSeminarsWorkshops ? "border-red-500" : ""}`}
            />
            {errors.describeSeminarsWorkshops && (
              <p className="text-sm text-red-500">{errors.describeSeminarsWorkshops}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
