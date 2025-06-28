import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiShield, FiMail, FiLock, FiKey, FiEye, FiEyeOff } = FiIcons;

const LoginPage = () => {
  const { user, login, sendSecurityCode } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mockCode, setMockCode] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const email = watch('email');

  const onSubmitCredentials = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await sendSecurityCode(data.email);
      if (result.success) {
        setMockCode(result.code);
        setStep(2);
      } else {
        setError('Failed to send security code');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSecurityCode = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(email, data.password, data.securityCode);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-midnight-900 rounded-2xl shadow-2xl border border-midnight-700 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <SafeIcon icon={FiShield} className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Midnight Sentinels</h1>
            <p className="text-midnight-400">Secure Investigation System</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-midnight-400 hover:text-white"
                  >
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-midnight-900"
              >
                {loading ? 'Sending Code...' : 'Continue'}
              </motion.button>
            </form>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
                <p className="text-blue-200 text-sm">
                  Security code sent to <strong>{email}</strong>
                </p>
                <p className="text-blue-300 text-xs mt-1">
                  Demo code: <strong>{mockCode}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmitSecurityCode)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Security Code
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiKey} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
                    <input
                      {...register('securityCode', {
                        required: 'Security code is required',
                        minLength: {
                          value: 6,
                          message: 'Security code must be 6 digits'
                        }
                      })}
                      type="text"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                  {errors.securityCode && (
                    <p className="mt-1 text-sm text-red-400">{errors.securityCode.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-midnight-900"
                  >
                    {loading ? 'Verifying...' : 'Login'}
                  </motion.button>
                </div>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;