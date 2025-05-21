
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Mail, Key, Loader2, ChevronRight, User, Info } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import LoginLayout from '@/components/layout/LoginLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful', {
          description: 'Welcome back to Vikas Milk Centre',
        });
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-20 animate-pulse"></div>
            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/94882b07-d7b1-4949-8dcb-7a750fd17c6b.png" 
                alt="Logo" 
                className="h-10 w-10 animate-pulse"
              />
            </div>
          </div>
          <p className="text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
            Vikas Milk Centre
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoginLayout>
      <div className="space-y-8 w-full">
        {/* Logo & App Title */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-secondary opacity-20 animate-pulse"></div>
            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/94882b07-d7b1-4949-8dcb-7a750fd17c6b.png" 
                alt="Logo" 
                className="h-12 w-12"
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vikas Milk Centre</span>
          </h1>
          <p className="text-sm text-gray-400">
            Sign in to your account to access the dashboard
          </p>
        </div>
        
        {/* Login Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-30"></div>
          
          <form onSubmit={handleSubmit} className="relative space-y-5 bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/90 transition hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary focus-visible:border-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 hover:bg-white/10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full relative overflow-hidden group bg-gradient-to-r from-primary via-purple-600 to-secondary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></span>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-xs text-gray-500">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="bg-black/30 border-white/10 text-white hover:bg-white/10 hover:text-white">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="bg-black/30 border-white/10 text-white hover:bg-white/10 hover:text-white">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-sm space-y-2">
          <div className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline transition">
              Sign up
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600 bg-black/20 py-2 px-3 rounded-lg border border-white/5 mt-2">
            <Info className="h-3 w-3 text-primary" />
            <p>Demo credentials: admin@example.com / admin123</p>
          </div>
        </div>
      </div>
    </LoginLayout>
  );
};

export default Login;
