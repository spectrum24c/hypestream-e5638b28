
import React from 'react';
import { Film, Tv } from 'lucide-react';

const categoryItems = [
  {
    icon: <Film />,
    name: 'Browse Movies',
    color: 'bg-hype-purple',
    description: 'Explore our collection'
  },
  {
    icon: <Tv />,
    name: 'Browse TV Shows',
    color: 'bg-hype-teal',
    description: 'Find your next binge'
  }
];

const CategorySection = () => {
  return (
    <div className="py-8 px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoryItems.map((item, index) => (
          <div 
            key={index}
            className="relative rounded-xl overflow-hidden group cursor-pointer h-40 bg-hype-gray/50 hover:bg-hype-gray transition-all duration-300"
          >
            <div className={`absolute top-4 left-4 ${item.color} p-3 rounded-full text-white transition-transform group-hover:scale-110 duration-300`}>
              {item.icon}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
