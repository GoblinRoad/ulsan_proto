import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { getFestivalsWithCache, FestivalInfo } from '../../../services/festivalService';

const FestivalList: React.FC = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<FestivalInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFestivals = async () => {
      try {
        const festivalData = await getFestivalsWithCache();
    
        setFestivals(festivalData.slice(0, 3)); // 처음 3개만 표시
      } catch (error) {
        console.error('축제 정보 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFestivals();
  }, []);

  const handleFestivalClick = (festivalId: string) => {
    navigate(`/festival/${festivalId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">축제/행사</h2>
        </div>
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">축제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (festivals.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">축제/행사</h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">오늘 진행되는 축제/행사가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">축제/행사</h2>
          <Link
            to="/festivals"
            className="text-sm text-blue-500 font-medium hover:text-blue-600"
          >
            전체보기 <ChevronRight className="w-4 h-4 inline-block" />
          </Link>
        </div>

        <div className="space-y-4">
          {festivals.map((festival) => (
            <div
              key={festival.contentId}
              className="group cursor-pointer"
              onClick={() => handleFestivalClick(festival.contentId)}
            >
              <div className="relative h-32 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-200">
                {/* 배경 이미지 */}
                <div className="absolute inset-0">
                  {festival.firstimage ? (
                    <img
                      src={festival.firstimage}
                      alt={festival.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* 텍스트 콘텐츠 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">
                    {festival.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-white/80 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">
                      {festival.addr1}
                      {festival.addr2 && ` ${festival.addr2}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {festival.eventstartdate.slice(4, 6)}.{festival.eventstartdate.slice(6, 8)}
                      {festival.eventstartdate !== festival.eventenddate && 
                        ` - ${festival.eventenddate.slice(4, 6)}.${festival.eventenddate.slice(6, 8)}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
};

export default FestivalList;
