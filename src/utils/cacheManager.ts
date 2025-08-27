// 캐시 관리 유틸리티
export const cacheManager = {
  // 캐시 저장
  set: (key: string, data: any, ttl: number) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }));
    } catch (error) {
      console.error('캐시 저장 실패:', error);
    }
  },
  
  // 캐시 조회
  get: (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > ttl;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('캐시 조회 실패:', error);
      return null;
    }
  },
  
  // 캐시 삭제
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
    }
  },
  
  // 캐시 키 생성 (날짜별)
  getDateKey: (prefix: string) => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `${prefix}_${today}`;
  }
};

// 캐시 TTL 상수
export const CACHE_TTL = {
  FESTIVAL: 24 * 60 * 60 * 1000, // 24시간
  COURSE: 7 * 24 * 60 * 60 * 1000, // 7일
} as const;
