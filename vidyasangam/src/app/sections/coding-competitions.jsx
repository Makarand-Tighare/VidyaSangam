import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from '../file-upload';

export function CodingCompetitions({ data, updateData }) {
  const [competitionsCount, setCompetitionsCount] = useState(data?.competitionsCount || '');

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
          <Label htmlFor="codingCompetitions">Did you participate in any coding competitions?</Label>
          <Select
            onValueChange={(value) => handleChange('codingCompetitions', value)}
            value={data?.codingCompetitions || ''}
          >
            <SelectTrigger id="codingCompetitions">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data?.codingCompetitions === 'yes' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competitionLevel">Level of Competition</Label>
              <Select
                onValueChange={(value) => handleChange('competitionLevel', value)}
                value={data?.competitionLevel || ''}
              >
                <SelectTrigger id="competitionLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitionsCount">Number of coding competitions</Label>
              <Input
                id="competitionsCount"
                type="number"
                min="0"
                value={competitionsCount}
                onChange={(e) => {
                  setCompetitionsCount(e.target.value);
                  handleChange('competitionsCount', e.target.value);
                }}
                className="w-full"
              />
            </div>
          </div>
        )}

        <FileUpload 
          label="Proof of Coding Competitions"
          name="codingCompetitionsProof"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple={true}
          maxSize={5}
          tooltip="Upload PDFs or images of your coding competition certificates. Max 5MB per file."
          onChange={(files) => handleFileChange('codingCompetitionsProof', files)}
        />
      </CardContent>
    </Card>
  );
}
