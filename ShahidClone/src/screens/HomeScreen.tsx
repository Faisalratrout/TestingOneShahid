import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { tmdbService, Movie, TVShow } from '../services/tmdbService';
import HeroBanner from '../components/HeroBanner';
import CarouselList from '../components/CarouselList';
import { colors, spacing } from '../utils/theme';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [
        trendingMoviesData,
        trendingTVData,
        popularMoviesData,
        popularTVData,
        topRatedMoviesData,
      ] = await Promise.all([
        tmdbService.getTrendingMovies(),
        tmdbService.getTrendingTVShows(),
        tmdbService.getPopularMovies(),
        tmdbService.getPopularTVShows(),
        tmdbService.getTopRatedMovies(),
      ]);

      setTrendingMovies(trendingMoviesData);
      setTrendingTVShows(trendingTVData);
      setPopularMovies(popularMoviesData);
      setPopularTVShows(popularTVData);
      setTopRatedMovies(topRatedMoviesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading amazing content...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Banner with first trending movie */}
        {trendingMovies.length > 0 && (
          <HeroBanner movie={trendingMovies[0]} />
        )}

        <View style={styles.content}>
          {/* Top 10 Movies Carousel */}
          {trendingMovies.length > 0 && (
            <CarouselList
              title="Top 10 Movies"
              data={trendingMovies.slice(0, 10)}
              type="movie"
            />
          )}

          {/* Top 10 TV Shows Carousel */}
          {trendingTVShows.length > 0 && (
            <CarouselList
              title="Top 10 TV Shows"
              data={trendingTVShows.slice(0, 10)}
              type="tv"
            />
          )}

          {/* Popular Movies */}
          {popularMovies.length > 0 && (
            <CarouselList
              title="Popular Movies"
              data={popularMovies}
              type="movie"
            />
          )}

          {/* Popular TV Shows */}
          {popularTVShows.length > 0 && (
            <CarouselList
              title="Popular TV Shows"
              data={popularTVShows}
              type="tv"
            />
          )}

          {/* Top Rated Movies */}
          {topRatedMovies.length > 0 && (
            <CarouselList
              title="Top Rated Movies"
              data={topRatedMovies}
              type="movie"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  content: {
    paddingBottom: spacing.xl,
  },
});

export default HomeScreen;