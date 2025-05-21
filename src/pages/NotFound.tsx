
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileSearch } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="relative mb-8">
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 opacity-75 blur-xl"></div>
        <h1 className="relative text-[10rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-pulse">404</h1>
      </div>
      
      <div className="text-center space-y-6 max-w-md bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/40 shadow-xl">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button onClick={() => navigate('/dashboard')} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>

        <div className="pt-6 border-t border-border/40 mt-6">
          <Button variant="link" onClick={() => navigate('/help')} className="text-sm text-muted-foreground">
            <FileSearch className="h-4 w-4 mr-1" />
            Need help finding something?
          </Button>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default NotFound;
