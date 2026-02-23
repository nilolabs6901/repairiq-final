'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { DiagnosisResult } from '@/types';
import {
  X,
  Youtube,
  Play,
  ExternalLink,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Clock,
  Eye,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';

interface RepairVideoHubProps {
  result: DiagnosisResult;
  isOpen: boolean;
  onClose: () => void;
}

type VideoCategory = 'all' | 'step-by-step' | 'diagnosis' | 'teardown' | 'quick-fix';

interface VideoEntry {
  id: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  category: VideoCategory;
  url: string;
  saved: boolean;
}

export function RepairVideoHub({ result, isOpen, onClose }: RepairVideoHubProps) {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());

  const categories: { value: VideoCategory; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'step-by-step', label: 'Step-by-Step' },
    { value: 'diagnosis', label: 'Diagnosis' },
    { value: 'teardown', label: 'Teardown' },
    { value: 'quick-fix', label: 'Quick Fix' },
  ];

  // Generate video entries from diagnosis YouTube videos or create search-based ones
  const videos: VideoEntry[] = useMemo(() => {
    if (result.youtubeVideos && result.youtubeVideos.length > 0) {
      return result.youtubeVideos.map((v, i) => ({
        id: v.id,
        title: v.title,
        channelName: v.channelName,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        viewCount: v.viewCount >= 1000000 ? `${(v.viewCount / 1000000).toFixed(1)}M` : v.viewCount >= 1000 ? `${(v.viewCount / 1000).toFixed(0)}K` : String(v.viewCount),
        category: (i % 4 === 0 ? 'step-by-step' : i % 4 === 1 ? 'diagnosis' : i % 4 === 2 ? 'teardown' : 'quick-fix') as VideoCategory,
        url: v.url,
        saved: savedVideos.has(v.id),
      }));
    }
    return [];
  }, [result.youtubeVideos, savedVideos]);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      if (activeCategory !== 'all' && v.category !== activeCategory) return false;
      if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [videos, activeCategory, searchQuery]);

  const toggleSave = (id: string) => {
    setSavedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const searchYouTube = () => {
    const query = encodeURIComponent(
      `${result.itemDescription} ${result.likelyIssues[0]?.title || ''} repair tutorial how to fix`
    );
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Repair Video Hub</h3>
                  <p className="text-sm text-surface-500">Learn by watching</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Active Video Player */}
            {activeVideo && (
              <div className="mb-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-3">
                  <h4 className="font-semibold text-surface-900">{activeVideo.title}</h4>
                  <p className="text-sm text-surface-500">{activeVideo.channelName}</p>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-9 pr-4 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      'px-3 py-2.5 min-h-[44px] rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                      activeCategory === cat.value
                        ? 'bg-red-500 text-white'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video List */}
            {filteredVideos.length > 0 ? (
              <div className="space-y-3 mb-4">
                {filteredVideos.map(video => (
                  <div
                    key={video.id}
                    className="flex gap-3 p-2 rounded-xl hover:bg-surface-50 cursor-pointer transition-colors"
                    onClick={() => setActiveVideo(video)}
                  >
                    <div className="relative w-36 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Youtube className="w-8 h-8 text-red-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-surface-900 text-sm line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-surface-500 mt-1">{video.channelName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {video.viewCount}
                        </span>
                        <Badge size="sm" variant="outline">{video.category}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(video.id); }}
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation flex-shrink-0"
                    >
                      {savedVideos.has(video.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-surface-400 hover:text-brand-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Youtube className="w-12 h-12 text-red-300 mx-auto mb-3" />
                <p className="text-surface-600 mb-4">
                  {videos.length === 0
                    ? 'No videos loaded yet. Search YouTube for repair tutorials.'
                    : 'No videos match your filter.'}
                </p>
              </div>
            )}

            {/* Search YouTube Button */}
            <Button
              variant="primary"
              className="w-full"
              icon={<Youtube className="w-4 h-4" />}
              onClick={searchYouTube}
            >
              Search YouTube for "{result.itemDescription}" Repair Videos
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RepairVideoHub;
