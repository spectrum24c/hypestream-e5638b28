import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchPersonData, getOptimizedImagePath, PersonDetails as PersonDetailsType, CastMember, CrewMember } from '@/services/tmdbApi';
import { Movie } from '@/types/movie';
import Navbar from '@/components/Navbar';

const PersonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [personData, setPersonData] = useState<{
    details: PersonDetailsType | null;
    movieCredits: { cast: any[]; crew: any[] };
    tvCredits: { cast: any[]; crew: any[] };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPersonData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchPersonData(id);
        setPersonData(data);
      } catch (error) {
        console.error('Error loading person data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPersonData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="flex gap-6">
              <div className="w-64 h-96 bg-muted rounded"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!personData?.details) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Person not found</h2>
            <p className="text-muted-foreground mb-4">The person you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { details, movieCredits, tvCredits } = personData;
  
  // Combine and sort all credits by popularity/vote average
  const allMovieCredits = [
    ...movieCredits.cast.map((item: any) => ({ ...item, credit_type: 'cast', media_type: 'movie' })),
    ...movieCredits.crew.map((item: any) => ({ ...item, credit_type: 'crew', media_type: 'movie' }))
  ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  const allTVCredits = [
    ...tvCredits.cast.map((item: any) => ({ ...item, credit_type: 'cast', media_type: 'tv' })),
    ...tvCredits.crew.map((item: any) => ({ ...item, credit_type: 'crew', media_type: 'tv' }))
  ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Person Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[2/3] max-w-sm mx-auto relative overflow-hidden rounded-lg">
                {details.profile_path ? (
                  <img
                    src={getOptimizedImagePath(details.profile_path, 'large') || ''}
                    alt={details.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Info</h3>
                  <div className="space-y-3 text-sm">
                    {details.known_for_department && (
                      <div>
                        <span className="font-medium block">Known For</span>
                        <span className="text-muted-foreground">{details.known_for_department}</span>
                      </div>
                    )}
                    
                    {details.birthday && (
                      <div>
                        <span className="font-medium block">Born</span>
                        <span className="text-muted-foreground">
                          {formatDate(details.birthday)}
                          {calculateAge(details.birthday, details.deathday) && (
                            <span> ({calculateAge(details.birthday, details.deathday)} years old)</span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {details.deathday && (
                      <div>
                        <span className="font-medium block">Died</span>
                        <span className="text-muted-foreground">{formatDate(details.deathday)}</span>
                      </div>
                    )}
                    
                    {details.place_of_birth && (
                      <div>
                        <span className="font-medium block">Place of Birth</span>
                        <span className="text-muted-foreground">{details.place_of_birth}</span>
                      </div>
                    )}
                    
                    {details.also_known_as && details.also_known_as.length > 0 && (
                      <div>
                        <span className="font-medium block">Also Known As</span>
                        <div className="text-muted-foreground">
                          {details.also_known_as.slice(0, 3).map((name, index) => (
                            <div key={index}>{name}</div>
                          ))}
                          {details.also_known_as.length > 3 && (
                            <div className="text-xs">+{details.also_known_as.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{details.name}</h1>
            </div>

            {details.biography && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Biography</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {details.biography.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-3">{paragraph}</p>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Credits */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Known For</h2>
              <Tabs defaultValue="movies" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="movies">Movies ({allMovieCredits.length})</TabsTrigger>
                  <TabsTrigger value="tv">TV Shows ({allTVCredits.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="movies" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allMovieCredits.slice(0, 20).map((credit: any, index) => (
                      <Card key={`movie-${credit.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[2/3] relative overflow-hidden">
                          {credit.poster_path ? (
                            <img
                              src={getOptimizedImagePath(credit.poster_path, 'medium') || ''}
                              alt={credit.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Star className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          {credit.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              ★ {credit.vote_average.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm truncate">{credit.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {credit.credit_type === 'cast' ? credit.character : credit.job}
                          </p>
                          {credit.release_date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(credit.release_date).getFullYear()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tv" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allTVCredits.slice(0, 20).map((credit: any, index) => (
                      <Card key={`tv-${credit.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[2/3] relative overflow-hidden">
                          {credit.poster_path ? (
                            <img
                              src={getOptimizedImagePath(credit.poster_path, 'medium') || ''}
                              alt={credit.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Star className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          {credit.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              ★ {credit.vote_average.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm truncate">{credit.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {credit.credit_type === 'cast' ? credit.character : credit.job}
                          </p>
                          {credit.first_air_date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(credit.first_air_date).getFullYear()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;