import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from '../file-upload';

export function AcademicAchievements({ data, updateData }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateData({ [name]: Array.from(files) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Published Research Papers</Label>
        <RadioGroup 
          onValueChange={(value) => handleChange('researchPapers', value)}
          value={data?.researchPapers || ''}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="international" id="international" />
            <Label htmlFor="international">International</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="national" id="national" />
            <Label htmlFor="national">National</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="conferences" id="conferences" />
            <Label htmlFor="conferences">Conferences</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">None</Label>
          </div>
        </RadioGroup>
      </div>

      <FileUpload 
        label="Proof of Research Publications"
        name="researchProof"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple={true}
        maxSize={5}
        tooltip="Upload PDFs or images of your research publications. Max 5MB per file."
        onChange={(files) => handleFileChange('researchProof', files)}
      />

      <div className="space-y-2">
        <Label>Hackathon Participation</Label>
        <div className="flex flex-wrap gap-4">
          <Checkbox 
            id="internationalHackathon" 
            onCheckedChange={(checked) => handleChange('internationalHackathon', checked)}
            checked={data?.internationalHackathon || false}
          />
          <Label htmlFor="internationalHackathon">International</Label>
          <Checkbox 
            id="nationalHackathon" 
            onCheckedChange={(checked) => handleChange('nationalHackathon', checked)}
            checked={data?.nationalHackathon || false}
          />
          <Label htmlFor="nationalHackathon">National</Label>
          <Checkbox 
            id="collegeHackathon" 
            onCheckedChange={(checked) => handleChange('collegeHackathon', checked)}
            checked={data?.collegeHackathon || false}
          />
          <Label htmlFor="collegeHackathon">College</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hackathonWins">Number of Wins</Label>
          <Input 
            id="hackathonWins" 
            name="hackathonWins" 
            type="number" 
            min="0"
            value={data?.hackathonWins || ''} 
            onChange={(e) => handleChange('hackathonWins', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hackathonParticipations">Number of Participations</Label>
          <Input 
            id="hackathonParticipations" 
            name="hackathonParticipations" 
            type="number" 
            min="0"
            value={data?.hackathonParticipations || ''} 
            onChange={(e) => handleChange('hackathonParticipations', e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hackathonRole">Role</Label>
        <Select 
          onValueChange={(value) => handleChange('hackathonRole', value)} 
          value={data?.hackathonRole || ''}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teamLead">Team Lead</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FileUpload 
        label="Proof of Hackathon Participation/Wins"
        name="hackathonProof"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple={true}
        maxSize={5}
        tooltip="Upload PDFs or images of your hackathon certificates. Max 5MB per file."
        onChange={(files) => handleFileChange('hackathonProof', files)}
      />
    </div>
  );
}
