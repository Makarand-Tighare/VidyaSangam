import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export function MentoringPreferences({ data, updateData }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Mentoring Preferences</Label>
        <RadioGroup 
          onValueChange={(value) => handleChange('mentoringPreference', value)}
          value={data?.mentoringPreference || ''}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mentor" id="mentor" />
            <Label htmlFor="mentor">Mentor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mentee" id="mentee" />
            <Label htmlFor="mentee">Mentee</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousExperience">Previous Mentoring Experience</Label>
        <Textarea 
          id="previousExperience" 
          value={data?.previousExperience || ''} 
          onChange={(e) => handleChange('previousExperience', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">Tech Stack</Label>
        <Input 
          id="techStack" 
          placeholder="e.g., JavaScript, Python, React" 
          value={data?.techStack || ''} 
          onChange={(e) => handleChange('techStack', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="areasOfInterest">Areas of Interest for Learning or Mentoring</Label>
        <Textarea 
          id="areasOfInterest" 
          value={data?.areasOfInterest || ''} 
          onChange={(e) => handleChange('areasOfInterest', e.target.value)}
        />
      </div>
    </div>
  );
}
