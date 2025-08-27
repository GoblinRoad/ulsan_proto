import React, { useEffect, useRef, useState } from 'react';
import { Navigation, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useKakaoMap from '../../hooks/useKakaoMap';
import { TouristSpot, CATEGORY_COLORS } from '../../types/tourist';
import { createCustomMarker, getCategoryIcon } from '../../utils/markerUtils';
import { testModeManager } from "@/data/testData";

interface MapViewProps {
  spots: TouristSpot[];
}

const MapView: React.FC<MapViewProps> = ({ spots }) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const currentInfoWindow = useRef<any>(null);
  const { isLoaded, error } = useKakaoMap();
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [containerHeight, setContainerHeight] = useState('400px');

  useEffect(() => {
    const calculateHeight = () => {
      const vh = window.innerHeight;

      const filterArea = document.querySelector('.bg-white.border-b');

      let usedHeight = 0;

      usedHeight += 80;

      if (filterArea) {
        usedHeight += filterArea.getBoundingClientRect().height;
      } else {
        usedHeight += 260;
      }

      usedHeight += 80;

      usedHeight += 10;

      const calculatedHeight = vh - usedHeight;
      const minHeight = 250;
      const finalHeight = Math.max(calculatedHeight, minHeight);

      setContainerHeight(`${finalHeight}px`);
    };

    calculateHeight();

    const timer = setTimeout(calculateHeight, 100);

    window.addEventListener('resize', calculateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  const ulsanCenter = {
    lat: 35.5384,
    lng: 129.3114
  };

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || isMapInitialized) return;

    try {
      const options = {
        center: new window.kakao.maps.LatLng(ulsanCenter.lat, ulsanCenter.lng),
        level: 7
      };

      map.current = new window.kakao.maps.Map(mapContainer.current, options);
      setIsMapInitialized(true);

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.current.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.current.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);





    } catch (err) {
      console.error('카카오맵 초기화 오류:', err);
    }
  }, [isLoaded, isMapInitialized]);

  const handleCheckIn = (spot: TouristSpot) => {
    if (!spot.visited) {
      if (testModeManager.isTestMode()) {
        const testSpot = testModeManager.getTestSpotDetail(spot.id);
        if (testSpot) {
          navigate(
              `/checkin?contentId=${testSpot.contentid}&contentType=${testSpot.contenttypeid}&fromSpotId=${encodeURIComponent(spot.id)}`
          );
        }
      } else {
        navigate(
            `/checkin?contentId=${spot.id}&contentType=${spot.type}&fromSpotId=${encodeURIComponent(spot.id)}`
        );
      }
    }
  };

  const handleDetail = (spot: TouristSpot) => {
    navigate(`/spot/${spot.id}`);
  };

  useEffect(() => {
    if (!isMapInitialized || !map.current) return;

    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    if (currentInfoWindow.current) {
      currentInfoWindow.current.close();
      currentInfoWindow.current = null;
    }

    const lastOpenMarkerId = sessionStorage.getItem('map_openInfoWindow');
    let infoWindowToReopen: any = null;
    let markerToReopen: any = null;

    spots.forEach((spot) => {
      const markerPosition = new window.kakao.maps.LatLng(spot.coordinates.lat, spot.coordinates.lng);

      const markerImageSrc = createCustomMarker(spot.category, spot.visited);
      const imageSize = new window.kakao.maps.Size(32, 42);
      const imageOption = { offset: new window.kakao.maps.Point(16, 42) };
      const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: spot.name,
        image: markerImage
      });

      marker.setMap(map.current);
      markers.current.push(marker);

      const getDistrictName = (district: string) => {
        switch (district) {
          case 'jung': return '중구';
          case 'nam': return '남구';
          case 'dong': return '동구';
          case 'buk': return '북구';
          case 'ulju': return '울주군';
          default: return '기타';
        }
      };

      const getDistrictColor = (district: string) => {
        switch (district) {
          case 'jung': return '#EF4444';
          case 'nam': return '#3B82F6';
          case 'dong': return '#EAB308';
          case 'buk': return '#8B5CF6';
          case 'ulju': return '#10B981';
          default: return '#6B7280';
        }
      };

      const categoryColor = CATEGORY_COLORS[spot.category] || '#6B7280';
      const categoryIcon = getCategoryIcon(spot.category);

      const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const safeName = escapeHtml(spot.name);
      const safeDescription = escapeHtml(spot.description);

      const imageHtml = spot.image && spot.image !== "/placeholder-image.jpg"
          ? `<div style="width: 80px; height: 60px; margin-right: 12px; border-radius: 6px; overflow: hidden; background: linear-gradient(135deg, #E0F2FE, #BAE6FD); flex-shrink: 0;">
             <img src="${spot.image}" alt="${safeName}" 
                  style="width: 100%; height: 100%; object-fit: cover;"
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #E0F2FE, #BAE6FD); color: #0284C7; font-size: 10px;&quot;><span>${categoryIcon}</span></div>';" />
           </div>`
          : `<div style="width: 80px; height: 60px; margin-right: 12px; border-radius: 6px; background: linear-gradient(135deg, #E0F2FE, #BAE6FD); display: flex; align-items: center; justify-content: center; color: #0284C7; font-size: 12px; flex-shrink: 0;">
             ${categoryIcon}
           </div>`;

      const buttonBaseStyle = "flex: 1; padding: 6px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.2s; border: none; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 2px;";

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 12px; width: 240px; font-family: 'Pretendard', sans-serif; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; margin-bottom: 10px;">
              ${imageHtml}
              
              <div style="flex: 1; min-width: 0;">
                <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1F2937; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${safeName}</h4>
                
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap;">
                  <span style="font-size: 10px; padding: 2px 6px; border-radius: 6px; background: ${getDistrictColor(spot.district)}20; color: ${getDistrictColor(spot.district)}; font-weight: 600; white-space: nowrap;">
                    📍 ${getDistrictName(spot.district)}
                  </span>
                  <span style="font-size: 10px; padding: 2px 6px; border-radius: 6px; background: ${categoryColor}; color: whitesmoke; font-weight: 600; white-space: nowrap;">
                    ${categoryIcon} ${spot.category}
                  </span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: 2px; background: linear-gradient(135deg, #FCD34D, #F59E0B); color: white; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">
                    💰 ${spot.coins}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 하단: 설명 + 버튼 -->
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #4B5563; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${safeDescription}</p>
            
            ${spot.visited ? `
              <div style="display: flex; align-items: center; justify-content: center; gap: 4px; color: #059669; font-size: 12px; font-weight: 600; padding: 8px; background: #ECFDF5; border-radius: 6px;">
                ✅ 방문 완료
              </div>
            ` : `
              <div style="display: flex; gap: 6px;">
                <button onclick="window.handleMapDetail('${spot.id}')" 
                        style="${buttonBaseStyle} background: #F3F4F6; color: #374151;"
                        onmouseover="this.style.background='#E5E7EB'"
                        onmouseout="this.style.background='#F3F4F6'">
                  📖 상세
                </button>
                <button onclick="window.handleMapCheckIn('${spot.id}')" 
                        style="${buttonBaseStyle} background: #3B82F6; color: white;"
                        onmouseover="this.style.background='#2563EB'"
                        onmouseout="this.style.background='#3B82F6'">
                  📷 체크인
                </button>
              </div>
            `}
          </div>
        `,
        removable: true
      });

      const closeInfoWindow = (infoWindow: any) => {
        infoWindow.close();
        sessionStorage.removeItem('map_openInfoWindow');
        if (currentInfoWindow.current === infoWindow) {
          currentInfoWindow.current = null;
        }
      };

      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (currentInfoWindow.current) {
          currentInfoWindow.current.close();
        }

        infoWindow.open(map.current, marker);
        currentInfoWindow.current = infoWindow;

        sessionStorage.setItem('map_openInfoWindow', spot.id);
      });

      if (lastOpenMarkerId === spot.id) {
        infoWindowToReopen = infoWindow;
        markerToReopen = marker;
      }
    });

    (window as any).handleMapDetail = (spotId: string) => {
      const spot = spots.find(s => s.id === spotId);
      if (spot) handleDetail(spot);
    };

    (window as any).handleMapCheckIn = (spotId: string) => {
      const spot = spots.find(s => s.id === spotId);
      if (spot) handleCheckIn(spot);
    };

    if (spots.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      spots.forEach(spot => {
        bounds.extend(new window.kakao.maps.LatLng(spot.coordinates.lat, spot.coordinates.lng));
      });
      map.current.setBounds(bounds);
    }

    if (infoWindowToReopen && markerToReopen) {
      setTimeout(() => {
        if (currentInfoWindow.current) {
          currentInfoWindow.current.close();
        }

        infoWindowToReopen.open(map.current, markerToReopen);
        currentInfoWindow.current = infoWindowToReopen;
      }, 100);
    }
  }, [spots, isMapInitialized, navigate]);

  useEffect(() => {
    return () => {
      delete (window as any).handleMapDetail;
      delete (window as any).handleMapCheckIn;
    };
  }, []);

  if (error) {
    return (
        <div style={{ height: containerHeight }} className="bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">지도 로드 오류</h3>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
    );
  }

  if (!isLoaded) {
    return (
        <div style={{ height: containerHeight }} className="bg-blue-50 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">카카오맵 로딩 중...</h3>
            <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
          </div>
        </div>
    );
  }

  return (
      <div className="relative overflow-hidden" style={{ height: containerHeight }}>
        {/* 카카오맵 컨테이너 */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* 범례 */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="text-sm font-semibold mb-2 text-gray-800">카테고리별 색상</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                <div key={category} className="flex items-center space-x-2">
                  <div
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-gray-600 truncate">{category}</span>
                </div>
            ))}
            <div className="flex items-center space-x-2 col-span-2 pt-1 border-t border-gray-200">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">방문완료</span>
            </div>
          </div>
        </div>

        {/* 관광지 개수 표시 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
          <span className="text-sm font-semibold text-gray-700">
            관광지 {spots.length}개
          </span>
        </div>
      </div>
  );
};

export default MapView;