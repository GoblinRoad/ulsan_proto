export interface FestivalInfo {
  contentId: string;
  title: string;
  addr1: string;
  addr2?: string;
  tel?: string;
  firstimage?: string;
  firstimage2?: string;
  eventstartdate: string;
  eventenddate: string;
  mapx: string;
  mapy: string;
}

// 한국 시간으로 오늘 날짜를 YYYYMMDD 형식으로 반환
function getTodayDateYYYYMMDD(): string {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9 (한국 시간)
  
  const year = koreaTime.getUTCFullYear();
  const month = String(koreaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(koreaTime.getUTCDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

// 축제 정보 가져오기
export async function getFestivals(): Promise<FestivalInfo[]> {
  const serviceKey = import.meta.env.VITE_TOURAPI_KEY;
  
  if (!serviceKey) {
    console.error('Tour API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    const today = getTodayDateYYYYMMDD();
    
    const params = new URLSearchParams({
      serviceKey: decodeURIComponent(serviceKey),
      pageNo: '1',
      numOfRows: '10',
      MobileOS: 'WEB',
      MobileApp: 'Ulsan',
      _type: 'json',
      eventStartDate: today,
      areaCode: '7' // 울산광역시
    });

    const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`축제 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`축제 API 오류: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items?.item;
    if (!items || items.length === 0) {
      return [];
    }

    return items.map((item: any) => ({
      contentId: item.contentid,
      title: item.title,
      addr1: item.addr1,
      addr2: item.addr2,
      tel: item.tel,
      firstimage: item.firstimage,
      firstimage2: item.firstimage2,
      eventstartdate: item.eventstartdate,
      eventenddate: item.eventenddate,
      mapx: item.mapx,
      mapy: item.mapy
    }));

  } catch (error) {
    console.error('축제 정보 가져오기 실패:', error);
    return [];
  }
}

import { cacheManager, CACHE_TTL } from '../utils/cacheManager';

// 캐시를 사용하는 버전
export async function getFestivalsWithCache(): Promise<FestivalInfo[]> {
  const today = getTodayDateYYYYMMDD();
  const cacheKey = `festivals_${today}`;
  
  // localStorage 캐시 확인
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const festivals = await getFestivals();
  
  // localStorage 캐시 저장
  cacheManager.set(cacheKey, festivals, CACHE_TTL.FESTIVAL);
  
  return festivals;
}

// 축제 상세 소개 정보 가져오기
export async function getFestivalIntro(contentId: string): Promise<any> {
  const serviceKey = import.meta.env.VITE_TOURAPI_KEY;
  
  if (!serviceKey) {
    console.error('Tour API 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    const params = new URLSearchParams({
      serviceKey: decodeURIComponent(serviceKey),
      pageNo: '1',
      numOfRows: '1',
      MobileOS: 'WEB',
      MobileApp: 'Ulsan',
      _type: 'json',
      contentId: contentId,
      contentTypeId: '15'
    });

    const url = `https://apis.data.go.kr/B551011/KorService2/detailIntro2?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`축제 소개 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.response) {
      throw new Error('축제 소개 API 응답이 올바르지 않습니다.');
    }
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`축제 소개 API 오류: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items?.item?.[0] || null;

  } catch (error) {
    console.error('축제 소개 정보 가져오기 실패:', error);
    return null;
  }
}

// 축제 상세 정보 가져오기
export async function getFestivalInfo(contentId: string): Promise<any[]> {
  const serviceKey = import.meta.env.VITE_TOURAPI_KEY;
  
  if (!serviceKey) {
    console.error('Tour API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    const params = new URLSearchParams({
      serviceKey: decodeURIComponent(serviceKey),
      pageNo: '1',
      numOfRows: '10',
      MobileOS: 'WEB',
      MobileApp: 'Ulsan',
      _type: 'json',
      contentId: contentId,
      contentTypeId: '15'
    });

    const url = `https://apis.data.go.kr/B551011/KorService2/detailInfo2?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`축제 정보 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.response) {
      throw new Error('축제 정보 API 응답이 올바르지 않습니다.');
    }
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`축제 정보 API 오류: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items?.item || [];

  } catch (error) {
    console.error('축제 정보 가져오기 실패:', error);
    return [];
  }
}

// 축제 이미지 인터페이스
export interface FestivalImage {
  contentid: string;
  originimgurl: string;
  imgname: string;
  smallimageurl: string;
  cpyrhtDivCd: string;
  serialnum: string;
}

// 축제 이미지 가져오기
export async function getFestivalImages(contentId: string): Promise<FestivalImage[]> {
  const serviceKey = import.meta.env.VITE_TOURAPI_KEY;
  
  if (!serviceKey) {
    console.error('Tour API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    const params = new URLSearchParams({
      serviceKey: decodeURIComponent(serviceKey),
      pageNo: '1',
      numOfRows: '10',
      MobileOS: 'WEB',
      MobileApp: 'Ulsan',
      _type: 'json',
      contentId: contentId
    });

    const url = `https://apis.data.go.kr/B551011/KorService2/detailImage2?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`축제 이미지 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.response) {
      throw new Error('축제 이미지 API 응답이 올바르지 않습니다.');
    }
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`축제 이미지 API 오류: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items?.item || [];

  } catch (error) {
    console.error('축제 이미지 가져오기 실패:', error);
    return [];
  }
}

// 캐시 초기화 함수
export function clearFestivalCache() {
  const today = getTodayDateYYYYMMDD();
  const cacheKey = `festivals_${today}`;
  cacheManager.remove(cacheKey);
}
