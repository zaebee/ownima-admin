import { useNavigate } from "react-router-dom";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-6">
        <FileQuestion className="h-16 w-16 text-slate-400" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Page Not Found</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        The page you are looking for doesn't exist or has been moved. 
        Please check the URL or navigate back to the dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => navigate("/")} className="gap-2">
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
