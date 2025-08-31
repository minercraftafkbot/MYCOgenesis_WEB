"use client";

import { useEffect, useState } from 'react';
import { sanityClient } from '../lib/sanity'; // Import from the lib directory
interface SanityData<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Simple in-memory cache (for basic caching)
const cache = new Map<string, any>();

/**
 * Custom React hook to fetch data from Sanity using a GROQ query.
 * Implements basic in-memory caching.
 *
 * @param query - The GROQ query string.
 * @param params - Optional parameters for the query.
 * @returns An object containing data, loading state, and error.
 */
function useSanityData<T>(query: string, params: { [key: string]: any } = {}): SanityData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a cache key based on the query and parameters
  const cacheKey = `${query}-${JSON.stringify(params)}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cache.has(cacheKey)) {
        setData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      try {
        const result = await sanityClient.fetch<T>(query, params);
        setData(result);
        cache.set(cacheKey, result); // Store in cache
      } catch (err: any) {
        console.error('Error fetching data from Sanity:', err);
        setError(err);
        setData(null); // Ensure data is null on error
        // Optionally, show a user-friendly error message using a UI state manager hook
      } finally {
        setLoading(false);
      }
    };

    if (!query) {
        // Handle cases where query is not provided yet
        setLoading(false);
        setError(new Error("Sanity query is required."));
        setData(null);
        return;
    }


    fetchData();

    // No cleanup needed for this simple fetch hook

  }, [query, JSON.stringify(params)]); // Re-run effect if query or params change

  return { data, loading, error };
}

export default useSanityData;