import React from 'react';
import Navbar from '@/components/Navbar';
import AdvancedSearchPage from '@/components/AdvancedSearchPage';

const AdvancedSearch: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <AdvancedSearchPage />
      </div>
    </div>
  );
};

export default AdvancedSearch;