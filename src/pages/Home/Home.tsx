import React from 'react';
import { useApp } from '../../contexts/AppContext';
import StampTourBanner from './components/StampTourBanner';
import RecommendedCourses from './components/RecommendedCourses';
import WeatherWhale from './components/WeatherWhale';
import FestivalList from './components/FestivalList';

const Home: React.FC = () => {
    const { state } = useApp();

  return (
    <div className="max-w-md mx-auto px-4 space-y-6 animate-slideUp">
        <WeatherWhale />
      <StampTourBanner />
      <RecommendedCourses />
      <FestivalList />
    </div>
  );
};

export default Home;