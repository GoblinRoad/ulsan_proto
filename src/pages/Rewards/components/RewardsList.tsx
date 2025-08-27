import React, { useState } from 'react';
import { Gift, ShoppingBag, Coffee, Utensils, Check } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';

interface RewardsListProps {
  totalCoins: number;
}

const RewardsList: React.FC<RewardsListProps> = ({ totalCoins }) => {
  const { dispatch } = useApp();
  const { user } = useAuth();
  const [exchangedItems, setExchangedItems] = useState<Set<string>>(new Set());

  const rewards = [
    {
      id: '1',
      title: '울산사랑상품권',
      subtitle: '5,000원권',
      coins: 500,
      icon: Gift,
      color: 'from-blue-400 to-cyan-400',
      description: '울산 지역 가맹점에서 사용 가능'
    },
    {
      id: '2',
      title: '울산사랑상품권',
      subtitle: '10,000원권',
      coins: 1000,
      icon: ShoppingBag,
      color: 'from-green-400 to-emerald-400',
      description: '울산 지역 가맹점에서 사용 가능'
    },
    {
      id: '3',
      title: '고래고기 맛집',
      subtitle: '할인쿠폰 20%',
      coins: 300,
      icon: Utensils,
      color: 'from-red-400 to-pink-400',
      description: '장생포 지역 고래고기 전문점'
    },
    {
      id: '4',
      title: '카페 음료',
      subtitle: '아메리카노 1잔',
      coins: 200,
      icon: Coffee,
      color: 'from-amber-400 to-orange-400',
      description: '태화강 국가정원 근처 카페'
    },
    {
      id: '5',
      title: '울산사랑상품권',
      subtitle: '20,000원권',
      coins: 2000,
      icon: Gift,
      color: 'from-purple-400 to-pink-400',
      description: '울산 지역 가맹점에서 사용 가능'
    },
    {
      id: '6',
      title: '언양불고기 맛집',
      subtitle: '할인쿠폰 30%',
      coins: 800,
      icon: Utensils,
      color: 'from-yellow-400 to-orange-400',
      description: '언양읍 불고기 전문점'
    }
  ];

  const handleExchange = (rewardId: string, requiredCoins: number) => {
    if (totalCoins >= requiredCoins && !exchangedItems.has(rewardId)) {
      dispatch({ type: 'EXCHANGE_COINS', payload: { amount: requiredCoins, reward: rewardId } });
      setExchangedItems(prev => new Set(prev).add(rewardId));
      
      // 실제 앱에서는 여기서 상품권 발급 프로세스 진행
      alert('상품권이 발급되었습니다! 사용 내역에서 확인하세요.');
    }
  };

  return (
    <div className="space-y-3">
      {rewards.map((reward, index) => {
        const canExchange = totalCoins >= reward.coins;
        const isExchanged = exchangedItems.has(reward.id);
        const IconComponent = reward.icon;

        return (
          <div
            key={reward.id}
            className={`bg-white rounded-xl p-4 border transition-all animate-slideUp ${
              canExchange && !isExchanged ? 'border-gray-200 shadow-sm' : 'border-gray-100'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 bg-gradient-to-r ${reward.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{reward.title}</h3>
                <p className="text-gray-600 text-sm">{reward.subtitle}</p>
                <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-1 text-orange-500">
                    <span className="text-sm font-bold">{reward.coins}</span>
                    <span className="text-xs">코인</span>
                  </div>
                  
                  {isExchanged ? (
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      <span className="text-xs font-medium">교환완료</span>
                    </div>
                  ) : canExchange ? (
                    <button
                      onClick={() => handleExchange(reward.id, reward.coins)}
                      className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      교환하기
                    </button>
                  ) : !user ? (
                    <div className="text-xs text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                      로그인 필요
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      코인 부족
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RewardsList;