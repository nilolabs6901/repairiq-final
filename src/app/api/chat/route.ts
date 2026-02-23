import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Message, DiagnosticStage, DiagnosisResult, YouTubeVideo } from '@/types';
import { buildPrompt, extractDiagnosis, getStageFromMessageCount, VOICE_SYSTEM_PROMPT } from '@/lib/prompts';
import { v4 as uuidv4 } from 'uuid';

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

// Helper to fetch YouTube videos directly (no internal HTTP call)
async function fetchYouTubeVideos(itemDescription: string, issueTitle?: string): Promise<YouTubeVideo[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return [];
    }

    const query = issueTitle ? `${itemDescription} ${issueTitle}` : itemDescription;
    const searchQuery = `${query} repair tutorial how to fix`;
    const maxResults = 3;

    // Search for repair tutorial videos
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
      return [];
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video IDs for detail fetch
    const videoIds = searchData.items
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) {
      return [];
    }

    // Fetch video details (duration, view count)
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.set('part', 'contentDetails,statistics');
    detailsUrl.searchParams.set('id', videoIds);
    detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);

    const detailsResponse = await fetch(detailsUrl.toString());

    // Create a map of video details by ID
    const detailsMap = new Map<string, {
      duration: string;
      viewCount: string;
    }>();

    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      if (detailsData.items) {
        for (const detail of detailsData.items) {
          detailsMap.set(detail.id, {
            duration: detail.contentDetails?.duration || 'PT0S',
            viewCount: detail.statistics?.viewCount || '0',
          });
        }
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

    return videos;
  } catch (error) {
    console.warn('Error fetching YouTube videos:', error);
    return [];
  }
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Helper to parse base64 image data URLs
function parseImageDataUrl(dataUrl: string): { mediaType: string; data: string } | null {
  const matches = dataUrl.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
  if (!matches) return null;
  return {
    mediaType: matches[1],
    data: matches[2],
  };
}

// Build Claude message content with vision support
function buildMessageContent(message: Message): string | Anthropic.MessageParam['content'] {
  // If no images, return simple string content
  if (!message.images || message.images.length === 0) {
    return message.content;
  }

  // Build content array with images and text
  const contentBlocks: (Anthropic.ImageBlockParam | Anthropic.TextBlockParam)[] = [];

  // Add images first
  for (const imageData of message.images) {
    const parsed = parseImageDataUrl(imageData);
    if (parsed) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: parsed.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: parsed.data,
        },
      });
    }
  }

  // Add text content if present
  if (message.content) {
    contentBlocks.push({
      type: 'text',
      text: message.content,
    });
  }

  return contentBlocks;
}

export async function POST(request: Request) {
  try {
    const { messages, sessionId, voiceMode }: { messages: Message[]; sessionId: string; voiceMode?: boolean } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Calculate current stage
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const stage = getStageFromMessageCount(userMessageCount);

    // Build conversation for Claude - use voice prompt for voice mode
    const systemPrompt = voiceMode ? VOICE_SYSTEM_PROMPT : buildPrompt(messages, stage);

    // Build messages with vision support for images
    const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.role === 'user' ? buildMessageContent(m) : m.content,
    }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: claudeMessages,
    });

    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Check for diagnosis JSON
    const { cleanContent, diagnosis } = extractDiagnosis(textContent.text);

    // Build result if diagnosis found
    let result: DiagnosisResult | null = null;
    if (diagnosis) {
      const diagData = diagnosis as Record<string, unknown>;
      const confidenceFactorsData = diagData.confidenceFactors as Record<string, number> | undefined;

      result = {
        id: uuidv4(),
        itemType: diagData.itemType as string || 'Unknown',
        itemDescription: diagData.itemDescription as string || 'Item',
        createdAt: new Date(),
        overallConfidence: diagData.overallConfidence as number || 70,
        confidenceFactors: {
          informationQuality: confidenceFactorsData?.informationQuality ?? 70,
          symptomClarity: confidenceFactorsData?.symptomClarity ?? 70,
          patternMatch: confidenceFactorsData?.patternMatch ?? 70,
        },
        likelyIssues: ((diagData.likelyIssues as Array<Record<string, unknown>>) || []).map((issue) => ({
          id: uuidv4(),
          title: issue.title as string,
          probability: issue.probability as number,
          description: issue.description as string,
          difficulty: issue.difficulty as 'easy' | 'medium' | 'hard' | 'professional',
          confidenceScore: issue.confidenceScore as number || 70,
          confidenceReason: issue.confidenceReason as string | undefined,
        })),
        troubleshootingSteps: ((diagData.troubleshootingSteps as Array<Record<string, unknown>>) || []).map((step) => ({
          id: uuidv4(),
          stepNumber: step.stepNumber as number,
          title: step.title as string,
          description: step.description as string,
          estimatedTime: step.estimatedTime as string,
          difficulty: step.difficulty as 'easy' | 'medium' | 'hard' | 'professional',
          tips: step.tips as string[] | undefined,
          warnings: step.warnings as string[] | undefined,
        })),
        partsNeeded: ((diagData.partsNeeded as Array<Record<string, unknown>>) || []).map((part) => ({
          id: uuidv4(),
          name: part.name as string,
          partNumber: part.partNumber as string | undefined,
          estimatedCost: part.estimatedCost as string,
          where_to_buy: part.where_to_buy as string,
          required: part.required as boolean,
        })),
        shouldCallProfessional: diagData.shouldCallProfessional as boolean || false,
        professionalReason: diagData.professionalReason as string | undefined,
        estimatedTotalCost: diagData.estimatedTotalCost as string || '$0 - $50',
        estimatedTotalTime: diagData.estimatedTotalTime as string || '15-30 minutes',
        summary: diagData.summary as string || '',
      };

      // Fetch YouTube videos for the diagnosis
      const youtubeVideos = await fetchYouTubeVideos(
        result.itemDescription,
        result.likelyIssues[0]?.title
      );
      if (youtubeVideos.length > 0) {
        result.youtubeVideos = youtubeVideos;
      }
    }

    // Determine new stage
    const newStage: DiagnosticStage = result ? 'complete' : stage;

    return NextResponse.json({
      message: {
        id: uuidv4(),
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
      },
      stage: newStage,
      result,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}
