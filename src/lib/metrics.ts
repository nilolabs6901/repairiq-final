// Server-side in-memory metrics
// In production, replace with database writes

const metrics = {
  apiCalls: {
    chat: 0,
    recalls: 0,
    subscribe: 0,
    saveDiagnosis: 0,
    leads: 0,
    youtube: 0,
  } as Record<string, number>,
  recentSearches: [] as Array<{
    query: string;
    timestamp: string;
  }>,
};

export function trackApiCall(endpoint: string) {
  metrics.apiCalls[endpoint] = (metrics.apiCalls[endpoint] || 0) + 1;
}

export function trackSearch(query: string) {
  metrics.recentSearches.unshift({
    query,
    timestamp: new Date().toISOString(),
  });
  if (metrics.recentSearches.length > 100) {
    metrics.recentSearches = metrics.recentSearches.slice(0, 100);
  }
}

export function getMetrics() {
  return {
    apiCalls: { ...metrics.apiCalls },
    recentSearches: metrics.recentSearches.slice(0, 20),
  };
}
