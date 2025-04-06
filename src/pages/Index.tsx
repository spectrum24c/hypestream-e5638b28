
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ContentSlider from '@/components/ContentSlider';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import { trendingContent, newReleases, popularAnime, topRatedShows } from '@/services/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-hype-dark text-foreground">
      <Navbar />
      <main className="pb-8">
        <HeroSection />
        
        <div className="container mx-auto">
          <CategorySection />
          
          <ContentSlider title="Trending Now" items={trendingContent} />
          <ContentSlider title="New Releases" items={newReleases} />
          <ContentSlider title="Popular Anime" items={popularAnime} />
          <ContentSlider title="Top Rated Shows" items={topRatedShows} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
