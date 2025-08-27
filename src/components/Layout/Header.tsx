import React from "react";
import { Coins, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import whaleToUlsanLogo from '../../assets/logo/whalecome_ulsan.png';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { state } = useApp();
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <img 
              src={whaleToUlsanLogo} 
              alt="웨일컴울산" 
              className="w-16 h-16 object-contain -my-2"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">웨일컴울산</h1>
              <p className="text-xs text-gray-500">추억을 남기고, 가치를 더하다</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              // 로그인된 상태 - 코인 표시
              <div 
                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 rounded-full cursor-pointer hover:from-yellow-500 hover:to-orange-500 transition-all duration-200"
                onClick={() => navigate('/rewards')}
              >
                <Coins className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">
                  {state.user.totalCoins}
                </span>
              </div>
            ) : (
              // 로그인되지 않은 상태 - 로그인 버튼
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="font-medium">로그인</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header
