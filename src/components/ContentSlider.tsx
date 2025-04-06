
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';

// Content item type
interface ContentItem {
  id: string;
  title: string;
  image: string;
  rating: string;
  year: string;
  type: string;
}

interface ContentSliderProps {
  title: string;
  items: ContentItem[];
}

const ContentSlider: React.FC<ContentSliderProps> = ({ title, items }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const { current } = sliderRef;
    const scrollAmount = current.clientWidth * 0.75;
    
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    // Check if we need to show the left arrow after scrolling
    setTimeout(() => {
      if (current.scrollLeft > 20) {
        setShowLeftArrow(true);
      } else {
        setShowLeftArrow(false);
      }
    }, 400);
  };

  return (
    <div className="py-6 px-4 md:px-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <a href="#" className="text-sm text-hype-purple hover:text-hype-purple/80">
          View All
        </a>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Slider */}
        <div
          ref={sliderRef}
          className="carousel-container flex space-x-4 overflow-x-auto"
          onScroll={() => {
            if (sliderRef.current && sliderRef.current.scrollLeft > 20) {
              setShowLeftArrow(true);
            } else {
              setShowLeftArrow(false);
            }
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="content-card min-w-[180px] md:min-w-[200px]">
              <img
                src={item.image}
                alt={item.title}
                className="content-card-img"
              />
              <div className="content-card-overlay"></div>
              <div className="content-card-info">
                <div className="flex items-center mb-1">
                  <Star className="h-3 w-3 text-hype-orange mr-1" fill="currentColor" />
                  <span className="text-xs text-white">{item.rating}</span>
                </div>
                <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2 text-xs text-gray-300">
                    <span>{item.year}</span>
                    <span>{item.type}</span>
                  </div>
                  <button className="play-button h-7 w-7">
                    <Play className="h-3 w-3" fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ContentSlider;
