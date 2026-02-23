'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Phone,
  MessageCircle,
  Star,
  Clock,
  DollarSign,
  X,
  CheckCircle,
  User,
  Wrench,
  Zap,
  Droplets,
  Flame,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

interface VirtualTechConnectProps {
  itemType: string;
  issueTitle?: string;
}

type ConnectionType = 'video' | 'phone' | 'chat';

interface Technician {
  id: string;
  name: string;
  avatar?: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  yearsExperience: number;
  available: boolean;
  responseTime: string;
}

// Mock technicians data
const TECHNICIANS: Technician[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    specialty: ['Appliances', 'HVAC', 'General Repair'],
    rating: 4.9,
    reviewCount: 342,
    hourlyRate: 45,
    yearsExperience: 15,
    available: true,
    responseTime: '< 5 min',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    specialty: ['Electrical', 'Smart Home', 'Wiring'],
    rating: 4.8,
    reviewCount: 256,
    hourlyRate: 50,
    yearsExperience: 12,
    available: true,
    responseTime: '< 10 min',
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    specialty: ['Plumbing', 'Water Heaters', 'Drains'],
    rating: 4.7,
    reviewCount: 189,
    hourlyRate: 40,
    yearsExperience: 10,
    available: false,
    responseTime: '30 min',
  },
  {
    id: '4',
    name: 'Emily Davis',
    specialty: ['HVAC', 'Heating', 'Cooling'],
    rating: 4.9,
    reviewCount: 421,
    hourlyRate: 55,
    yearsExperience: 18,
    available: true,
    responseTime: '< 5 min',
  },
];

// Get specialty icon
function getSpecialtyIcon(specialty: string) {
  const lower = specialty.toLowerCase();
  if (lower.includes('electric') || lower.includes('smart')) return Zap;
  if (lower.includes('plumb') || lower.includes('water') || lower.includes('drain')) return Droplets;
  if (lower.includes('hvac') || lower.includes('heat') || lower.includes('cool')) return Flame;
  return Wrench;
}

// Filter technicians based on item type
function getRelevantTechnicians(itemType: string): Technician[] {
  const lower = itemType.toLowerCase();

  return TECHNICIANS.filter((tech) => {
    const specialties = tech.specialty.map((s) => s.toLowerCase()).join(' ');

    if (lower.includes('appliance') || lower.includes('washer') || lower.includes('dryer') ||
        lower.includes('refrigerator') || lower.includes('dishwasher') || lower.includes('oven')) {
      return specialties.includes('appliance') || specialties.includes('general');
    }
    if (lower.includes('electric') || lower.includes('outlet') || lower.includes('wiring')) {
      return specialties.includes('electric');
    }
    if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('faucet') ||
        lower.includes('toilet') || lower.includes('drain')) {
      return specialties.includes('plumb');
    }
    if (lower.includes('hvac') || lower.includes('ac') || lower.includes('heater') ||
        lower.includes('furnace')) {
      return specialties.includes('hvac');
    }

    // Default: show all
    return true;
  }).sort((a, b) => {
    // Sort by availability first, then rating
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return b.rating - a.rating;
  });
}

function TechnicianCard({
  tech,
  onSelect,
  isSelected,
}: {
  tech: Technician;
  onSelect: (tech: Technician) => void;
  isSelected: boolean;
}) {
  const Icon = getSpecialtyIcon(tech.specialty[0]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        padding="md"
        hover
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-brand-500 bg-brand-50' : ''
        }`}
        onClick={() => onSelect(tech)}
      >
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0">
            {tech.avatar ? (
              <img src={tech.avatar} alt={tech.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-surface-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-semibold text-surface-900">{tech.name}</h4>
              {tech.available ? (
                <Badge variant="success" size="sm">Available</Badge>
              ) : (
                <Badge variant="outline" size="sm">Busy</Badge>
              )}
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-2">
              {tech.specialty.slice(0, 2).map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full"
                >
                  <Icon className="w-3 h-3" />
                  {spec}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {tech.rating} ({tech.reviewCount})
              </span>
              <span className="text-surface-400">|</span>
              <span className="flex items-center gap-1 text-surface-600">
                <Clock className="w-3.5 h-3.5" />
                {tech.responseTime}
              </span>
              <span className="text-surface-400">|</span>
              <span className="flex items-center gap-1 text-brand-600 font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                ${tech.hourlyRate}/hr
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function VirtualTechConnect({ itemType, issueTitle }: VirtualTechConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const technicians = getRelevantTechnicians(itemType);

  const handleConnect = async () => {
    if (!selectedTech || !connectionType) return;

    setIsConnecting(true);
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsConnecting(false);
    setIsConnected(true);
  };

  const resetModal = () => {
    setIsOpen(false);
    setConnectionType(null);
    setSelectedTech(null);
    setIsConnecting(false);
    setIsConnected(false);
  };

  const connectionOptions = [
    {
      type: 'video' as ConnectionType,
      icon: Video,
      label: 'Video Call',
      description: 'Face-to-face guidance with screen sharing',
      price: 'From $45/hr',
    },
    {
      type: 'phone' as ConnectionType,
      icon: Phone,
      label: 'Phone Call',
      description: 'Voice-only troubleshooting support',
      price: 'From $40/hr',
    },
    {
      type: 'chat' as ConnectionType,
      icon: MessageCircle,
      label: 'Live Chat',
      description: 'Text-based help with photo sharing',
      price: 'From $35/hr',
    },
  ];

  return (
    <>
      {/* Trigger Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card padding="lg" className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Need Live Help?</h3>
                <p className="text-sm text-surface-600">
                  Connect with a certified technician for real-time guidance
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Connect with a Tech
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">
                    {isConnected ? 'Connected!' : 'Connect with a Technician'}
                  </h2>
                  {issueTitle && !isConnected && (
                    <p className="text-sm text-surface-500">For help with: {issueTitle}</p>
                  )}
                </div>
                <button
                  onClick={resetModal}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <div className="p-6">
                {isConnected ? (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-surface-900 mb-2">
                      You&apos;re Connected!
                    </h3>
                    <p className="text-surface-600 mb-2">
                      {selectedTech?.name} will {connectionType === 'video' ? 'start a video call' : connectionType === 'phone' ? 'call you' : 'message you'} shortly.
                    </p>
                    <p className="text-sm text-surface-500 mb-6">
                      Estimated wait time: {selectedTech?.responseTime}
                    </p>
                    <Button onClick={resetModal}>Done</Button>
                  </motion.div>
                ) : !connectionType ? (
                  /* Step 1: Choose Connection Type */
                  <div className="space-y-4">
                    <h3 className="font-medium text-surface-700 mb-4">
                      How would you like to connect?
                    </h3>
                    <div className="grid gap-3">
                      {connectionOptions.map((option) => (
                        <button
                          key={option.type}
                          onClick={() => setConnectionType(option.type)}
                          className="flex items-center gap-4 p-4 rounded-xl border-2 border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                            <option.icon className="w-6 h-6 text-brand-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-surface-900">{option.label}</h4>
                            <p className="text-sm text-surface-500">{option.description}</p>
                          </div>
                          <span className="text-sm font-medium text-brand-600">{option.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Step 2: Choose Technician */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-surface-700">
                        Select a Technician
                      </h3>
                      <button
                        onClick={() => setConnectionType(null)}
                        className="text-sm text-brand-600 hover:text-brand-700"
                      >
                        Change connection type
                      </button>
                    </div>

                    <div className="space-y-3">
                      {technicians.map((tech) => (
                        <TechnicianCard
                          key={tech.id}
                          tech={tech}
                          onSelect={setSelectedTech}
                          isSelected={selectedTech?.id === tech.id}
                        />
                      ))}
                    </div>

                    {selectedTech && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-4 border-t border-surface-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-surface-500">Session with {selectedTech.name}</p>
                            <p className="text-lg font-semibold text-surface-900">
                              ${selectedTech.hourlyRate}/hour
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            onClick={handleConnect}
                            loading={isConnecting}
                            disabled={!selectedTech.available}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {isConnecting ? 'Connecting...' : `Start ${connectionType === 'video' ? 'Video' : connectionType === 'phone' ? 'Call' : 'Chat'}`}
                          </Button>
                        </div>
                        {!selectedTech.available && (
                          <p className="text-sm text-amber-600">
                            This technician is currently busy. Try another or wait for availability.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default VirtualTechConnect;
