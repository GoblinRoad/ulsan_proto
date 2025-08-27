import React, { useEffect, useState } from 'react';
import { ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { popularCourses } from '../../PopularCourses/courses';
import { getCourseImagesOptimized } from '../../../services/courseImageService';

const RecommendedCourses: React.FC = () => {
  const [courseImages, setCourseImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const courses = popularCourses.slice(0, 3).map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    duration: c.duration,
    spots: c.items.length,
    color: c.color
  }));

  useEffect(() => {
    const loadCourseImages = async () => {
      try {
        // 최적화된 함수로 모든 코스 이미지를 한 번에 가져오기
        const allImages = await getCourseImagesOptimized();
        
        // 홈페이지에 표시할 3개 코스만 필터링
        const imageMap: Record<number, string> = {};
        courses.forEach(course => {
          if (allImages[course.name]) {
            imageMap[course.id] = allImages[course.name];
          }
        });

        setCourseImages(imageMap);
      } catch (error) {
        console.error('코스 이미지 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseImages();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">인기 코스</h3>
        <Link to="/popular" className="text-sm text-blue-500 font-medium hover:text-blue-600">
          전체보기 <ChevronRight className="w-4 h-4 inline-block" />
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-gray-500">코스 정보를 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4 select-none">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              className="block rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-slideUp bg-transparent outline-none focus:outline-none focus-visible:outline-none active:outline-none ring-0 focus:ring-0 active:ring-0 select-none"
              style={{ animationDelay: `${index * 0.15}s` }}
              to={`/popular/${course.id}`}
            >
              <div className="relative h-32 bg-gray-200">
                {courseImages[course.id] ? (
                  <img
                    src={courseImages[course.id]}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* 오버레이 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* 코스 정보 오버레이 */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-white font-bold text-lg mb-1">{course.name}</h4>
                  <p className="text-white/90 text-sm leading-relaxed mb-2">{course.description}</p>
                  <div className="flex items-center space-x-1 text-white/80 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{course.spots}곳</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedCourses;