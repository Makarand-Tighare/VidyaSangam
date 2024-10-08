import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function Declaration({ data, updateData }) {
  const handleChange = (name, value) => {
    updateData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="declaration" 
          checked={data?.declaration || false}
          onCheckedChange={(checked) => handleChange('declaration', checked)}
        />
        <Label htmlFor="declaration">
          I hereby declare that the above information is true and correct to the best of my knowledge
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signature">Signature (Type your full name)</Label>
        <Input 
          id="signature" 
          value={data?.signature || ''} 
          onChange={(e) => handleChange('signature', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input 
          id="date" 
          type="date" 
          value={data?.date || ''} 
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>
    </div>
  );
}
