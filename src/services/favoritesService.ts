import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type FavoriteInsert = Database['public']['Tables']['favorites']['Insert'];

export class FavoritesAuthError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.');
    this.name = 'FavoritesAuthError';
  }
}

const getAuthenticatedUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new FavoritesAuthError();
  }

  return data.user;
};

export const isFavorite = async (movieId: string) => {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
};

export const addFavorite = async (
  favorite: Omit<FavoriteInsert, 'user_id'>,
) => {
  // getUser validates the access token with Supabase Auth. The ownership value
  // is always derived from that validated token and never from caller input.
  const user = await getAuthenticatedUser();

  const { data: existing, error: lookupError } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', favorite.movie_id)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return { favorite: existing, alreadyExisted: true };

  const { data, error } = await supabase
    .from('favorites')
    .insert({ ...favorite, user_id: user.id })
    .select('id, user_id')
    .single();

  if (error) throw error;
  if (data.user_id !== user.id) {
    throw new Error('Favorite ownership could not be verified.');
  }

  return { favorite: data, alreadyExisted: false };
};