import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from '../file-upload';

export function CodingCompetitions({ data, updateData, updateFiles, errors = {}, required = false }) {
  const [competitionsCount, setCompetitionsCount] = useState(data?.competitionsCount || '');

  useEffect(() => {
    setCompetitionsCount(data?.competitionsCount || '');
  }, [data?.competitionsCount]);

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateFiles(name, Array.from(files));
    }
  };

  // Determine if file upload is required based on other conditions
  const isFileUploadRequired = data?.codingCompetitions === 'yes' && competitionsCount && parseInt(competitionsCount) > 0;

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="codingCompetitions" className="flex items-center">
            Did you participate in any coding competitions?
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            onValueChange={(value) => handleChange('codingCompetitions', value)}
            value={data?.codingCompetitions || ''}
          >
            <SelectTrigger id="codingCompetitions" className={errors.codingCompetitions ? "border-red-500" : ""}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {errors.codingCompetitions && (
            <p className="text-sm text-red-500">{errors.codingCompetitions}</p>
          )}
        </div>

        {data?.codingCompetitions === 'yes' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competitionLevel" className="flex items-center">
                Level of Competition
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                onValueChange={(value) => handleChange('competitionLevel', value)}
                value={data?.competitionLevel || ''}
              >
                <SelectTrigger id="competitionLevel" className={errors.competitionLevel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
              {errors.competitionLevel && (
                <p className="text-sm text-red-500">{errors.competitionLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitionsCount" className="flex items-center">
                Number of coding competitions
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="competitionsCount"
                type="number"
                min="1"
                value={competitionsCount}
                onChange={(e) => {
                  setCompetitionsCount(e.target.value);
                  handleChange('competitionsCount', e.target.value);
                }}
                className={`w-full ${errors.competitionsCount ? "border-red-500" : ""}`}
              />
              {errors.competitionsCount && (
                <p className="text-sm text-red-500">{errors.competitionsCount}</p>
              )}
            </div>

            <FileUpload 
              label="Proof of Coding Competitions"
              name="codingCompetitionsProof"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple={true}
              maxSize={5}
              tooltip="Upload PDFs or images of your coding competition certificates. Max 5MB per file."
              onChange={handleFileChange}
              required={isFileUploadRequired}
              error={errors.codingCompetitionsProof}
            />
          </div>
        )}
        
        {!data?.codingCompetitions && data?.codingCompetitions !== 'no' && (
          <FileUpload 
            label="Proof of Coding Competitions"
            name="codingCompetitionsProof"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple={true}
            maxSize={5}
            tooltip="Upload PDFs or images of your coding competition certificates. Max 5MB per file."
            onChange={handleFileChange}
            required={false}
            error={errors.codingCompetitionsProof}
          />
        )}
      </CardContent>
    </Card>
  );
}
