
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { CompanySwitcher } from './CompanySwitcher';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  Shield, ArrowRight, Loader2, KeyRound, Smartphone,
  Globe, Github, Chrome, Facebook
} from 'lucide-react';

const ModernAuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  
  // Login state
  const [loginData, setLoginData] = useState({
    email: 'admin@vikasmilk.com',
    password: 'Admin@123',
    rememberMe: false,
    twoFactorCode: ''
  });

  // Signup state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    acceptTerms: false
  });

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const { 
    login, 
    signup, 
    resetPassword, 
    checkPasswordStrength,
    user,
    companies,
    currentCompany,
    switchCompany
  } = useEnhancedAuth();
  const navigate = useNavigate();

  const passwordStrength = checkPasswordStrength(signupData.password);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (require2FA && !loginData.twoFactorCode) {
        toast.error('Please enter the 2FA code');
        return;
      }

      const success = await login({
        email: loginData.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe,
        twoFactorCode: loginData.twoFactorCode || undefined
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error('Please choose a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(signupData);
      
      if (success) {
        toast.success('Account created! Please check your email to verify your account.');
        setActiveTab('login');
        setLoginData(prev => ({ ...prev, email: signupData.email, password: '' }));
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword({ email: resetEmail });
      setShowResetForm(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySwitch = async (companyId: string) => {
    await switchCompany(companyId);
  };

  if (user && companies.length > 1) {
    return (
      <div className="min-h-screen neo-noir-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-md neo-noir-card">
          <CardHeader className="text-center">
            <CardTitle className="neo-noir-gradient-text">Select Company</CardTitle>
            <CardDescription>Choose which company to work with</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanySwitcher
              companies={companies}
              currentCompany={currentCompany}
              onCompanySwitch={handleCompanySwitch}
              className="w-full"
            />
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full mt-4 neo-noir-button-accent"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen neo-noir-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
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
              {showResetForm ? 'Reset Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="neo-noir-text-muted text-base">
              {showResetForm 
                ? 'Enter your email to reset your password' 
                : 'Sign in to access Vikas Milk Centre dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {showResetForm ? (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="resetEmail" className="neo-noir-text font-medium text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-accent-color" />
                    Email Address
                  </Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-14 neo-noir-input text-base"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetForm(false)}
                    className="flex-1 h-14"
                  >
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-14 neo-noir-button-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        placeholder="Enter your email"
                        className="h-14 neo-noir-input text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="password" className="neo-noir-text font-medium text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4 text-accent-color" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          placeholder="Enter your password"
                          className="h-14 neo-noir-input text-base pr-14"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
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

                    {require2FA && (
                      <div className="space-y-3">
                        <Label htmlFor="twoFactor" className="neo-noir-text font-medium text-sm flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-accent-color" />
                          2FA Code
                        </Label>
                        <Input
                          id="twoFactor"
                          type="text"
                          value={loginData.twoFactorCode}
                          onChange={(e) => setLoginData({...loginData, twoFactorCode: e.target.value})}
                          placeholder="Enter 6-digit code"
                          className="h-14 neo-noir-input text-base"
                          maxLength={6}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rememberMe"
                          checked={loginData.rememberMe}
                          onCheckedChange={(checked) => setLoginData({...loginData, rememberMe: checked as boolean})}
                        />
                        <Label htmlFor="rememberMe" className="text-sm neo-noir-text-muted">
                          Remember me
                        </Label>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-accent-color hover:text-accent-color/80 p-0 h-auto"
                        onClick={() => setShowResetForm(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full h-14 neo-noir-button-accent text-base font-semibold group relative overflow-hidden"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
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
                        onClick={() => setRequire2FA(!require2FA)}
                      >
                        {require2FA ? 'Use regular login' : 'Enable 2FA login'}
                      </Button>
                    </div>

                    {/* Social Login */}
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border-color/30" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="h-12">
                          <Chrome className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="h-12">
                          <Facebook className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="h-12">
                          <Github className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6">
                  <form onSubmit={handleSignup} className="space-y-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-accent-color" />
                        Company Name (Optional)
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={signupData.companyName}
                        onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                        placeholder="Your Milk Distribution Company"
                        className="h-12 neo-noir-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword" className="text-sm font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-accent-color" />
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="signupPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={signupData.password}
                            onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                            placeholder="••••••••"
                            className="h-12 neo-noir-input pr-12"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-accent-color" />
                          Confirm
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                            placeholder="••••••••"
                            className="h-12 neo-noir-input pr-12"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {signupData.password && (
                      <PasswordStrengthIndicator
                        password={signupData.password}
                        strength={passwordStrength}
                        className="mt-4"
                      />
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="acceptTerms"
                        checked={signupData.acceptTerms}
                        onCheckedChange={(checked) => setSignupData({...signupData, acceptTerms: checked as boolean})}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm neo-noir-text-muted">
                        I agree to the{' '}
                        <Button variant="link" className="p-0 h-auto text-accent-color">
                          Terms of Service
                        </Button>
                        {' '}and{' '}
                        <Button variant="link" className="p-0 h-auto text-accent-color">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full h-14 neo-noir-button-accent text-base font-semibold group relative overflow-hidden"
                      disabled={isLoading || !passwordStrength.isValid}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5" />
                          <span>Create Account</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {/* Enhanced demo credentials section */}
            {!showResetForm && (
              <div className="mt-8 pt-6 border-t border-border-color/30">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-accent-color" />
                    <p className="text-sm neo-noir-text font-medium">Demo Credentials</p>
                    <Shield className="h-4 w-4 text-accent-color" />
                  </div>
                  <div className="bg-gradient-to-r from-accent-color/10 to-secondary/10 rounded-lg p-4 border border-accent-color/20 space-y-2">
                    <p className="text-sm neo-noir-text-muted">
                      <strong className="text-accent-color">Admin:</strong> admin@vikasmilk.com / Admin@123
                    </p>
                    <p className="text-sm neo-noir-text-muted">
                      <strong className="text-accent-color">2FA Code:</strong> 123456 (when enabled)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernAuthForm;
