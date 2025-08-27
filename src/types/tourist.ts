export interface TouristSpot {
    id: string;
    type: string;
    name: string;
    district: 'jung' | 'nam' | 'dong' | 'buk' | 'ulju';
    category: '체험관광' | '음식' | '역사관광' | '레저스포츠' | '자연관광' | '시장' | '문화관광' | '쇼핑';
    description: string;
    address: string;
    coins: number;
    image: string;
    visited: boolean;
    coordinates: {
        lat: number;
        lng: number;
    };
    tel?: string;
}

export type DistrictFilter = 'all' | 'jung' | 'nam' | 'dong' | 'buk' | 'ulju';
export type CategoryFilter = 'all' | '문화관광' | '자연관광' | '역사관광' | '체험관광' | '레저스포츠' | '시장';

export interface SpotCounts {
    all: number;
    jung: number;
    nam: number;
    dong: number;
    buk: number;
    ulju: number;
}

export interface CategoryCounts {
    all: number;
    문화관광: number;
    자연관광: number;
    역사관광: number;
    체험관광: number;
    레저스포츠: number;
    시장: number;
    음식: number;
}

// 카테고리별 색상 정보
export const CATEGORY_COLORS = {
    숙박: '#F59E0B', // amber-500
    추천코스: '#8B5CF6', // violet-500
    체험관광: '#EC4899', // pink-500
    음식: '#F97316', // orange-500
    역사관광: '#8B5CF6', // violet-500
    레저스포츠: '#EF4444', // red-500
    자연관광: '#10B981', // emerald-500
    시장: '#10B981', // emerald-500
    문화관광: '#3B82F6',
    쇼핑: '#000000'// blue-500
} as const;