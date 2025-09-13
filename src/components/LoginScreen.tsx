import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      <ParticlesBackground />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-900/5" style={{ zIndex: 2 }} />
      
      <div className="max-w-md w-full space-y-8 relative" style={{ zIndex: 3 }}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent mb-3">
            TaskFlow
          </h1>
          <p className="text-gray-300 text-lg font-medium">Quản lý công việc thông minh</p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl" />
          
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-3">
                Đăng nhập để bắt đầu
              </h2>
              <p className="text-gray-300">
                Đồng bộ dữ liệu trên mọi thiết bị
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-600/50 rounded-xl shadow-lg bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white hover:shadow-xl hover:shadow-green-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] font-medium"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng
              </p>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-green-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default LoginScreen;
