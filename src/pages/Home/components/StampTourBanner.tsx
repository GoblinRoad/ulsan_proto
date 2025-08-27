import React, { useState, useEffect } from 'react';
import { MapPin, Target, Coins, ArrowRight, Gift, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import stampImage from '../../../assets/images/stamp.png';

const StampTourBanner: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 모달이 열려있을 때 배경 스크롤 방지
  useEffect(() => {
    if (showHelpModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showHelpModal]);

  const handleStartTour = () => {
    navigate('/map');
  };

  const handleViewRewards = () => {
    navigate('/rewards');
  };

  const handleShowHelp = () => {
    setShowHelpModal(true);
  };

  const handleCloseHelp = () => {
    setShowHelpModal(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/60 to-purple-600/60 rounded-2xl p-6 text-white animate-slideUp relative overflow-hidden">
      {/* 배경 스탬프 이미지 */}
      <div className="absolute -top-5 right-1 w-40 h-40 opacity-80">
        <img 
          src={stampImage} 
          alt="스탬프" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* 도움말 아이콘 */}
      <button
        onClick={handleShowHelp}
        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-20 cursor-pointer"
      >
        <HelpCircle className="w-5 h-5 text-white" />
      </button>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-xl font-bold">울산 스탬프 투어</h2>
          <p className="text-sm text-white/80">방문하고 스탬프를 모으세요!</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-white/80" />
            <span className="text-sm">5개 인기 코스</span>
          </div>
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-white/80" />
            <span className="text-sm">완주 보상</span>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3 relative z-10">
        <button
          onClick={handleStartTour}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <MapPin className="w-4 h-4" />
          <span>투어 시작</span>
        </button>
        
        <button
          onClick={handleViewRewards}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Gift className="w-4 h-4" />
          <span>보상 확인</span>
        </button>
      </div>
      
      {/* 도움말 모달 */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">스탬프 투어 가이드</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">🎯 스탬프 투어란?</h4>
                <p className="text-sm sm:text-base">울산의 관광지를 방문하여 방문인증을 하고 코인을 획득할 수 있는 여행 프로그램입니다.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">📍 사용 방법</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base">
                  <li>홈에서 원하는 코스를 선택하세요</li>
                  <li>관광지에 방문하여 체크인하세요</li>
                  <li>방문인증 후 코인을 획득할 수 있습니다</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">🪙 보상 시스템</h4>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                  <li>각 관광지 방문 시 코인 획득</li>
                  <li>미션 완료 시 추가 보상</li>
                  <li>획득한 코인으로 상품권 교환 가능</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">💡 팁</h4>
                <p className="text-base sm:text-lg">여러 미션을 완료할수록 더 많은 코인을 모을 수 있어요!</p>
              </div>
            </div>
            
            <button
              onClick={handleCloseHelp}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 rounded-xl font-medium transition-colors mt-4 sm:mt-6 text-sm sm:text-base"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StampTourBanner;
