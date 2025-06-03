import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Mail, Lock, Smartphone, Shield, 
  ArrowRight, Fingerprint, KeyRound, Building2,
  Phone, User, MapPin
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const AdvancedLoginForm = () => {
  const [loginData, setLoginData] = useState({
    email: 'admin@vikasmilk.com',
    password: 'admin123',
    rememberMe: false,
    twoFactor: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    centerName: '',
    address: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const { login, signup } = useEnhancedAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (requiresTwoFactor && !loginData.twoFactor) {
        toast.error('Please enter the 2FA code');
        return;
      }

      const success = await login({
        email: loginData.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe,
        twoFactorCode: loginData.twoFactor || undefined
      });
      
      if (success && loginData.rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        acceptTerms: signupData.agreeTerms
      });
      
      if (success) {
        // Store additional profile data
        const profileData = {
          phone: signupData.phone,
          centerName: signupData.centerName,
          address: signupData.address
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen neo-noir-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced background with animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent-color/20 to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary/20 to-transparent blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-accent-color/10 to-secondary/10 blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10">
        <Card className="neo-noir-card border-primary/20 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-8 relative">
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
              Vikas Milk Centre Pro
            </CardTitle>
            <CardDescription className="neo-noir-text-muted text-base">
              Advanced Dairy Management System
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 neo-noir-surface">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
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
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        placeholder="Enter your email"
                        className="pl-12 h-14 neo-noir-input text-base border-2 focus:border-accent-color/50 transition-all duration-300"
                        required
                      />
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
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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
                    </div>
                  </div>

                  {requiresTwoFactor && (
                    <div className="space-y-3">
                      <Label htmlFor="twoFactor" className="neo-noir-text font-medium text-sm flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-accent-color" />
                        2FA Code
                      </Label>
                      <div className="relative group">
                        <Fingerprint className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 neo-noir-text-muted group-focus-within:text-accent-color transition-colors" />
                        <Input
                          id="twoFactor"
                          type="text"
                          value={loginData.twoFactor}
                          onChange={(e) => setLoginData({...loginData, twoFactor: e.target.value})}
                          placeholder="Enter 6-digit code"
                          className="pl-12 h-14 neo-noir-input text-base border-2 focus:border-accent-color/50 transition-all duration-300"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rememberMe"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) => setLoginData({...loginData, rememberMe: checked as boolean})}
                    />
                    <Label htmlFor="rememberMe" className="text-sm neo-noir-text-muted">
                      Remember me on this device
                    </Label>
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
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-accent-color hover:text-accent-color/80"
                      onClick={() => setRequiresTwoFactor(!requiresTwoFactor)}
                    >
                      {requiresTwoFactor ? 'Use regular login' : 'Enable 2FA login'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-accent-color" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                        placeholder="John Doe"
                        className="h-12 neo-noir-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPhone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-accent-color" />
                        Phone
                      </Label>
                      <Input
                        id="signupPhone"
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                        placeholder="+91 9876543210"
                        className="h-12 neo-noir-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent-color" />
                      Email
                    </Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      placeholder="name@example.com"
                      className="h-12 neo-noir-input"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-accent-color" />
                        Password
                      </Label>
                      <Input
                        id="signupPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        placeholder="••••••••"
                        className="h-12 neo-noir-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-accent-color" />
                        Confirm
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="h-12 neo-noir-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent-color" />
                        Role
                      </Label>
                      <Select 
                        value={signupData.role} 
                        onValueChange={(value) => setSignupData({...signupData, role: value})}
                      >
                        <SelectTrigger className="h-12 neo-noir-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="centerName" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-accent-color" />
                        Center Name
                      </Label>
                      <Input
                        id="centerName"
                        type="text"
                        value={signupData.centerName}
                        onChange={(e) => setSignupData({...signupData, centerName: e.target.value})}
                        placeholder="Main Branch"
                        className="h-12 neo-noir-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent-color" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={signupData.address}
                      onChange={(e) => setSignupData({...signupData, address: e.target.value})}
                      placeholder="Business address"
                      className="h-12 neo-noir-input"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="agreeTerms"
                      checked={signupData.agreeTerms}
                      onCheckedChange={(checked) => setSignupData({...signupData, agreeTerms: checked as boolean})}
                    />
                    <Label htmlFor="agreeTerms" className="text-sm neo-noir-text-muted">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
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
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 relative z-10">
                        <User className="w-5 h-5" />
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Enhanced demo credentials section */}
            <div className="mt-8 pt-6 border-t border-border-color/30">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-accent-color" />
                  <p className="text-sm neo-noir-text font-medium">Demo Credentials</p>
                  <Shield className="h-4 w-4 text-accent-color" />
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
      </div>
    </div>
  );
};

export default AdvancedLoginForm;
