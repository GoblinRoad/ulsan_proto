import { getFirstSpotInfo } from './courseSpotService';
import { cacheManager, CACHE_TTL } from '../utils/cacheManager';
import 일산해수욕장이미지 from '../assets/spot/일산해수욕장.jpg';

// 코스별 대표 이미지 매핑 (쪽빛바다여행만 특별 처리)
const COURSE_REPRESENTATIVE_IMAGES: Record<string, string> = {
  '쪽빛바다여행': 일산해수욕장이미지, // 특별히 일산해수욕장 이미지 사용
};

// 코스별 대표 이미지 캐시 (메모리 + localStorage)
const courseImageCache = new Map<string, string>();

// 코스의 대표 이미지를 가져오는 함수 (최적화 버전)
export async function getCourseRepresentativeImage(courseName: string): Promise<string> {
  // 메모리 캐시 확인
  if (courseImageCache.has(courseName)) {
    return courseImageCache.get(courseName)!;
  }

  // localStorage 캐시 확인
  const cacheKey = `course_image_${courseName}`;
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    courseImageCache.set(courseName, cached);
    return cached;
  }

  // 쪽빛바다여행은 특별히 일산해수욕장 이미지 사용
  if (courseName === '쪽빛바다여행') {
    const imageUrl = COURSE_REPRESENTATIVE_IMAGES[courseName];
    courseImageCache.set(courseName, imageUrl);
    cacheManager.set(cacheKey, imageUrl, CACHE_TTL.COURSE);
    return imageUrl;
  }

  // 나머지 코스는 TourAPI에서 첫 번째 관광지 정보를 가져와서 이미지 사용
  try {
    const firstSpot = await getFirstSpotInfo(courseName);
    if (firstSpot) {
      courseImageCache.set(courseName, firstSpot.image);
      cacheManager.set(cacheKey, firstSpot.image, CACHE_TTL.COURSE);
      return firstSpot.image;
    }
  } catch (error) {
    console.error(`"${courseName}" 대표 이미지 가져오기 실패:`, error);
  }

  // 기본 이미지 반환
  const defaultImage = '/placeholder-image.jpg';
  courseImageCache.set(courseName, defaultImage);
  cacheManager.set(cacheKey, defaultImage, CACHE_TTL.COURSE);
  return defaultImage;
}

// 모든 코스의 대표 이미지를 병렬로 미리 로딩하는 함수 (최적화 버전)
export async function preloadAllCourseImages(): Promise<void> {
  const courseNames = [
    '선사와 명주 여행',
    '웰니스&웰빙여행',
    '자연과 예술여행',
    '쪽빛바다여행',
    '독립역사여행'
  ];

  // 쪽빛바다여행은 로컬 이미지이므로 즉시 처리
  const localImageCourse = courseNames.find(name => name === '쪽빛바다여행');
  if (localImageCourse) {
    courseImageCache.set(localImageCourse, COURSE_REPRESENTATIVE_IMAGES[localImageCourse]);
  }

  // 나머지 코스들은 병렬로 처리
  const apiCourseNames = courseNames.filter(name => name !== '쪽빛바다여행');
  
  if (apiCourseNames.length > 0) {
    const imagePromises = apiCourseNames.map(async (courseName) => {
      try {
        const imageUrl = await getCourseRepresentativeImage(courseName);
        return { courseName, imageUrl };
      } catch (error) {
        console.error(`"${courseName}" 이미지 로딩 실패:`, error);
        return { courseName, imageUrl: '/placeholder-image.jpg' };
      }
    });

    await Promise.all(imagePromises);
  }
}

// 빠른 로딩을 위한 최적화된 함수
export async function getCourseImagesOptimized(): Promise<Record<string, string>> {
  const courseNames = [
    '선사와 명주 여행',
    '웰니스&웰빙여행',
    '자연과 예술여행',
    '쪽빛바다여행',
    '독립역사여행'
  ];

  // 이미 캐시된 이미지들 먼저 반환
  const cachedImages: Record<string, string> = {};
  courseNames.forEach(name => {
    if (courseImageCache.has(name)) {
      cachedImages[name] = courseImageCache.get(name)!;
    }
  });

  // 캐시되지 않은 이미지들만 병렬로 로딩
  const uncachedCourses = courseNames.filter(name => !courseImageCache.has(name));
  
  if (uncachedCourses.length > 0) {
    const imagePromises = uncachedCourses.map(async (courseName) => {
      const imageUrl = await getCourseRepresentativeImage(courseName);
      return { courseName, imageUrl };
    });

    const results = await Promise.all(imagePromises);
    results.forEach(({ courseName, imageUrl }) => {
      cachedImages[courseName] = imageUrl;
    });
  }

  return cachedImages;
}
