
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Mail, Lock, Shield, Building2, User, Phone,
  Fingerprint, Smartphone, Globe, Settings, UserPlus
} from 'lucide-react';
import { EnhancedAuthService, UserProfile } from '@/services/auth/EnhancedAuth';

const AdvancedLogin = () => {
  const [email, setEmail] = useState('superadmin@vikasmilk.com');
  const [password, setPassword] = useState('SuperAdmin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [selectedCenter, setSelectedCenter] = useState('main');
  const [language, setLanguage] = useState('en');
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'admin' as UserProfile['role'],
    centerId: 'main'
  });

  const navigate = useNavigate();

  useEffect(() => {
    EnhancedAuthService.initializeDefaultUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await EnhancedAuthService.authenticateUser(email, password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentCenterId', selectedCenter);
        localStorage.setItem('selectedLanguage', language);
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
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const user = await EnhancedAuthService.createUser({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role,
        centerId: signupData.centerId
      });

      if (user) {
        toast.success('Account created successfully!');
        setActiveTab('login');
        setEmail(signupData.email);
        setPassword('');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const centers = [
    { id: 'main', name: 'Main Center', location: 'Mumbai' },
    { id: 'branch1', name: 'Branch 1', location: 'Pune' },
    { id: 'branch2', name: 'Branch 2', location: 'Nashik' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' }
  ];

  const roles = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Management operations' },
    { value: 'billing_clerk', label: 'Billing Clerk', description: 'Billing and payments' },
    { value: 'delivery_staff', label: 'Delivery Staff', description: 'Delivery operations' }
  ];

  return (
    <div className="min-h-screen neo-noir-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary/20 to-transparent blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10">
        <Card className="neo-noir-card border-primary/20 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 neo-noir-button-accent rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold neo-noir-gradient-text">
              Vikas Milk Centre Pro
            </CardTitle>
            <CardDescription className="neo-noir-text-muted">
              Advanced milk center management system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="center" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Select Center
                    </Label>
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {centers.map(center => (
                          <SelectItem key={center.id} value={center.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{center.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {center.location}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="neo-noir-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="neo-noir-input pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full neo-noir-button-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                        className="neo-noir-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone</Label>
                      <Input
                        id="signup-phone"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                        className="neo-noir-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="neo-noir-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select 
                      value={signupData.role} 
                      onValueChange={(value: UserProfile['role']) => setSignupData({...signupData, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        className="neo-noir-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        className="neo-noir-input"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full neo-noir-button-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Default Login Credentials:</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-xs"><strong>Super Admin:</strong> superadmin@vikasmilk.com / SuperAdmin@123</p>
                  <p className="text-xs"><strong>Admin:</strong> admin@vikasmilk.com / admin123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedLogin;
