
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Route not found:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-5">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Button 
            variant="default"
            onClick={() => navigate("/")}
            className="min-w-[150px]"
          >
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="min-w-[150px]"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
