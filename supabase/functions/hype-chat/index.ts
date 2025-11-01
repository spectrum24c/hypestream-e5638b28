import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = "62c59007d93c96aa3cca9f3422d51af5";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface Message {
  role: string;
  content: string;
}

// Helper function to search movies/TV shows via TMDB
async function searchContent(query: string, type: 'movie' | 'tv' | 'all' = 'all') {
  try {
    const endpoint = type === 'all' 
      ? `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      : `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return data.results?.slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      type: item.media_type || type,
      year: (item.release_date || item.first_air_date)?.substring(0, 4),
      rating: item.vote_average?.toFixed(1),
      overview: item.overview
    })) || [];
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

// Helper function to get similar content
async function getSimilarContent(movieId: string, mediaType: 'movie' | 'tv') {
  try {
    const endpoint = `${TMDB_BASE_URL}/${mediaType}/${movieId}/similar?api_key=${TMDB_API_KEY}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return data.results?.slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      type: mediaType,
      year: (item.release_date || item.first_air_date)?.substring(0, 4),
      rating: item.vote_average?.toFixed(1),
      overview: item.overview
    })) || [];
  } catch (error) {
    console.error('TMDB similar content error:', error);
    return [];
  }
}

// Helper function to get trending content
async function getTrendingContent() {
  try {
    const endpoint = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return data.results?.slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      type: item.media_type,
      year: (item.release_date || item.first_air_date)?.substring(0, 4),
      rating: item.vote_average?.toFixed(1),
      overview: item.overview
    })) || [];
  } catch (error) {
    console.error('TMDB trending error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    console.log('Received message:', message);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build messages array
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are HYPE, an enthusiastic AI movie and TV show assistant. Your personality:
- Energetic and passionate about entertainment 🎬
- Knowledgeable about movies, TV shows, actors, and genres
- NEVER reveal spoilers unless explicitly requested with "spoilers please" or similar
- When discussing plots, stay vague about key twists and endings
- Provide personalized recommendations based on user preferences
- Use emojis occasionally to add personality ✨ 🍿

Your capabilities:
1. Recommend movies/TV shows based on mood, genre, or similar titles
2. Search for specific content by title, actor, or description
3. Explain plots WITHOUT spoilers (general premise only)
4. Answer questions about cast, release dates, ratings
5. Help users discover hidden gems

When recommending content:
- Ask clarifying questions about preferences when needed
- Suggest 3-5 options with brief descriptions
- Explain WHY you recommend each title
- Include variety (different genres/years when appropriate)
- Format movie suggestions like this: **Movie Title** (Year) - Brief description

Keep responses conversational, friendly, and concise. Never use more than 3-4 sentences unless providing multiple recommendations.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Check if we need to call TMDB API based on message content
    let toolResults = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('what\'s hot')) {
      const trending = await getTrendingContent();
      toolResults = `\n\nCurrent trending content:\n${JSON.stringify(trending, null, 2)}`;
    } else if (lowerMessage.includes('similar to') || lowerMessage.includes('like ')) {
      // Extract movie name and search for it, then get similar
      const searchMatch = lowerMessage.match(/(?:similar to|like)\s+(.+?)(?:\?|$)/i);
      if (searchMatch) {
        const query = searchMatch[1].trim();
        const results = await searchContent(query, 'all');
        if (results.length > 0) {
          const similar = await getSimilarContent(results[0].id, results[0].type);
          toolResults = `\n\nMovies/shows similar to "${results[0].title}":\n${JSON.stringify(similar, null, 2)}`;
        }
      }
    } else if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('recommend')) {
      // Try to extract what they're searching for
      const keywords = lowerMessage.replace(/(?:search|find|recommend|show me|tell me about)/gi, '').trim();
      if (keywords && keywords.length > 2) {
        const results = await searchContent(keywords, 'all');
        if (results.length > 0) {
          toolResults = `\n\nSearch results for "${keywords}":\n${JSON.stringify(results, null, 2)}`;
        }
      }
    }

    // Add tool results to the last message if we have them
    if (toolResults) {
      messages[messages.length - 1].content += toolResults;
    }

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment! 🎬' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'HYPE needs a power-up! Please contact support.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in hype-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
