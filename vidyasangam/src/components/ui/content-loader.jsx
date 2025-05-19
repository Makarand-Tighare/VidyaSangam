import { Loader2 } from "lucide-react";

export function ContentLoader({ message = "Loading...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-3 text-blue-600 font-medium">{message}</p>
    </div>
  );
}

export function InlineLoader({ message = "Loading...", size = "sm", className = "" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${sizes[size]}`} />
      {message && <span className="text-blue-600">{message}</span>}
    </div>
  );
} 