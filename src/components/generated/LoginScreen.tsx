import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, Globe, AlertCircle, User, CheckCircle, PlayCircle } from 'lucide-react';
import { signIn, signUp } from '../../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onDemoLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onDemoLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  const toggleMode = () => {
    resetForm();
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isSignUp) {
      // Sign Up validation
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);
      
      try {
        const { data, error: signUpError } = await signUp(email, password, name);
        
        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }
        
        if (data?.user) {
          // Check if email confirmation is required
          if (data.user.identities?.length === 0) {
            setError('This email is already registered. Please sign in instead.');
          } else if (!data.session) {
            // Email confirmation required
            setSuccessMessage('Account created! Please check your email to confirm your account, then sign in.');
            setTimeout(() => {
              resetForm();
              setIsSignUp(false);
            }, 3000);
          } else {
            // Auto-signed in after registration
            setSuccessMessage('Account created successfully!');
            setTimeout(() => {
              onLoginSuccess();
            }, 1000);
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Sign up error:', err);
      }
      
      setIsLoading(false);
    } else {
      // Sign In validation
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      setIsLoading(true);
      
      try {
        const { data, error: signInError } = await signIn(email, password);
        
        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
          return;
        }
        
        if (data?.session) {
          onLoginSuccess();
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Sign in error:', err);
      }
      
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: 'AI-Powered Content Moderation' },
    { icon: Globe, text: 'Multi-Region Compliance' },
    { icon: Zap, text: 'Real-Time Analysis' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex overflow-hidden">
      {/* Left Panel - Branding & Features */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#e50914]/20 via-[#e50914]/5 to-transparent blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#b8070f]/15 via-[#e50914]/5 to-transparent blur-3xl"
          />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(229, 9, 20, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(229, 9, 20, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#e50914] rounded-xl flex items-center justify-center shadow-lg shadow-[#e50914]/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-[#e50914]">Mod</span>
                <span className="text-white">Pod</span>
              </h1>
            </div>
            <p className="text-[#808080] text-lg">
              Enterprise Ad Moderation Platform
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Ensure Your Ads{' '}
              <span className="relative">
                <span className="relative z-10 text-[#e50914]">Comply</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-1 left-0 h-3 bg-[#e50914]/20 -z-0"
                />
              </span>
              {' '}Everywhere
            </h2>
            <p className="text-[#b3b3b3] text-lg max-w-md">
              AI-powered moderation that checks your advertisements against regional policies in seconds.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.15, duration: 0.5 }}
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center group-hover:border-[#e50914]/50 group-hover:bg-[#e50914]/10 transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-[#e50914]" />
                </div>
                <span className="text-[#e5e5e5] font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="mt-16 flex gap-12"
          >
            {[
              { value: '10M+', label: 'Ads Analyzed' },
              { value: '50+', label: 'Regions' },
              { value: '99.9%', label: 'Accuracy' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-[#808080]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative"
      >
        {/* Subtle Background for Form Side */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#141414] via-[#0d0d0d] to-[#0a0a0a]" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#e50914] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                <span className="text-[#e50914]">Mod</span>
                <span className="text-white">Pod</span>
              </h1>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center lg:text-left mb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-white mb-3">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-[#808080]">
                  {isSignUp 
                    ? 'Join ModPod to start moderating your ads' 
                    : 'Sign in to continue to your dashboard'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Login/SignUp Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-5"
          >
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-3 p-4 bg-[#e50914]/10 border border-[#e50914]/30 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-[#e50914] shrink-0" />
                  <span className="text-sm text-[#e50914]">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm text-green-500">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Field - Only for Sign Up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden"
                >
                  <motion.label 
                    animate={{ 
                      color: focusedField === 'name' ? '#e50914' : '#808080',
                    }}
                    className="block text-sm font-medium mb-2 transition-colors"
                  >
                    Full Name
                  </motion.label>
                  <div className="relative">
                    <User 
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'name' ? 'text-[#e50914]' : 'text-[#555555]'
                      }`}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      className={`w-full bg-[#1a1a1a] border-2 rounded-xl pl-12 pr-4 py-4 text-[#e5e5e5] placeholder-[#555555] focus:outline-none transition-all duration-300 ${
                        focusedField === 'name' 
                          ? 'border-[#e50914] shadow-lg shadow-[#e50914]/10' 
                          : 'border-[#2a2a2a] hover:border-[#404040]'
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="relative">
              <motion.label 
                animate={{ 
                  color: focusedField === 'email' ? '#e50914' : '#808080',
                }}
                className="block text-sm font-medium mb-2 transition-colors"
              >
                Email Address
              </motion.label>
              <div className="relative">
                <Mail 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-[#e50914]' : 'text-[#555555]'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@company.com"
                  autoComplete="off"
                  className={`w-full bg-[#1a1a1a] border-2 rounded-xl pl-12 pr-4 py-4 text-[#e5e5e5] placeholder-[#555555] focus:outline-none transition-all duration-300 ${
                    focusedField === 'email' 
                      ? 'border-[#e50914] shadow-lg shadow-[#e50914]/10' 
                      : 'border-[#2a2a2a] hover:border-[#404040]'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <motion.label 
                  animate={{ 
                    color: focusedField === 'password' ? '#e50914' : '#808080',
                  }}
                  className="block text-sm font-medium transition-colors"
                >
                  Password
                </motion.label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-sm text-[#e50914] hover:text-[#f40612] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-[#e50914]' : 'text-[#555555]'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isSignUp ? 'Create a password (min. 6 chars)' : 'Enter your password'}
                  autoComplete="new-password"
                  className={`w-full bg-[#1a1a1a] border-2 rounded-xl pl-12 pr-12 py-4 text-[#e5e5e5] placeholder-[#555555] focus:outline-none transition-all duration-300 ${
                    focusedField === 'password' 
                      ? 'border-[#e50914] shadow-lg shadow-[#e50914]/10' 
                      : 'border-[#2a2a2a] hover:border-[#404040]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#e5e5e5] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field - Only for Sign Up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden"
                >
                  <motion.label 
                    animate={{ 
                      color: focusedField === 'confirmPassword' ? '#e50914' : '#808080',
                    }}
                    className="block text-sm font-medium mb-2 transition-colors"
                  >
                    Confirm Password
                  </motion.label>
                  <div className="relative">
                    <Lock 
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'confirmPassword' ? 'text-[#e50914]' : 'text-[#555555]'
                      }`}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Confirm your password"
                      className={`w-full bg-[#1a1a1a] border-2 rounded-xl pl-12 pr-12 py-4 text-[#e5e5e5] placeholder-[#555555] focus:outline-none transition-all duration-300 ${
                        focusedField === 'confirmPassword' 
                          ? 'border-[#e50914] shadow-lg shadow-[#e50914]/10' 
                          : 'border-[#2a2a2a] hover:border-[#404040]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#e5e5e5] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me / Terms - Conditional */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-[#2a2a2a] bg-[#1a1a1a] peer-checked:bg-[#e50914] peer-checked:border-[#e50914] transition-all duration-300 flex items-center justify-center">
                    <motion.svg 
                      viewBox="0 0 24 24" 
                      className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                      initial={false}
                    >
                      <path 
                        d="M20 6L9 17L4 12" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </motion.svg>
                  </div>
                </div>
                <span className="text-sm text-[#b3b3b3] group-hover:text-[#e5e5e5] transition-colors">
                  {isSignUp 
                    ? 'I agree to the Terms of Service and Privacy Policy' 
                    : 'Remember me for 30 days'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full bg-[#e50914] hover:bg-[#f40612] disabled:bg-[#e50914]/50 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#e50914]/25 hover:shadow-xl hover:shadow-[#e50914]/30"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Demo User Button - Only show on Sign In */}
          {!isSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-4"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2a2a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0a0a0a] text-[#808080]">or</span>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => {
                  if (onDemoLogin) {
                    onDemoLogin();
                  } else {
                    onLoginSuccess();
                  }
                }}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full mt-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] border-2 border-[#2a2a2a] hover:border-[#404040] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <PlayCircle className="w-5 h-5 text-[#e50914]" />
                <span>Continue as Demo User</span>
              </motion.button>
            </motion.div>
          )}

          {/* Toggle Sign In / Sign Up */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center mt-8 text-[#808080]"
          >
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={toggleMode}
              className="text-[#e50914] hover:text-[#f40612] font-medium transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </motion.p>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-center mt-8 text-sm text-[#555555]"
          >
            © 2025 ModPod. All rights reserved.
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

