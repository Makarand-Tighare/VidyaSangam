import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from 'lucide-react';

export function FileUpload({ label, name, accept, multiple = false, maxSize = 5, tooltip, onChange, required = false, error }) {
  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize * 1024 * 1024) {
          setFileError(`File ${files[i].name} is too large. Maximum size is ${maxSize}MB.`);
          return;
        }
      }
      setFileError(null);
      onChange(name, files);
    }
  };

  // Use the external error if provided, otherwise use local error
  const displayError = error || fileError;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor={name} className="flex items-center">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input 
        id={name}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className={displayError ? "border-red-500" : ""}
        required={required}
      />
      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}
