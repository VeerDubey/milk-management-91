
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, Shield, Waves } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@vikasmilk.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useEnhancedAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login({
        email,
        password,
        rememberMe: false
      });
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen neo-noir-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent-color/20 to-transparent blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary/20 to-transparent blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-accent-color/10 to-secondary/10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <Card className="neo-noir-card border-primary/20 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-8 relative">
            {/* Floating logo with glow effect */}
            <div className="flex justify-center mb-6 relative">
              <div className="w-20 h-20 neo-noir-button-accent rounded-3xl flex items-center justify-center neo-noir-glow neo-noir-float relative">
                <img 
                  src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
                  alt="Vikas Milk Centre" 
                  className="w-12 h-12"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-accent-color/20 to-secondary/20 blur-xl"></div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold neo-noir-gradient-text mb-2">
              Welcome Back
            </CardTitle>
            <CardDescription className="neo-noir-text-muted text-base">
              Sign in to access Vikas Milk Centre dashboard
            </CardDescription>
            
            {/* Decorative wave */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-color to-transparent opacity-50"></div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="neo-noir-text font-medium text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent-color" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 neo-noir-text-muted group-focus-within:text-accent-color transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-12 h-14 neo-noir-input text-base border-2 focus:border-accent-color/50 transition-all duration-300"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-color/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="neo-noir-text font-medium text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-accent-color" />
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 neo-noir-text-muted group-focus-within:text-accent-color transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 pr-14 h-14 neo-noir-input text-base border-2 focus:border-accent-color/50 transition-all duration-300"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-accent-color/10 rounded-lg transition-all"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 neo-noir-text-muted" />
                    ) : (
                      <Eye className="h-5 w-5 neo-noir-text-muted" />
                    )}
                  </Button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-color/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 neo-noir-button-accent text-base font-semibold group relative overflow-hidden"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-color via-secondary to-accent-color bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
                {isLoading ? (
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 relative z-10">
                    <Shield className="w-5 h-5" />
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
            
            {/* Enhanced demo credentials section */}
            <div className="mt-8 pt-6 border-t border-border-color/30">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-accent-color" />
                  <p className="text-sm neo-noir-text font-medium">Demo Credentials</p>
                  <Sparkles className="h-4 w-4 text-accent-color" />
                </div>
                <div className="bg-gradient-to-r from-accent-color/10 to-secondary/10 rounded-lg p-4 border border-accent-color/20 space-y-2">
                  <p className="text-sm neo-noir-text-muted">
                    <strong className="text-accent-color">Admin:</strong> admin@vikasmilk.com / admin123
                  </p>
                  <p className="text-sm neo-noir-text-muted">
                    <strong className="text-accent-color">Employee:</strong> employee@vikasmilk.com / employee123
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer branding */}
        <div className="text-center mt-8">
          <p className="neo-noir-text-muted text-sm">
            Powered by <span className="neo-noir-gradient-text font-semibold">Vikas Milk Centre</span>
          </p>
          <p className="neo-noir-text-muted text-xs mt-1">Since 1975 - Trusted Quality</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
