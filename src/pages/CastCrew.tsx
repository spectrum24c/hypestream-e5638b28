import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Star, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchCredits, fetchPersonData, getOptimizedImagePath, PersonDetails, CastMember, CrewMember } from '@/services/tmdbApi';
import { Movie } from '@/types/movie';
import Navbar from '@/components/Navbar';

const CastCrew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');
  const mediaType = searchParams.get('type') as 'movie' | 'tv' || 'movie';
  const movieTitle = searchParams.get('title') || 'Unknown';

  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredits = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        const { cast: castData, crew: crewData } = await fetchCredits(movieId, mediaType);
        setCast(castData);
        setCrew(crewData);
      } catch (error) {
        console.error('Error loading credits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
  }, [movieId, mediaType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-32 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group crew by department
  const groupedCrew = crew.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, CrewMember[]>);

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
          <div>
            <h1 className="text-2xl font-bold">Cast & Crew</h1>
            <p className="text-muted-foreground">{movieTitle}</p>
          </div>
        </div>

        <Tabs defaultValue="cast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="cast">Cast ({cast.length})</TabsTrigger>
            <TabsTrigger value="crew">Crew ({crew.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="cast" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cast.map((member) => (
                <Link
                  key={member.id}
                  to={`/person/${member.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {member.profile_path ? (
                        <img
                          src={getOptimizedImagePath(member.profile_path, 'medium') || ''}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{member.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crew" className="mt-6">
            <div className="space-y-6">
              {Object.entries(groupedCrew).map(([department, members]) => (
                <div key={department}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">{department}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {members.map((member) => (
                      <Link
                        key={`${member.id}-${member.job}`}
                        to={`/person/${member.id}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-[2/3] relative overflow-hidden">
                            {member.profile_path ? (
                              <img
                                src={getOptimizedImagePath(member.profile_path, 'medium') || ''}
                                alt={member.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <User className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm truncate">{member.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{member.job}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CastCrew;