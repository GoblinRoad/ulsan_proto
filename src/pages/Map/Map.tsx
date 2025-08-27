import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import MapView from '@/components/Map/MapView';
import FilterTabs from '@/components/Map/FilterTabs';
import DistrictFilterTabs from '@/components/Map/DistrictFilterTabs';
import SpotList from '@/components/Map/SpotList';
import {TEST_TOURIST_SPOTS} from "@/data/testData"
import SearchInput from '@/components/Map/SearchInput';
import useTourApi from '@/hooks/useTourApi';
import { CategoryFilter, DistrictFilter, CategoryCounts, SpotCounts } from '@/types/tourist';

const Map: React.FC = () => {
  const { spots, loading, error, refetch } = useTourApi();
  const [checkedInSpots, setCheckedInSpots] = useState<Set<string>>(new Set());

  const [viewMode, setViewMode] = useState<'map' | 'list'>(() => {
    return (sessionStorage.getItem('map_viewMode') as 'map' | 'list') || 'list';
  });

  const [districtFilter, setDistrictFilter] = useState<DistrictFilter>(() => {
    return (sessionStorage.getItem('map_districtFilter') as DistrictFilter) || 'all';
  });

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(() => {
    return (sessionStorage.getItem('map_categoryFilter') as CategoryFilter) || 'all';
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('map_searchTerm') || '';
  });

  useEffect(() => {
    sessionStorage.setItem('map_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    sessionStorage.setItem('map_districtFilter', districtFilter);
  }, [districtFilter]);

  useEffect(() => {
    sessionStorage.setItem('map_categoryFilter', categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    sessionStorage.setItem('map_searchTerm', searchTerm);
  }, [searchTerm]);

  const searchFilter = useCallback((spot: any, term: string) => {
    if (!term) return true;

    const searchText = term.toLowerCase().trim();
    return (
        spot.name.toLowerCase().includes(searchText) ||
        spot.address.toLowerCase().includes(searchText) ||
        spot.description.toLowerCase().includes(searchText)
    );
  }, []);

  const filterByCategory = useCallback((spot: any) => {
    const excludedCategories = ['축제/공연/행사', '숙박', '추천코스', '음식'];

    if (excludedCategories.includes(spot.category)) {
      return false;
    }

    if (spot.category === '쇼핑') {
      if (spot.name.includes('시장')) {
        spot.category = '시장';
        return true;
      }
      return false;
    }

    return true;
  }, []);

  const handleCheckInComplete = useCallback((spotId: string) => {
    setCheckedInSpots(prev => new Set([...prev, spotId]));
  }, []);

  const baseFilteredSpots = useMemo(() => {
    return spots.filter(filterByCategory);
  }, [spots, filterByCategory]);

  const filterKey = useMemo(() => {
    return `${searchTerm}|${districtFilter}|${categoryFilter}`;
  }, [searchTerm, districtFilter, categoryFilter]);

  const filteredSpots = useMemo(() => {
    let filtered = [...baseFilteredSpots];

    if (searchTerm) {
      filtered = filtered.filter(spot => searchFilter(spot, searchTerm));
    }

    if (districtFilter !== 'all') {
      filtered = filtered.filter(spot => spot.district === districtFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(spot => spot.category === categoryFilter);
    }

    return filtered;
  }, [baseFilteredSpots, searchTerm, districtFilter, categoryFilter, searchFilter]);

  const spotCounts: SpotCounts = useMemo(() => {
    let baseFiltered = baseFilteredSpots;

    if (searchTerm) {
      baseFiltered = baseFiltered.filter(spot => searchFilter(spot, searchTerm));
    }

    const categoryFiltered = categoryFilter === 'all'
        ? baseFiltered
        : baseFiltered.filter(spot => spot.category === categoryFilter);

    return {
      all: categoryFiltered.length,
      jung: categoryFiltered.filter(spot => spot.district === 'jung').length,
      nam: categoryFiltered.filter(spot => spot.district === 'nam').length,
      dong: categoryFiltered.filter(spot => spot.district === 'dong').length,
      buk: categoryFiltered.filter(spot => spot.district === 'buk').length,
      ulju: categoryFiltered.filter(spot => spot.district === 'ulju').length,
    };
  }, [baseFilteredSpots, searchTerm, categoryFilter, searchFilter]);

  const categoryCounts: CategoryCounts = useMemo(() => {
    let baseFiltered = baseFilteredSpots;

    if (searchTerm) {
      baseFiltered = baseFiltered.filter(spot => searchFilter(spot, searchTerm));
    }

    const districtFiltered = districtFilter === 'all'
        ? baseFiltered
        : baseFiltered.filter(spot => spot.district === districtFilter);

    return {
      all: districtFiltered.length,
      문화관광: districtFiltered.filter(spot => spot.category === '문화관광').length,
      자연관광: districtFiltered.filter(spot => spot.category === '자연관광').length,
      역사관광: districtFiltered.filter(spot => spot.category === '역사관광').length,
      체험관광: districtFiltered.filter(spot => spot.category === '체험관광').length,
      레저스포츠: districtFiltered.filter(spot => spot.category === '레저스포츠').length,
      시장: districtFiltered.filter(spot => spot.category === '시장').length,
      음식: districtFiltered.filter(spot => spot.category === '음식').length,
    };
  }, [baseFilteredSpots, searchTerm, districtFilter, searchFilter]);

  if (loading) {
    return (
        <div className="max-w-md mx-auto">
          <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="px-4 py-3">
              <h2 className="text-lg font-bold text-gray-800">관광지 찾기</h2>
            </div>
          </div>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">관광지 정보 로딩 중...</h3>
              <p className="text-gray-500 text-sm">울산 관광지 데이터를 가져오고 있습니다</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-md mx-auto">
          <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="px-4 py-3">
              <h2 className="text-lg font-bold text-gray-800">관광지 찾기</h2>
            </div>
          </div>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">데이터 로드 실패</h3>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button
                  onClick={refetch}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>다시 시도</span>
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-800">관광지 찾기</h2>
                <button
                    onClick={refetch}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    title="새로고침"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  목록
                </button>
                <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  지도
                </button>
              </div>
            </div>

            {/* 검색 입력 */}
            <div className="mb-3">
              <SearchInput
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="관광지 이름이나 주소로 검색..."
              />
            </div>

            {/* 구별 필터 */}
            <div className="mb-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">구별</span>
                <span className="text-xs text-gray-500">({filteredSpots.length}개)</span>
                {searchTerm && (
                    <span className="text-xs text-blue-500">
                    "{searchTerm}" 검색 결과
                  </span>
                )}
              </div>
              <DistrictFilterTabs
                  filter={districtFilter}
                  setFilter={setDistrictFilter}
                  spotCounts={spotCounts}
              />
            </div>

            {/* 카테고리 필터 */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">카테고리</span>
              </div>
              <FilterTabs
                  filter={categoryFilter}
                  setFilter={setCategoryFilter}
                  categoryCounts={categoryCounts}
              />
            </div>
          </div>
        </div>

        {viewMode === 'map' ? (
            <MapView spots={filteredSpots} />
        ) : (
            <div className="min-h-screen bg-gray-50">
              {sessionStorage.getItem("testMode") === "true" ? (
                  <SpotList
                      spots={TEST_TOURIST_SPOTS}
                      onCheckInComplete={handleCheckInComplete}
                  />
              ) : (
                  <SpotList
                      spots={filteredSpots}
                      onCheckInComplete={handleCheckInComplete}
                      key={filterKey}
                  />
              )}
            </div>
        )}
      </div>
  );
};

export default Map;