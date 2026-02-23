'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { ForumQuestion, ForumAnswer, ExpertBadge } from '@/types';
import { generateId } from '@/lib/utils';
import {
  Plus,
  Search,
  MessageCircle,
  ThumbsUp,
  CheckCircle,
  X,
  User,
  Eye,
  Clock,
  Award,
  Shield,
  Send,
  ChevronRight,
  Filter,
  ArrowUp,
} from 'lucide-react';

// Mock data for demo
const MOCK_QUESTIONS: ForumQuestion[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'HomeOwnerJohn',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    title: 'Samsung washer showing UE error - tried rebalancing but still happens',
    content: 'I\'ve been getting the UE error on my Samsung WF45R6100AW washer. I\'ve tried rebalancing the load multiple times, even with small loads. The washer is level. Any other things I should check?',
    category: 'Washer',
    tags: ['Samsung', 'UE Error', 'Won\'t Spin'],
    status: 'answered',
    acceptedAnswerId: 'ans1',
    viewCount: 156,
    answerCount: 3,
    upvotes: 12,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'DIYDave',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    title: 'Refrigerator making clicking sound every few minutes',
    content: 'My LG refrigerator (LRMVS3006S) started making a clicking sound every 2-3 minutes. The fridge is cooling fine. Is this something to worry about?',
    category: 'Refrigerator',
    tags: ['LG', 'Clicking Sound', 'Noise'],
    status: 'open',
    viewCount: 89,
    answerCount: 2,
    upvotes: 8,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'FirstTimeFixerMom',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    title: 'Dishwasher not draining - Bosch E24 error',
    content: 'My Bosch dishwasher shows E24 error and water is sitting at the bottom. I\'ve cleaned the filter and checked the drain hose. What else should I try before calling a repairman?',
    category: 'Dishwasher',
    tags: ['Bosch', 'E24', 'Won\'t Drain'],
    status: 'answered',
    acceptedAnswerId: 'ans3',
    viewCount: 234,
    answerCount: 5,
    upvotes: 18,
  },
];

const MOCK_ANSWERS: Record<string, ForumAnswer[]> = {
  '1': [
    {
      id: 'ans1',
      questionId: '1',
      userId: 'expert1',
      userName: 'AppliancePro_Mike',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      content: 'The UE error on Samsung washers can be caused by worn shock absorbers or suspension rods, not just load balance. Here\'s what to check:\n\n1. Open the door and push down on the drum - it should spring back smoothly. If it bounces excessively, the shocks are worn.\n2. Check the suspension rods at the top of the drum for damage.\n3. Inspect the drum spider for cracks (common issue on Samsung).\n\nIf the shocks are worn, they\'re about $30-40 for a set of 4 and pretty easy to replace.',
      upvotes: 24,
      isAccepted: true,
      isExpert: true,
      expertBadge: {
        type: 'certified_tech',
        specialty: ['Washer', 'Dryer'],
        verifiedAt: new Date('2023-01-15'),
        verificationMethod: 'certification',
        issuer: 'Samsung',
      },
    },
    {
      id: 'ans1b',
      questionId: '1',
      userId: 'user4',
      userName: 'FixItFrank',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      content: 'Had the same issue! In my case it was the shock absorbers. You can test them by removing the top panel and looking at them while running a spin cycle. If they\'re bouncing around, they need replacement.',
      upvotes: 8,
      isAccepted: false,
      isExpert: false,
    },
  ],
  '2': [
    {
      id: 'ans2',
      questionId: '2',
      userId: 'user5',
      userName: 'RefrigeratorGuru',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      content: 'The clicking sound is likely the compressor relay trying to start. If the fridge is cooling fine, it might be normal operation. However, if the clicking becomes more frequent, you might want to have the start relay checked - it\'s a $20 part and easy to replace.',
      upvotes: 6,
      isAccepted: false,
      isExpert: false,
    },
  ],
  '3': [
    {
      id: 'ans3',
      questionId: '3',
      userId: 'expert2',
      userName: 'BoschTech_Sarah',
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      content: 'For E24 on Bosch dishwashers, after cleaning the filter, try this:\n\n1. Check the drain pump impeller - remove the filter and reach in to spin the impeller. It should spin freely.\n2. If you\'re connected to a garbage disposal, make sure the knockout plug was removed during installation.\n3. Try tilting the dishwasher back about 45 degrees - sometimes water gets trapped in the base and triggers the anti-flood sensor.\n\nThe drain pump itself is a common failure point on Bosch. If you hear humming but no draining, the pump motor may be seized.',
      upvotes: 32,
      isAccepted: true,
      isExpert: true,
      expertBadge: {
        type: 'verified_pro',
        specialty: ['Dishwasher', 'Bosch Appliances'],
        verifiedAt: new Date('2022-06-10'),
        verificationMethod: 'employment',
        issuer: 'BSH Home Appliances',
      },
    },
  ],
};

const CATEGORIES = ['All', 'Washer', 'Dryer', 'Refrigerator', 'Dishwasher', 'Oven', 'HVAC', 'Other'];

interface QAForumProps {
  initialCategory?: string;
}

export function QAForum({ initialCategory }: QAForumProps) {
  const [questions, setQuestions] = useState<ForumQuestion[]>(MOCK_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, ForumAnswer[]>>(MOCK_ANSWERS);
  const [showAskForm, setShowAskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [newAnswer, setNewAnswer] = useState('');
  const [votedQuestions, setVotedQuestions] = useState<Set<string>>(new Set());
  const [votedAnswers, setVotedAnswers] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });

  const handleVoteQuestion = (questionId: string) => {
    setVotedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });

    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          upvotes: votedQuestions.has(questionId) ? q.upvotes - 1 : q.upvotes + 1,
        };
      }
      return q;
    }));
  };

  const handleVoteAnswer = (answerId: string, questionId: string) => {
    setVotedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(answerId)) {
        newSet.delete(answerId);
      } else {
        newSet.add(answerId);
      }
      return newSet;
    });

    setAnswers(prev => ({
      ...prev,
      [questionId]: prev[questionId]?.map(a => {
        if (a.id === answerId) {
          return {
            ...a,
            upvotes: votedAnswers.has(answerId) ? a.upvotes - 1 : a.upvotes + 1,
          };
        }
        return a;
      }) || [],
    }));
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    const newQuestion: ForumQuestion = {
      id: generateId(),
      userId: 'current-user',
      userName: 'You',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'open',
      viewCount: 0,
      answerCount: 0,
      upvotes: 0,
    };

    setQuestions([newQuestion, ...questions]);
    setAnswers({ ...answers, [newQuestion.id]: [] });
    setShowAskForm(false);
    setFormData({ title: '', content: '', category: '', tags: '' });
  };

  const handleSubmitAnswer = () => {
    if (!selectedQuestion || !newAnswer.trim()) return;

    const answer: ForumAnswer = {
      id: generateId(),
      questionId: selectedQuestion.id,
      userId: 'current-user',
      userName: 'You',
      createdAt: new Date(),
      updatedAt: new Date(),
      content: newAnswer,
      upvotes: 0,
      isAccepted: false,
      isExpert: false,
    };

    setAnswers(prev => ({
      ...prev,
      [selectedQuestion.id]: [...(prev[selectedQuestion.id] || []), answer],
    }));

    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQuestion.id) {
        return { ...q, answerCount: q.answerCount + 1 };
      }
      return q;
    }));

    setNewAnswer('');
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getExpertBadgeInfo = (badge: ExpertBadge) => {
    const badges = {
      certified_tech: { label: 'Certified Technician', color: 'text-blue-600 bg-blue-100' },
      master_tech: { label: 'Master Technician', color: 'text-purple-600 bg-purple-100' },
      specialist: { label: 'Specialist', color: 'text-green-600 bg-green-100' },
      verified_pro: { label: 'Verified Professional', color: 'text-amber-600 bg-amber-100' },
    };
    return badges[badge.type] || badges.certified_tech;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900">Q&A Forum</h2>
          <p className="text-surface-500">Get help from the community and experts</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAskForm(true)}
        >
          Ask a Question
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-brand-500 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((question) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="md" hover className="cursor-pointer" onClick={() => setSelectedQuestion(question)}>
              <div className="flex gap-4">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoteQuestion(question.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      votedQuestions.has(question.id) ? 'text-brand-500' : 'text-surface-400 hover:text-brand-500'
                    }`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className={`font-semibold ${votedQuestions.has(question.id) ? 'text-brand-500' : 'text-surface-700'}`}>
                    {question.upvotes}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-surface-900 hover:text-brand-600 line-clamp-2">
                      {question.title}
                    </h4>
                    {question.status === 'answered' && (
                      <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                        Answered
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-surface-600 line-clamp-2 mb-3">{question.content}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" size="sm">{question.category}</Badge>
                    {question.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-surface-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {question.userName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(question.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {question.answerCount} answers
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {question.viewCount} views
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-surface-300 flex-shrink-0 self-center" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ask Question Modal */}
      <AnimatePresence>
        {showAskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAskForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-surface-900">Ask a Question</h3>
                  <button onClick={() => setShowAskForm(false)} className="p-2 rounded-full hover:bg-surface-100">
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What's your question?"
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Details *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Include appliance model, symptoms, and what you've tried..."
                      rows={4}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      >
                        <option value="">Select...</option>
                        {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="e.g., Samsung, Error Code"
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAskForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      Post Question
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Detail Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card padding="lg">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-100"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>

                {/* Question */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{selectedQuestion.category}</Badge>
                    {selectedQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                    ))}
                    {selectedQuestion.status === 'answered' && (
                      <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                        Answered
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-surface-900 mb-3">{selectedQuestion.title}</h3>
                  <p className="text-surface-600 whitespace-pre-wrap">{selectedQuestion.content}</p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-surface-500">
                    <span>Asked by {selectedQuestion.userName}</span>
                    <span>{formatTimeAgo(selectedQuestion.createdAt)}</span>
                    <span>{selectedQuestion.viewCount} views</span>
                  </div>
                </div>

                {/* Answers */}
                <div className="border-t border-surface-200 pt-6">
                  <h4 className="font-semibold text-surface-900 mb-4">
                    {answers[selectedQuestion.id]?.length || 0} Answers
                  </h4>

                  <div className="space-y-4">
                    {answers[selectedQuestion.id]?.map((answer) => (
                      <div
                        key={answer.id}
                        className={`p-4 rounded-xl ${
                          answer.isAccepted ? 'bg-green-50 border border-green-200' : 'bg-surface-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleVoteAnswer(answer.id, selectedQuestion.id)}
                              className={`p-1 rounded transition-colors ${
                                votedAnswers.has(answer.id) ? 'text-brand-500' : 'text-surface-400 hover:text-brand-500'
                              }`}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className={`text-sm font-semibold ${votedAnswers.has(answer.id) ? 'text-brand-500' : 'text-surface-600'}`}>
                              {answer.upvotes}
                            </span>
                            {answer.isAccepted && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-surface-900">{answer.userName}</span>
                              {answer.isExpert && answer.expertBadge && (
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getExpertBadgeInfo(answer.expertBadge).color}`}>
                                  <Shield className="w-3 h-3" />
                                  {getExpertBadgeInfo(answer.expertBadge).label}
                                </span>
                              )}
                              <span className="text-sm text-surface-400">{formatTimeAgo(answer.createdAt)}</span>
                            </div>
                            <p className="text-surface-600 whitespace-pre-wrap">{answer.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Answer Form */}
                  <div className="mt-6 pt-6 border-t border-surface-200">
                    <h4 className="font-semibold text-surface-900 mb-3">Your Answer</h4>
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Share your knowledge..."
                      rows={4}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="primary"
                        icon={<Send className="w-4 h-4" />}
                        onClick={handleSubmitAnswer}
                        disabled={!newAnswer.trim()}
                      >
                        Post Answer
                      </Button>
                    </div>
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

export default QAForum;
