
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center animate-fade-in space-y-6 max-w-md px-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-xl text-muted-foreground">Page not found</p>
        </div>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="flex items-center gap-2">
          <a href="/">
            <Home className="h-4 w-4" /> Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
