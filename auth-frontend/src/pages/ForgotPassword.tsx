import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Loader2, Mail, ArrowLeft, UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { forgotPassword } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Enter your email and we'll send you a reset link
          </p>

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Mail className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-medium text-green-800 mb-1">Check your email</h3>
                <p className="text-sm text-green-600">
                  If an account exists with that email, you will receive a password reset link shortly.
                </p>
              </div>
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
                    data-testid="input-email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="button-send-reset"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    data-testid="link-login"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Don't have an account? </span>
                  <Link 
                    to="/register" 
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    data-testid="link-register"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Protected by industry-leading security practices
        </p>
      </div>
    </AuthLayout>
  );
}
