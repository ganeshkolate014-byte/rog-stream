import { useQuery, useInfiniteQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "../types";

// Default Configuration
export const DEFAULT_CONFIG = {
  baseUrl: "https://newanimebackend.vercel.app",
  endpoints: {
    home: "https://backendweb-bifc.onrender.com/api/v1/home", // Specific URL for Home
    search: "/anime/hianime/{keyword}", // New search structure
    details: "/anime/hianime/info?id={id}", 
    episodes: "/anime/episodes/{id}", 
    schedule: "/anime/schedule",
    stream: "/anime/episode-srcs",
    suggestion: "/anime/search/suggestion"
  }
};

export const getConfig = () => {
  try {
    const stored = localStorage.getItem("api_config");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        endpoints: { ...DEFAULT_CONFIG.endpoints, ...parsed.endpoints }
      };
    }
  } catch (e) {
    console.error("Failed to parse config", e);
  }
  return DEFAULT_CONFIG;
};

export const getApiBaseUrl = () => getConfig().baseUrl;

// Helper to construct URLs dynamically
export const constructUrl = (key: keyof typeof DEFAULT_CONFIG.endpoints, params: Record<string, any> = {}) => {
  const config = getConfig();
  let path = config.endpoints[key] || DEFAULT_CONFIG.endpoints[key];

  // Handle Search Query specifically ({q} or {keyword} placeholder)
  if (key === 'search' || key === 'suggestion') {
    const query = params.q || params.keyword || '';
    if (path.includes('{q}')) {
      path = path.replace('{q}', encodeURIComponent(query));
    } else if (path.includes('{keyword}')) {
      path = path.replace('{keyword}', encodeURIComponent(query));
    } else {
      // Default: append as query param
      const separator = path.includes('?') ? '&' : '?';
      path = `${path}${separator}keyword=${encodeURIComponent(query)}`;
    }
  }
  
  // Handle ID placeholder if present, otherwise append
  if (params.id) {
    if (path.includes('{id}')) {
      path = path.replace('{id}', params.id);
    } else {
      // If path already has query params (like info?id=...), don't just append /id
      if (path.includes('?')) {
          // Check if it ends with = (incomplete param)
          if(path.endsWith('=')) {
              path = `${path}${params.id}`;
          } 
      } else {
          path = `${path}/${params.id}`;
      }
    }
  }

  // Handle Page
  if (params.page) {
    const separator = path.includes('?') ? '&' : '?';
    path = `${path}${separator}page=${params.page}`;
  }

  return path;
};

export const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
  // Support absolute URLs (overriding baseUrl)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const { data } = await axios.get<ApiResponse<T>>(url);
      return data;
    } catch (error) {
       if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || error.message);
       }
       throw new Error(String(error));
    }
  }

  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  const endpoint = url.startsWith('/') ? url : `/${url}`;
  
  try {
    const { data } = await axios.get<ApiResponse<T>>(`${baseUrl}${endpoint}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error(String(error));
  }
};

export const useApi = <T>(
  endpointOrKey: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>, Error, T, string[]>, 'queryKey' | 'queryFn' | 'select'>
) => {
  const config = getConfig();
  
  const finalEndpoint = endpointOrKey; 

  return useQuery({
    queryKey: [config.baseUrl, finalEndpoint],
    queryFn: () => fetchData<T>(finalEndpoint),
    select: (response: any) => response?.data || response, 
    retry: 1,
    enabled: !!finalEndpoint,
    refetchOnWindowFocus: false,
    ...options
  });
};