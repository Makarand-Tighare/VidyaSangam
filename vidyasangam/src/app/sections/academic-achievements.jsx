import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from '../file-upload';

export function AcademicAchievements({ data, updateData, updateFiles, errors = {}, required = false }) {
  const [paperCount, setPaperCount] = useState(data?.paperCount || '');
  const [hackathonWins, setHackathonWins] = useState(data?.hackathonWins || '');
  const [hackathonParticipations, setHackathonParticipations] = useState(data?.hackathonParticipations || '');

  useEffect(() => {
    setPaperCount(data?.paperCount || '');
    setHackathonWins(data?.hackathonWins || '');
    setHackathonParticipations(data?.hackathonParticipations || '');
  }, [data?.paperCount, data?.hackathonWins, data?.hackathonParticipations]);

  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  const handleFileChange = (name, files) => {
    if (files) {
      updateFiles(name, Array.from(files));
    }
  };

  // Determine if file uploads are required
  const isResearchUploadRequired = data?.researchPapers && data.researchPapers !== 'None' && paperCount && parseInt(paperCount) > 0;
  const isHackathonUploadRequired = data?.hackathonParticipation && data.hackathonParticipation !== 'None' && hackathonParticipations && parseInt(hackathonParticipations) > 0;

  // Helper for matching count and files
  const researchProofCountMismatch = isResearchUploadRequired && data?.researchProof && data.researchProof.length !== parseInt(paperCount);
  const hackathonProofCountMismatch = isHackathonUploadRequired && data?.hackathonProof && data.hackathonProof.length !== parseInt(hackathonParticipations);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="researchPapers" className="flex items-center">
          Published Research Papers
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select 
          onValueChange={(value) => handleChange('researchPapers', value)}
          value={data?.researchPapers || ''}
        >
          <SelectTrigger id="researchPapers" className={errors.researchPapers ? "border-red-500" : ""}>
            <SelectValue placeholder="Select research paper type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="International">International</SelectItem>
            <SelectItem value="National">National</SelectItem>
            <SelectItem value="Conferences">Conferences</SelectItem>
            <SelectItem value="None">None</SelectItem>
          </SelectContent>
        </Select>
        {errors.researchPapers && (
          <p className="text-sm text-red-500">{errors.researchPapers}</p>
        )}
      </div>

      {data?.researchPapers && data.researchPapers !== 'None' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="paperCount" className="flex items-center">
              Number of Papers
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input 
              id="paperCount" 
              name="paperCount" 
              type="number" 
              min="1"
              value={paperCount} 
              onChange={(e) => {
                setPaperCount(e.target.value);
                handleChange('paperCount', e.target.value);
              }} 
              className={errors.paperCount ? "border-red-500" : ""}
            />
            {errors.paperCount && (
              <p className="text-sm text-red-500">{errors.paperCount}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-900 text-sm mb-2">
            Proofs are verified and approved by the admin. Please upload all certificates in a single PDF and submit.<br />
            {paperCount && parseInt(paperCount) > 0 ? 
              `Please upload certificates for all ${paperCount} papers in a single PDF file.` : 
              'The number of papers and certificates submitted should match.'}
          </div>
          {researchProofCountMismatch && (
            <div className="text-red-600 text-sm mb-2">Number of certificates uploaded does not match the number of papers.</div>
          )}
          <FileUpload 
            label="Proof of Research Publications"
            name="researchProof"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple={true}
            maxSize={5}
            tooltip="Upload PDFs or images of your research publications. Max 5MB per file."
            onChange={handleFileChange}
            required={isResearchUploadRequired}
            error={errors.researchProof}
          />
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="hackathonParticipation" className="flex items-center">
          Hackathon Participation
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select 
          onValueChange={(value) => handleChange('hackathonParticipation', value)}
          value={data?.hackathonParticipation || ''}
        >
          <SelectTrigger id="hackathonParticipation" className={errors.hackathonParticipation ? "border-red-500" : ""}>
            <SelectValue placeholder="Select hackathon level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="International">International</SelectItem>
            <SelectItem value="National">National</SelectItem>
            <SelectItem value="College">College</SelectItem>
            <SelectItem value="None">None</SelectItem>
          </SelectContent>
        </Select>
        {errors.hackathonParticipation && (
          <p className="text-sm text-red-500">{errors.hackathonParticipation}</p>
        )}
      </div>

      {data?.hackathonParticipation && data.hackathonParticipation !== 'None' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hackathonWins" className="flex items-center">
                Number of Wins
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input 
                id="hackathonWins" 
                name="hackathonWins" 
                type="number" 
                min="0"
                value={hackathonWins} 
                onChange={(e) => {
                  setHackathonWins(e.target.value);
                  handleChange('hackathonWins', e.target.value);
                }}
                className={errors.hackathonWins ? "border-red-500" : ""}
              />
              {errors.hackathonWins && (
                <p className="text-sm text-red-500">{errors.hackathonWins}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hackathonParticipations" className="flex items-center">
                Number of Participations
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input 
                id="hackathonParticipations" 
                name="hackathonParticipations" 
                type="number" 
                min="1"
                value={hackathonParticipations} 
                onChange={(e) => {
                  setHackathonParticipations(e.target.value);
                  handleChange('hackathonParticipations', e.target.value);
                }}
                className={errors.hackathonParticipations ? "border-red-500" : ""}
              />
              {errors.hackathonParticipations && (
                <p className="text-sm text-red-500">{errors.hackathonParticipations}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hackathonRole" className="flex items-center">
              Role
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select 
              onValueChange={(value) => handleChange('hackathonRole', value)} 
              value={data?.hackathonRole || ''}
            >
              <SelectTrigger id="hackathonRole" className={errors.hackathonRole ? "border-red-500" : ""}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team leader">Team Lead</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            {errors.hackathonRole && (
              <p className="text-sm text-red-500">{errors.hackathonRole}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-900 text-sm mb-2">
            Proofs are verified and approved by the admin. Please upload all certificates in a single PDF and submit.<br />
            {hackathonParticipations && parseInt(hackathonParticipations) > 0 ? 
              `Please upload certificates for all ${hackathonParticipations} participations in a single PDF file.` : 
              'The number of participations and certificates submitted should match.'}<br />
            Your certificate of participation and certificate of winning will be verified separately.<br />
            Team Lead Certificate will be verified separately.
          </div>
          
          <FileUpload 
            label="Proof of Hackathon Participation/Wins"
            name="hackathonProof"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple={true}
            maxSize={5}
            tooltip="Upload PDFs or images of your hackathon certificates. Max 5MB per file."
            onChange={handleFileChange}
            required={isHackathonUploadRequired}
            error={errors.hackathonProof}
          />
        </>
      )}
    </div>
  );
}