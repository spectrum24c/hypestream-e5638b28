
export interface Subcategory {
  name: string;
  id: string | number;
}

export interface Category {
  name: string;
  id: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  { name: 'Movies', id: 'movie', subcategories: [
    { name: 'Action', id: 28 },
    { name: 'Comedy', id: 35 },
    { name: 'Drama', id: 18 },
    { name: 'Horror', id: 27 }
  ]},
  { name: 'TV Shows', id: 'tv', subcategories: [
    { name: 'Drama', id: 18 },
    { name: 'Comedy', id: 35 },
    { name: 'Crime', id: 80 },
    { name: 'Fantasy', id: 14 }
  ]},
  { name: 'Anime', id: 'anime', subcategories: [
    { name: 'Shonen', id: 'shonen' },
    { name: 'Seinen', id: 'seinen' },
    { name: 'Romance', id: 'romance' },
    { name: 'Fantasy', id: 'fantasy' }
  ]},
  { name: 'New', id: 'new', subcategories: [] },
];
