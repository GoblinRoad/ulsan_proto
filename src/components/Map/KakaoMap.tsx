import React, { useEffect, useRef } from 'react';
import whaleMarker1 from '../../assets/marker/whale_marker1.png';
import whaleMarker2 from '../../assets/marker/whale_marker2.png';
import whaleMarker3 from '../../assets/marker/whale_marker3.png';
import whaleMarker4 from '../../assets/marker/whale_marker4.png';
import whaleMarker5 from '../../assets/marker/whale_marker5.png';
import whaleMarker6 from '../../assets/marker/whale_marker6.png';
import whaleMarker7 from '../../assets/marker/whale_marker7.png';

declare global {
  interface Window {
    kakao: any;
  }
}

interface MarkerInfo {
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  contentId?: string;
}

interface KakaoMapProps {
  center: { lat: number; lng: number };
  markers: MarkerInfo[];
  path?: { lat: number; lng: number }[]; // 경로 폴리라인
  height?: number;
  showOrder?: boolean; // 마커에 1..N 순번 표시
  customMarker?: string; // 커스텀 마커 이미지 경로
}

function loadKakaoScript(appKey?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    // index.html에서 이미 SDK를 직접 로드하는 경우를 고려해, appKey가 없어도 진행

    const scriptId = 'kakao-maps-sdk';
    if (document.getElementById(scriptId)) {
      (window as any).kakao.maps.load(() => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = appKey
      ? `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
      : `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error('Failed to load Kakao Maps script'));
    document.head.appendChild(script);
  });
}

const KakaoMap: React.FC<KakaoMapProps> = ({ center, markers, path, height = 220, showOrder = false, customMarker }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 인포윈도우 내용 생성 함수
  const createInfoWindowContent = (marker: MarkerInfo) => {
    return `
      <div id="info-${marker.contentId || 'default'}" style="
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 250px;
        max-width: 320px;
        font-family: 'Pretendard', sans-serif;
        border: 1px solid #e5e7eb;
        position: relative;
      ">
        <div style="margin-bottom: 8px;">
          <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1F2937; line-height: 1.3;">
            ${marker.title || ''}
          </h4>
        </div>
        ${marker.address ? `
          <div style="font-size: 12px; color: #6B7280; line-height: 1.4;">
            📍 ${marker.address}
          </div>
        ` : ''}
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid white;
        "></div>
      </div>
    `;
  };

  useEffect(() => {
    const appKey = (import.meta.env.KAKAOMAP_API_KEY || import.meta.env.VITE_KAKAOMAP_API_KEY) as string | undefined;
    let map: any;
    let kakaoMarkers: any[] = [];
    let polyline: any | null = null;
    let overlays: any[] = [];

    loadKakaoScript(appKey)
      .then(() => {
        if (!containerRef.current) return;
        const kakao = window.kakao;
        const options = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 7,
          draggable: false, // 지도 드래그 비활성화
          zoomable: true // 줌 기능 활성화 (핀치 줌 포함)
        };
        map = new kakao.maps.Map(containerRef.current, options);





        kakaoMarkers = markers.map((m, idx) => {
          // 커스텀 마커가 있으면 사용, 없으면 순서에 맞는 고래 마커 이미지 선택
          let selectedMarkerImage;
          if (customMarker) {
            selectedMarkerImage = customMarker;
          } else {
            const markerImages = [
              whaleMarker1, whaleMarker2, whaleMarker3, whaleMarker4, 
              whaleMarker5, whaleMarker6, whaleMarker7
            ];
            selectedMarkerImage = markerImages[idx] || whaleMarker1; // 기본값은 whaleMarker1
          }
          
          // 고래 마커 이미지 생성
          const whaleMarker = new kakao.maps.MarkerImage(
            selectedMarkerImage,
            new kakao.maps.Size(29, 42), // 29x42 크기
            {
              offset: new kakao.maps.Point(14.5, 21) // 마커 중심점 (29/2, 42/2)
            }
          );

          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(m.lat, m.lng),
            title: m.title || '',
            image: whaleMarker,
            clickable: true
          });
          marker.setMap(map);

          // 인포윈도우 생성
          const content = createInfoWindowContent(m);
          const overlay = new kakao.maps.CustomOverlay({
            content: content,
            map: null, // 기본적으로 숨김
            position: new kakao.maps.LatLng(m.lat, m.lng),
            clickable: true,
            yAnchor: 1.2 // 마커 위로 표시
          });

          // 마커 클릭 이벤트
          kakao.maps.event.addListener(marker, 'click', function () {
            // 다른 오버레이들 닫기
            overlays.forEach(overlay => {
              if (overlay instanceof kakao.maps.CustomOverlay) {
                overlay.setMap(null);
              }
            });
            
            // 현재 오버레이 토글
            if (overlay.getMap()) {
              overlay.setMap(null);
            } else {
              // 지도를 해당 마커 위치로 중앙 이동
              map.panTo(new kakao.maps.LatLng(m.lat, m.lng));
              overlay.setMap(map);
            }
          });

          // 지도 클릭 시 오버레이 닫기
          kakao.maps.event.addListener(map, 'click', function () {
            overlays.forEach(overlay => {
              if (overlay instanceof kakao.maps.CustomOverlay) {
                overlay.setMap(null);
              }
            });
          });

          overlays.push(overlay);
          
          return marker;
        });

        if (markers.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          markers.forEach(m => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
          map.setBounds(bounds, 24, 24, 24, 24);
        }

        if (path && path.length > 1) {
          const kakaoPath = path.map(p => new kakao.maps.LatLng(p.lat, p.lng));
          polyline = new kakao.maps.Polyline({
            map,
            path: kakaoPath,
            strokeWeight: 4,
            strokeColor: '#2563eb',
            strokeOpacity: 0.9,
            strokeStyle: 'solid'
          });

          const bounds = new kakao.maps.LatLngBounds();
          kakaoPath.forEach(p => bounds.extend(p));
          map.setBounds(bounds, 24, 24, 24, 24);
        }
      })
      .catch(() => {
        // noop: 상단에서 fallback UI 표시
      });

    return () => {
      kakaoMarkers.forEach(m => m.setMap(null));
      if (polyline) polyline.setMap(null);
      overlays.forEach(o => o.setMap(null));
      map = null;
    };
  }, [center.lat, center.lng, markers, path, showOrder, customMarker]);

        const appKey = (import.meta.env.KAKAOMAP_API_KEY || import.meta.env.VITE_KAKAOMAP_API_KEY) as string | undefined;
  const showFallback = !appKey;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ height }}>
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
          지도를 불러오려면 KAKAOMAP_API_KEY 또는 VITE_KAKAOMAP_API_KEY를 설정해주세요.
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}

    </div>
  );
};

export default KakaoMap;


