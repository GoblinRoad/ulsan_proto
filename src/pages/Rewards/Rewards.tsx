import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import CoinStatus from './components/CoinStatus';
import RewardsList from './components/RewardsList';
import ExchangeHistory from './components/ExchangeHistory';

const Rewards: React.FC = () => {
  const { state } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

  // 로그인하지 않은 상태에서 사용 내역 탭이 활성화되어 있으면 상품권 교환 탭으로 변경
  React.useEffect(() => {
    if (!user && activeTab === 'history') {
      setActiveTab('rewards');
    }
  }, [user, activeTab]);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="px-4 py-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3">리워드 센터</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'rewards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              상품권 교환
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                사용 내역
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4 space-y-4">
          {user && <CoinStatus totalCoins={state.user.totalCoins} />}
          
          {activeTab === 'rewards' ? (
            <RewardsList totalCoins={state.user.totalCoins} />
          ) : (
            <ExchangeHistory />
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;