export type DiagnosticStage =
  | 'initial'
  | 'understanding'
  | 'narrowing'
  | 'solutions'
  | 'complete';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'professional';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
}

export interface LikelyIssue {
  id: string;
  title: string;
  probability: number;
  description: string;
  difficulty: Difficulty;
  confidenceScore: number;
  confidenceReason?: string;
}

export interface TroubleshootingStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: Difficulty;
  tips?: string[];
  warnings?: string[];
}

export interface Part {
  id: string;
  name: string;
  partNumber?: string;
  estimatedCost: string;
  where_to_buy: string;
  required: boolean;
  suppliers?: PartSupplier[];
}

export interface PartSupplier {
  name: string;
  url: string;
  price?: number;
  inStock?: boolean;
  logoUrl?: string;
}

export interface ConfidenceFactors {
  informationQuality: number;
  symptomClarity: number;
  patternMatch: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  viewCount: number;
  duration: string;
  publishedAt?: Date;
  url: string;
}

export interface RepairOutcome {
  diagnosisId: string;
  reportedAt: Date;
  wasSuccessful: boolean;
  actualIssue?: string;
  actualCost?: string;
  actualTime?: string;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  wouldRecommend: boolean;
}

export interface AppRating {
  id: string;
  diagnosisId: string;
  createdAt: Date;
  rating: 1 | 2 | 3 | 4 | 5;
  wasHelpful: boolean;
  wouldRecommend: boolean;
  feedback?: string;
  feedbackCategory?: 'accurate' | 'easy_to_use' | 'fast' | 'saved_money' | 'other';
}

export interface DiagnosisResult {
  id: string;
  itemType: string;
  itemDescription: string;
  createdAt: Date;
  overallConfidence: number;
  confidenceFactors: ConfidenceFactors;
  likelyIssues: LikelyIssue[];
  troubleshootingSteps: TroubleshootingStep[];
  partsNeeded: Part[];
  shouldCallProfessional: boolean;
  professionalReason?: string;
  estimatedTotalCost: string;
  estimatedTotalTime: string;
  youtubeVideos?: YouTubeVideo[];
  summary: string;
  outcome?: RepairOutcome;
}

export interface RepairSession {
  id: string;
  messages: Message[];
  stage: DiagnosticStage;
  result?: DiagnosisResult;
  createdAt: Date;
  updatedAt: Date;
  itemName?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface APIError {
  message: string;
  code?: string;
}

export interface ChatRequest {
  messages: Message[];
  sessionId: string;
  images?: string[];
}

export interface ChatResponse {
  message: Message;
  stage: DiagnosticStage;
  result?: DiagnosisResult;
  fromCache?: boolean;
}

export interface Discount {
  id: string;
  description: string;
  percentOff?: number;
  flatAmount?: string;
  code?: string;
  validUntil?: Date;
  categories: string[];
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  distance: string;
  phone: string;
  available: boolean;
  imageUrl?: string;
  discounts?: Discount[];
  certifications?: string[];
  responseTime?: string;
  yearsExperience?: number;
}

export interface PartAffiliate {
  id: string;
  storeName: string;
  storeUrl: string;
  discountCode?: string;
  discountPercent?: number;
  categories: string[];
  logoUrl?: string;
}

export interface CacheEntry {
  key: string;
  keywords: string[];
  result: DiagnosisResult;
  createdAt: Date;
  hitCount: number;
}

// Location types
export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Enhanced Professional type for local service providers
export interface LocalProfessional {
  id: string;
  name: string;
  businessName?: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  distance: number; // in miles
  distanceText: string;
  priceLevel?: 1 | 2 | 3 | 4; // $ to $$$$
  isOpen?: boolean;
  openNow?: string;
  photoUrl?: string;
  googleMapsUrl?: string;
  placeId?: string;
  categories: string[];
}

// Lead capture for monetization
export interface LeadCapture {
  id: string;
  createdAt: Date;
  // Contact info
  name: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  // Problem details
  problemDescription: string;
  diagnosisId?: string;
  itemType?: string;
  issueTitle?: string;
  // Preferences
  preferredContactTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  preferredContactMethod: 'phone' | 'email' | 'text';
  urgency: 'emergency' | 'soon' | 'flexible';
  // Selected professional (optional)
  selectedProfessionalId?: string;
  selectedProfessionalName?: string;
}

// Category mapping from itemType to service category
export type ServiceCategory =
  | 'appliance_repair'
  | 'plumber'
  | 'electrician'
  | 'hvac'
  | 'garage_door'
  | 'handyman'
  | 'general_contractor';

// Sound Analysis Types
export interface SoundRecording {
  id: string;
  sessionId?: string;
  createdAt: Date;
  audioBlob?: Blob;
  audioUrl?: string;
  duration: number; // in seconds
  soundType: 'grinding' | 'clicking' | 'humming' | 'squeaking' | 'rattling' | 'buzzing' | 'other';
  description?: string;
  analyzed: boolean;
  analysisResult?: string;
}

// Error Code Database Types
export interface ErrorCode {
  id: string;
  code: string;
  brand: string;
  applianceType: string;
  description: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  difficulty: Difficulty;
  estimatedCost?: string;
  professionalRequired: boolean;
  relatedCodes?: string[];
}

export interface ErrorCodeLookup {
  code: string;
  brand?: string;
  applianceType?: string;
}

// Appliance Inventory Types
export interface SavedAppliance {
  id: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Basic info
  name: string;
  nickname?: string; // e.g., "Kitchen Fridge"
  type: string; // refrigerator, washer, etc.
  brand: string;
  model: string;
  serialNumber?: string;
  // Purchase info
  purchaseDate?: Date;
  purchasePrice?: number;
  purchaseLocation?: string;
  // Warranty info
  warrantyExpiration?: Date;
  extendedWarrantyExpiration?: Date;
  warrantyProvider?: string;
  warrantyDocumentUrl?: string;
  // Location
  location?: string; // Kitchen, Garage, etc.
  // Maintenance
  lastMaintenanceDate?: Date;
  maintenanceSchedule?: MaintenanceSchedule[];
  // Notes
  notes?: string;
  imageUrl?: string;
  // History
  repairHistory?: ApplianceRepairRecord[];
}

export interface MaintenanceSchedule {
  id: string;
  applianceId: string;
  taskName: string;
  description: string;
  intervalMonths: number;
  lastCompleted?: Date;
  nextDue: Date;
  reminderEnabled: boolean;
}

export interface ApplianceRepairRecord {
  id: string;
  applianceId: string;
  date: Date;
  diagnosisId?: string;
  issue: string;
  resolution: string;
  cost?: number;
  wasSuccessful: boolean;
  performedBy: 'self' | 'professional';
  professionalName?: string;
  notes?: string;
}

// Maintenance Reminder Types
export interface MaintenanceReminder {
  id: string;
  applianceId: string;
  applianceName: string;
  taskName: string;
  description: string;
  dueDate: Date;
  isOverdue: boolean;
  priority: 'low' | 'medium' | 'high';
  dismissed: boolean;
  completedAt?: Date;
}

// Warranty Checker Types
export interface WarrantyStatus {
  applianceId: string;
  isUnderWarranty: boolean;
  warrantyType: 'manufacturer' | 'extended' | 'none';
  expirationDate?: Date;
  daysRemaining?: number;
  coverage?: string[];
  contactInfo?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  recommendation: 'contact_manufacturer' | 'diy_safe' | 'professional_recommended';
}

// Cost Comparison Types
export interface CostComparison {
  diagnosisId: string;
  itemType: string;
  issueTitle: string;
  // DIY option
  diyCost: {
    parts: number;
    tools: number;
    total: number;
    estimatedTime: string;
    difficulty: Difficulty;
    riskLevel: 'low' | 'medium' | 'high';
  };
  // Professional repair option
  professionalRepair: {
    laborCost: { min: number; max: number };
    partsCost: { min: number; max: number };
    total: { min: number; max: number };
    estimatedTime: string;
    warranty?: string;
  };
  // Replacement option
  replacement: {
    newItemCost: { min: number; max: number };
    installationCost?: { min: number; max: number };
    total: { min: number; max: number };
    averageLifespan: string;
    energySavings?: string;
  };
  // Recommendation
  recommendation: 'diy' | 'professional' | 'replace';
  recommendationReason: string;
}

// Community & Social Types
export interface RepairSuccessStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
  // Repair details
  applianceType: string;
  issueFaced: string;
  solutionUsed: string;
  // Media
  beforeImageUrl?: string;
  afterImageUrl?: string;
  // Stats
  timeTaken: string;
  costSaved?: number;
  difficulty: Difficulty;
  // Social
  tips: string[];
  likes: number;
  comments: Comment[];
  // Verification
  isVerified: boolean;
  diagnosisId?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  likes: number;
  isExpert: boolean;
}

// Q&A Forum Types
export interface ForumQuestion {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  // Question details
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageUrls?: string[];
  // Status
  status: 'open' | 'answered' | 'closed';
  acceptedAnswerId?: string;
  // Stats
  viewCount: number;
  answerCount: number;
  upvotes: number;
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  // Stats
  upvotes: number;
  isAccepted: boolean;
  // Expert verification
  isExpert: boolean;
  expertBadge?: ExpertBadge;
}

// Expert Verification Types
export interface ExpertBadge {
  type: 'certified_tech' | 'master_tech' | 'specialist' | 'verified_pro';
  specialty: string[];
  verifiedAt: Date;
  verificationMethod: 'license' | 'certification' | 'employment' | 'reputation';
  issuer?: string;
}

export interface ExpertProfile {
  userId: string;
  badge: ExpertBadge;
  bio: string;
  yearsExperience: number;
  specialties: string[];
  certifications: string[];
  employer?: string;
  // Stats
  questionsAnswered: number;
  acceptedAnswers: number;
  helpfulVotes: number;
  reputation: number;
}

// Repair History & Trends Types
export interface RepairTrend {
  applianceId?: string;
  applianceType: string;
  brand?: string;
  // Trends
  commonIssues: Array<{
    issue: string;
    frequency: number;
    avgCost: number;
    lastOccurred: Date;
  }>;
  totalRepairs: number;
  totalSpent: number;
  averageCostPerRepair: number;
  // Predictions
  predictedMaintenanceNeeds: Array<{
    task: string;
    predictedDate: Date;
    confidence: number;
    estimatedCost: number;
  }>;
  // Recommendations
  recommendations: string[];
}

export const ITEM_TYPE_TO_SERVICE_CATEGORY: Record<string, ServiceCategory> = {
  'appliance': 'appliance_repair',
  'washer': 'appliance_repair',
  'dryer': 'appliance_repair',
  'refrigerator': 'appliance_repair',
  'dishwasher': 'appliance_repair',
  'oven': 'appliance_repair',
  'microwave': 'appliance_repair',
  'plumbing': 'plumber',
  'pipe': 'plumber',
  'faucet': 'plumber',
  'toilet': 'plumber',
  'drain': 'plumber',
  'water heater': 'plumber',
  'electrical': 'electrician',
  'outlet': 'electrician',
  'switch': 'electrician',
  'wiring': 'electrician',
  'circuit': 'electrician',
  'hvac': 'hvac',
  'ac': 'hvac',
  'air conditioner': 'hvac',
  'heater': 'hvac',
  'furnace': 'hvac',
  'thermostat': 'hvac',
  'garage': 'garage_door',
  'garage door': 'garage_door',
};
