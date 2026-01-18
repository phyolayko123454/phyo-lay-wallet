import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '', username: '', confirmPassword: '' });
  
  const { signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.identifier, formData.password);
        if (error) throw error;
        toast({ title: t('loginSuccess') });
        navigate('/');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        // For registration, identifier is the email
        const { error } = await signUp(formData.identifier, formData.password, formData.username);
        if (error) throw error;
        toast({ title: t('registerSuccess') });
        navigate('/');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'An error occurred';
      
      // Handle network errors more gracefully
      if (errorMessage === 'Failed to fetch' || errorMessage.includes('fetch')) {
        errorMessage = language === 'my' 
          ? 'ကွန်နက်ရှင်ပြဿနာရှိနေပါသည်။ ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။' 
          : 'Connection error. Please wait a moment and try again.';
      }
      
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card-premium p-8 gold-border-glow">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full gold-gradient mx-auto mb-4 flex items-center justify-center gold-glow">
                <span className="text-primary-foreground font-serif font-bold text-2xl">P</span>
              </div>
              <h1 className="font-serif text-2xl font-bold gold-gradient-text">
                {isLogin ? t('login') : t('register')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="username">{t('username')}</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="pl-10 bg-secondary border-border"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="identifier">{isLogin ? t('usernameOrEmail') : t('email')}</Label>
                <div className="relative mt-1.5">
                  {isLogin ? (
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  )}
                  <Input
                    id="identifier"
                    type={isLogin ? 'text' : 'email'}
                    placeholder={isLogin ? 'Username or Email' : 'Enter email'}
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="pl-10 bg-secondary border-border"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-secondary border-border"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 bg-secondary border-border"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={loading}>
                {loading ? t('loading') : isLogin ? t('login') : t('register')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? t('register') : t('login')}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Auth;