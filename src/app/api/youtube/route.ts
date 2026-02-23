import { NextResponse } from 'next/server';
import { YouTubeVideo } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Parse ISO 8601 duration to readable format
function parseDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function POST(request: Request) {
  try {
    const { query, maxResults = 5 }: { query: string; maxResults?: number } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // If no API key, return empty array (graceful degradation)
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return NextResponse.json({ videos: [] });
    }

    // Search for repair tutorial videos
    const searchQuery = `${query} repair tutorial how to fix`;
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('maxResults', maxResults.toString());
    searchUrl.searchParams.set('relevanceLanguage', 'en');
    searchUrl.searchParams.set('safeSearch', 'moderate');
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      console.error('YouTube search API error:', error);
      return NextResponse.json({ videos: [] });
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // Get video IDs for detail fetch
    const videoIds = searchData.items
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) {
      return NextResponse.json({ videos: [] });
    }

    // Fetch video details (duration, view count)
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.set('part', 'contentDetails,statistics');
    detailsUrl.searchParams.set('id', videoIds);
    detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);

    const detailsResponse = await fetch(detailsUrl.toString());

    if (!detailsResponse.ok) {
      console.error('YouTube details API error');
      // Return basic info without details
      const basicVideos: YouTubeVideo[] = searchData.items.map((item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          thumbnails: { medium: { url: string } };
          publishedAt: string;
        };
      }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || '',
        viewCount: 0,
        duration: '0:00',
        publishedAt: new Date(item.snippet.publishedAt),
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
      return NextResponse.json({ videos: basicVideos });
    }

    const detailsData = await detailsResponse.json();

    // Create a map of video details by ID
    const detailsMap = new Map<string, {
      duration: string;
      viewCount: string;
    }>();

    if (detailsData.items) {
      for (const detail of detailsData.items) {
        detailsMap.set(detail.id, {
          duration: detail.contentDetails?.duration || 'PT0S',
          viewCount: detail.statistics?.viewCount || '0',
        });
      }
    }

    // Combine search results with details
    const videos: YouTubeVideo[] = searchData.items.map((item: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: { medium: { url: string } };
        publishedAt: string;
      };
    }) => {
      const details = detailsMap.get(item.id.videoId);
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || '',
        viewCount: parseInt(details?.viewCount || '0'),
        duration: parseDuration(details?.duration || 'PT0S'),
        publishedAt: new Date(item.snippet.publishedAt),
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      };
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ videos: [] });
  }
}
