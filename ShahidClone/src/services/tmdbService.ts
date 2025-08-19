// TMDB API service for fetching movie and TV show data
const TMDB_API_KEY = 'your-tmdb-api-key'; // Replace with your actual API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w780';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_name: string;
  origin_country: string[];
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private async fetchFromAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get trending movies
  async getTrendingMovies(): Promise<Movie[]> {
    try {
      const data = await this.fetchFromAPI<TMDBResponse<Movie>>('/trending/movie/day');
      return data.results;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return [];
    }
  }

  // Get trending TV shows
  async getTrendingTVShows(): Promise<TVShow[]> {
    try {
      const data = await this.fetchFromAPI<TMDBResponse<TVShow>>('/trending/tv/day');
      return data.results;
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
      return [];
    }
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromAPI<TMDBResponse<Movie>>('/movie/popular', {
        page: page.toString(),
      });
      return data.results;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  }

  // Get popular TV shows
  async getPopularTVShows(page: number = 1): Promise<TVShow[]> {
    try {
      const data = await this.fetchFromAPI<TMDBResponse<TVShow>>('/tv/popular', {
        page: page.toString(),
      });
      return data.results;
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      return [];
    }
  }

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<Movie[]> {
    try {
      const data = await this.fetchFromAPI<TMDBResponse<Movie>>('/movie/top_rated', {
        page: page.toString(),
      });
      return data.results;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      return [];
    }
  }

  // Get top rated TV shows
  async getTopRatedTVShows(page: number = 1): Promise<TVShow[]> {
    try {
      const data = await this.fetchFromAPI<TMDBResponse<TVShow>>('/tv/top_rated', {
        page: page.toString(),
      });
      return data.results;
    } catch (error) {
      console.error('Error fetching top rated TV shows:', error);
      return [];
    }
  }
}

export const tmdbService = new TMDBService();