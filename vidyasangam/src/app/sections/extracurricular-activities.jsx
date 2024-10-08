import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FileUpload } from '../file-upload';

export function ExtracurricularActivities({ data, updateData }) {
  const [seminars, setSeminars] = useState(data?.seminars || []);
  const [activities, setActivities] = useState(data?.activities || []);

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateData({ [name]: Array.from(files) });
    }
  };

  const addSeminar = () => {
    setSeminars([...seminars, { attended: 'yes', details: '' }]);
  };

  const addActivity = () => {
    setActivities([...activities, { participated: 'yes', details: '' }]);
  };

  const updateSeminar = (index, field, value) => {
    const updatedSeminars = [...seminars];
    updatedSeminars[index][field] = value;
    setSeminars(updatedSeminars);
    handleChange('seminars', updatedSeminars);
  };

  const updateActivity = (index, field, value) => {
    const updatedActivities = [...activities];
    updatedActivities[index][field] = value;
    setActivities(updatedActivities);
    handleChange('activities', updatedActivities);
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Seminars/Workshops Attended</Label>
          {seminars.map((seminar, index) => (
            <Card key={index} className="p-4 space-y-4">
              <Select
                value={seminar.attended}
                onValueChange={(value) => updateSeminar(index, 'attended', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Did you attend?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {seminar.attended === 'yes' && (
                <Textarea
                  maxLength={200}
                  placeholder="Describe what you did..."
                  value={seminar.details}
                  onChange={(e) => updateSeminar(index, 'details', e.target.value)}
                  className="min-h-[100px]"
                />
              )}
            </Card>
          ))}
          <Button onClick={addSeminar} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Seminar/Workshop
          </Button>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-semibold">Extracurricular Activities</Label>
          {activities.map((activity, index) => (
            <Card key={index} className="p-4 space-y-4">
              <Select
                value={activity.participated}
                onValueChange={(value) => updateActivity(index, 'participated', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Did you participate?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {activity.participated === 'yes' && (
                <Textarea
                  maxLength={200}
                  placeholder="Describe what you did..."
                  value={activity.details}
                  onChange={(e) => updateActivity(index, 'details', e.target.value)}
                  className="min-h-[100px]"
                />
              )}
            </Card>
          ))}
          <Button onClick={addActivity} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Extracurricular Activity
          </Button>
        </div>

        <FileUpload 
          label="Proof of Extracurricular Activities"
          name="extracurricularProof"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple={true}
          maxSize={5}
          tooltip="Upload PDFs or images of certificates or other proof of your extracurricular activities. Max 5MB per file."
          onChange={(files) => handleFileChange('extracurricularProof', files)}
        />
      </CardContent>
    </Card>
  );
}
