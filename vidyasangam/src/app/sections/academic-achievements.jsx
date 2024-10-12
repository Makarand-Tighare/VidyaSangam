import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <Label htmlFor="researchPapers">Published Research Papers</Label>
        <Select 
          onValueChange={(value) => handleChange('researchPapers', value)}
          value={data?.researchPapers || ''}
        >
          <SelectTrigger id="researchPapers">
            <SelectValue placeholder="Select research paper type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="International">International</SelectItem>
            <SelectItem value="National">National</SelectItem>
            <SelectItem value="Conferences">Conferences</SelectItem>
            <SelectItem value="None">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data?.researchPapers && data.researchPapers !== 'None' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="paperCount">Number of Papers</Label>
            <Input 
              id="paperCount" 
              name="paperCount" 
              type="number" 
              min="1"
              value={data?.paperCount || ''} 
              onChange={(e) => handleChange('paperCount', e.target.value)} 
            />
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
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="hackathonParticipation">Hackathon Participation</Label>
        <Select 
          onValueChange={(value) => handleChange('hackathonParticipation', value)}
          value={data?.hackathonParticipation || ''}
        >
          <SelectTrigger id="hackathonParticipation">
            <SelectValue placeholder="Select hackathon level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="International">International</SelectItem>
            <SelectItem value="National">National</SelectItem>
            <SelectItem value="College">College</SelectItem>
            <SelectItem value="None">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data?.hackathonParticipation && data.hackathonParticipation !== 'None' && (
        <>
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
              <SelectTrigger id="hackathonRole">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team leader">Team Lead</SelectItem>
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
        </>
      )}
    </div>
  );
}