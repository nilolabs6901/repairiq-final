'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { RepairSuccessStory, Difficulty } from '@/types';
import { generateId, getDifficultyLabel } from '@/lib/utils';
import {
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Camera,
  X,
  CheckCircle,
  Award,
  Clock,
  DollarSign,
  ThumbsUp,
  Image as ImageIcon,
  Send,
  User,
  ChevronRight,
} from 'lucide-react';

// Mock data for demo
const MOCK_STORIES: RepairSuccessStory[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Mike R.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    applianceType: 'Washer',
    issueFaced: 'Washer not draining - Error code OE',
    solutionUsed: 'Cleaned the drain pump filter and removed a sock that was blocking it',
    beforeImageUrl: '/placeholder-before.jpg',
    afterImageUrl: '/placeholder-after.jpg',
    timeTaken: '30 minutes',
    costSaved: 150,
    difficulty: 'easy',
    tips: [
      'Check the drain filter first - it\'s usually at the bottom front',
      'Keep a towel ready, water will come out!',
      'Run a quick drain cycle to test before putting the panel back',
    ],
    likes: 42,
    comments: [],
    isVerified: true,
    diagnosisId: 'diag1',
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sarah K.',
    userAvatar: '/avatar2.jpg',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    applianceType: 'Refrigerator',
    issueFaced: 'Fridge not cooling properly, freezer working fine',
    solutionUsed: 'Defrosted the evaporator coils and replaced the defrost timer',
    timeTaken: '2 hours',
    costSaved: 300,
    difficulty: 'medium',
    tips: [
      'Unplug for 24 hours first to see if it\'s just ice buildup',
      'The defrost timer is usually behind the kickplate or in the fresh food section',
      'Watch YouTube videos for your specific model',
    ],
    likes: 28,
    comments: [],
    isVerified: false,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Dave T.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    applianceType: 'Dryer',
    issueFaced: 'Dryer not heating',
    solutionUsed: 'Replaced the thermal fuse and cleaned the entire vent system',
    timeTaken: '1.5 hours',
    costSaved: 200,
    difficulty: 'medium',
    tips: [
      'The thermal fuse costs about $10 online',
      'While you\'re at it, clean the entire vent - a clogged vent often causes the fuse to blow',
      'Test with a multimeter before ordering parts',
    ],
    likes: 35,
    comments: [],
    isVerified: true,
    diagnosisId: 'diag3',
  },
];

interface SuccessStoriesProps {
  diagnosisId?: string;
  onShareStory?: () => void;
}

export function SuccessStories({ diagnosisId, onShareStory }: SuccessStoriesProps) {
  const [stories, setStories] = useState<RepairSuccessStory[]>(MOCK_STORIES);
  const [showShareForm, setShowShareForm] = useState(false);
  const [selectedStory, setSelectedStory] = useState<RepairSuccessStory | null>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    applianceType: '',
    issueFaced: '',
    solutionUsed: '',
    timeTaken: '',
    costSaved: '',
    tips: [''],
    difficulty: 'medium' as Difficulty,
  });

  const handleLike = (storyId: string) => {
    setLikedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });

    setStories(prev => prev.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          likes: likedStories.has(storyId) ? story.likes - 1 : story.likes + 1,
        };
      }
      return story;
    }));
  };

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();

    const newStory: RepairSuccessStory = {
      id: generateId(),
      userId: 'current-user',
      userName: 'You',
      createdAt: new Date(),
      applianceType: formData.applianceType,
      issueFaced: formData.issueFaced,
      solutionUsed: formData.solutionUsed,
      timeTaken: formData.timeTaken,
      costSaved: formData.costSaved ? parseInt(formData.costSaved) : undefined,
      difficulty: formData.difficulty,
      tips: formData.tips.filter(t => t.trim()),
      likes: 0,
      comments: [],
      isVerified: !!diagnosisId,
      diagnosisId,
    };

    setStories([newStory, ...stories]);
    setShowShareForm(false);
    setFormData({
      applianceType: '',
      issueFaced: '',
      solutionUsed: '',
      timeTaken: '',
      costSaved: '',
      tips: [''],
      difficulty: 'medium',
    });
  };

  const addTip = () => {
    setFormData({ ...formData, tips: [...formData.tips, ''] });
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...formData.tips];
    newTips[index] = value;
    setFormData({ ...formData, tips: newTips });
  };

  const removeTip = (index: number) => {
    const newTips = formData.tips.filter((_, i) => i !== index);
    setFormData({ ...formData, tips: newTips.length ? newTips : [''] });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900">Success Stories</h2>
          <p className="text-surface-500">Learn from DIY repairs by the community</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowShareForm(true)}
        >
          Share Your Story
        </Button>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="md" hover className="cursor-pointer" onClick={() => setSelectedStory(story)}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-brand-600" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-surface-900">{story.userName}</span>
                    {story.isVerified && (
                      <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                        Verified
                      </Badge>
                    )}
                    <span className="text-sm text-surface-400">• {formatDate(story.createdAt)}</span>
                  </div>

                  {/* Appliance and Issue */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{story.applianceType}</Badge>
                    <Badge
                      variant={
                        story.difficulty === 'easy' ? 'success' :
                        story.difficulty === 'medium' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {getDifficultyLabel(story.difficulty)}
                    </Badge>
                  </div>

                  <h4 className="font-medium text-surface-900 mb-1">{story.issueFaced}</h4>
                  <p className="text-surface-600 text-sm line-clamp-2">{story.solutionUsed}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-surface-500">
                    {story.timeTaken && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{story.timeTaken}</span>
                      </div>
                    )}
                    {story.costSaved && (
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span>${story.costSaved} saved</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(story.id);
                      }}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        likedStories.has(story.id) ? 'text-red-500' : 'text-surface-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
                      <span>{story.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-surface-500 hover:text-brand-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-surface-500 hover:text-brand-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-surface-300 flex-shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Share Story Modal */}
      <AnimatePresence>
        {showShareForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-surface-900">Share Your Success</h3>
                  <button
                    onClick={() => setShowShareForm(false)}
                    className="p-2 rounded-full hover:bg-surface-100"
                  >
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmitStory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      Appliance Type *
                    </label>
                    <input
                      type="text"
                      value={formData.applianceType}
                      onChange={(e) => setFormData({ ...formData, applianceType: e.target.value })}
                      placeholder="e.g., Washer, Refrigerator, Dryer"
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      What was the issue? *
                    </label>
                    <input
                      type="text"
                      value={formData.issueFaced}
                      onChange={(e) => setFormData({ ...formData, issueFaced: e.target.value })}
                      placeholder="e.g., Washer not draining, making loud noise"
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      How did you fix it? *
                    </label>
                    <textarea
                      value={formData.solutionUsed}
                      onChange={(e) => setFormData({ ...formData, solutionUsed: e.target.value })}
                      placeholder="Describe what you did to fix the problem..."
                      rows={3}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Time Taken
                      </label>
                      <input
                        type="text"
                        value={formData.timeTaken}
                        onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })}
                        placeholder="e.g., 1 hour"
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        $ Saved
                      </label>
                      <input
                        type="number"
                        value={formData.costSaved}
                        onChange={(e) => setFormData({ ...formData, costSaved: e.target.value })}
                        placeholder="150"
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      Tips for Others
                    </label>
                    {formData.tips.map((tip, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => updateTip(index, e.target.value)}
                          placeholder={`Tip ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        {formData.tips.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTip(index)}
                            className="p-2 text-surface-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTip}
                      className="text-sm text-brand-600 hover:text-brand-700"
                    >
                      + Add another tip
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowShareForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" icon={<Send className="w-4 h-4" />}>
                      Share Story
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Detail Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-surface-900">{selectedStory.userName}</span>
                        {selectedStory.isVerified && (
                          <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-surface-500">{formatDate(selectedStory.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="p-2 rounded-full hover:bg-surface-100"
                  >
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedStory.applianceType}</Badge>
                    <Badge
                      variant={
                        selectedStory.difficulty === 'easy' ? 'success' :
                        selectedStory.difficulty === 'medium' ? 'warning' : 'danger'
                      }
                    >
                      {getDifficultyLabel(selectedStory.difficulty)}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-surface-900 mb-2">{selectedStory.issueFaced}</h3>
                    <p className="text-surface-600">{selectedStory.solutionUsed}</p>
                  </div>

                  <div className="flex items-center gap-6 py-3 border-y border-surface-200">
                    {selectedStory.timeTaken && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-surface-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Time</span>
                        </div>
                        <p className="font-semibold text-surface-900">{selectedStory.timeTaken}</p>
                      </div>
                    )}
                    {selectedStory.costSaved && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Saved</span>
                        </div>
                        <p className="font-semibold text-green-600">${selectedStory.costSaved}</p>
                      </div>
                    )}
                  </div>

                  {selectedStory.tips.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Tips from {selectedStory.userName}
                      </h4>
                      <ul className="space-y-2">
                        {selectedStory.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-surface-600">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(selectedStory.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                          likedStories.has(selectedStory.id)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-surface-100 text-surface-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedStories.has(selectedStory.id) ? 'fill-current' : ''}`} />
                        <span>{selectedStory.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                    <Button variant="secondary" size="sm" icon={<ThumbsUp className="w-4 h-4" />}>
                      Helpful
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuccessStories;
