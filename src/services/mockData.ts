
// Mock data service for generating content items

export interface ContentItem {
  id: string;
  title: string;
  image: string;
  rating: string;
  year: string;
  type: string;
}

// Helper function to generate random ratings
const generateRating = () => {
  return (Math.floor(Math.random() * 20) / 10 + 7).toFixed(1);
};

// Sample image URLs (in a real app, these would be actual content images)
const sampleImages = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300',
  'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=300',
  'https://images.unsplash.com/photo-1613679074971-91fc27180061?q=80&w=300',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300',
  'https://images.unsplash.com/photo-1626814026160-2237a095c0e0?q=80&w=300',
  'https://images.unsplash.com/photo-1626652079190-19543926d322?q=80&w=300',
  'https://images.unsplash.com/photo-1575908539614-ff89490f4a78?q=80&w=300',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300'
];

// Sample movie titles
const animeItems = [
  "Attack on Titan",
  "Demon Slayer",
  "One Piece",
  "My Hero Academia",
  "Jujutsu Kaisen",
  "Naruto Shippuden",
  "Fullmetal Alchemist",
  "Death Note"
];

const movieItems = [
  "The Avengers",
  "Inception",
  "The Dark Knight",
  "Pulp Fiction",
  "Interstellar",
  "The Matrix",
  "Jurassic Park",
  "The Shawshank Redemption"
];

const tvItems = [
  "Breaking Bad",
  "Game of Thrones",
  "Stranger Things",
  "The Witcher",
  "The Mandalorian",
  "Peaky Blinders",
  "Money Heist",
  "Squid Game"
];

// Generate mock content items
export const generateContentItems = (category: 'anime' | 'movies' | 'tv', count: number = 8): ContentItem[] => {
  let titles: string[] = [];
  let type: string = '';
  
  switch (category) {
    case 'anime':
      titles = animeItems;
      type = 'Anime';
      break;
    case 'movies':
      titles = movieItems;
      type = 'Movie';
      break;
    case 'tv':
      titles = tvItems;
      type = 'TV Show';
      break;
  }
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}-${i}`,
    title: titles[i % titles.length],
    image: sampleImages[i % sampleImages.length],
    rating: generateRating(),
    year: `${2018 + (i % 5)}`,
    type
  }));
};

// Export mock data sets
export const trendingContent = generateContentItems('movies', 8);
export const newReleases = generateContentItems('movies', 8);
export const popularAnime = generateContentItems('anime', 8);
export const topRatedShows = generateContentItems('tv', 8);
