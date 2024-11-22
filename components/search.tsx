'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import debounce from 'lodash.debounce';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SearchResults as SearchResultsComponent } from './searchResults';
import { SearchResults } from '@/types/search';
import { SEARCH_CONSTANTS } from '@/lib/constant';


export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResults>({
    movies: [],
    tvSeries: [],
    episodes: []
  });
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string, type: string) => {
        if (searchQuery.length < SEARCH_CONSTANTS.MIN_SEARCH_LENGTH) {
          setResults({ movies: [], tvSeries: [], episodes: [] });
          return;
        }

        try {
          setLoading(true);
          const response = await fetch(
            `/api/search?query=${encodeURIComponent(searchQuery)}&type=${type}`,
            {
              headers: {
                'Cache-Control': `max-age=${SEARCH_CONSTANTS.CACHE_TIME}`,
              }
            }
          );
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      }, SEARCH_CONSTANTS.DEBOUNCE_TIME),
    []
  );

  useEffect(() => {
    if (query.length >= SEARCH_CONSTANTS.MIN_SEARCH_LENGTH) {
      debouncedSearch(query, activeTab);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, activeTab, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length < SEARCH_CONSTANTS.MIN_SEARCH_LENGTH) {
      setResults({ movies: [], tvSeries: [], episodes: [] });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          className="w-full pl-12 pr-4 py-3 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
          placeholder="Search movies, TV series, or episodes..."
          value={query}
          onChange={handleSearch}
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="movie">Movies</TabsTrigger>
          <TabsTrigger value="tvSeries">TV Series</TabsTrigger>
          <TabsTrigger value="episode">Episodes</TabsTrigger>
        </TabsList>

        <SearchResultsComponent
          results={results}
          activeTab={activeTab}
          query={query}
          loading={loading}
        />
      </Tabs>
    </div>
  );
}