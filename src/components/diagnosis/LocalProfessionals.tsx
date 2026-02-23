'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Star,
  Clock,
  ExternalLink,
  Navigation,
  DollarSign,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, Button, Badge, Input, Skeleton } from '@/components/ui';
import { GetQuoteModal } from './GetQuoteModal';
import { useLocation } from '@/hooks';
import { LocalProfessional, ServiceCategory, ITEM_TYPE_TO_SERVICE_CATEGORY } from '@/types';

interface LocalProfessionalsProps {
  itemType: string;
  diagnosisId: string;
  issueTitle?: string;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Map itemType to service category
function getServiceCategory(itemType: string): ServiceCategory {
  const lowerType = itemType.toLowerCase();

  // Check for exact matches first
  if (ITEM_TYPE_TO_SERVICE_CATEGORY[lowerType]) {
    return ITEM_TYPE_TO_SERVICE_CATEGORY[lowerType];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(ITEM_TYPE_TO_SERVICE_CATEGORY)) {
    if (lowerType.includes(key) || key.includes(lowerType)) {
      return value;
    }
  }

  // Default to handyman
  return 'handyman';
}

// Format category for display
function formatCategory(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    appliance_repair: 'Appliance Repair',
    plumber: 'Plumbing',
    electrician: 'Electrical',
    hvac: 'HVAC',
    garage_door: 'Garage Door',
    handyman: 'Handyman',
    general_contractor: 'General Contractor',
  };
  return labels[category] || 'Home Repair';
}

function ProfessionalCard({
  professional,
  onGetQuote,
}: {
  professional: LocalProfessional;
  onGetQuote: (professional: LocalProfessional) => void;
}) {
  const priceLabels = ['', '$', '$$', '$$$', '$$$$'];

  return (
    <Card padding="md" hover className="relative overflow-hidden">
      <div className="flex gap-4">
        {/* Photo/Avatar */}
        <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {professional.photoUrl ? (
            <img
              src={professional.photoUrl}
              alt={professional.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <MapPin className="w-6 h-6 text-surface-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-surface-900 truncate">{professional.name}</h4>
            {professional.isOpen !== undefined && (
              <Badge variant={professional.isOpen ? 'success' : 'outline'} size="sm">
                {professional.isOpen ? 'Open' : 'Closed'}
              </Badge>
            )}
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-surface-700">
                {professional.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-surface-400">
              ({professional.reviewCount} reviews)
            </span>
            {professional.priceLevel && (
              <>
                <span className="text-surface-300">|</span>
                <span className="text-sm text-surface-500">
                  {priceLabels[professional.priceLevel]}
                </span>
              </>
            )}
          </div>

          {/* Distance & Address */}
          <div className="flex items-center gap-1 text-sm text-surface-500 mb-3">
            <Navigation className="w-3 h-3" />
            <span>{professional.distanceText}</span>
            <span className="text-surface-300">-</span>
            <span className="truncate">{professional.address}, {professional.city}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onGetQuote(professional)}
            >
              Get Quote
            </Button>
            {professional.phone && (
              <a href={`tel:${professional.phone}`}>
                <Button variant="secondary" size="sm" icon={<Phone className="w-3 h-3" />}>
                  Call
                </Button>
              </a>
            )}
            {professional.googleMapsUrl && (
              <a href={professional.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" icon={<ExternalLink className="w-3 h-3" />}>
                  Map
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function LocationPrompt({
  onRequestLocation,
  onSubmitZip,
  isLoading,
  error,
}: {
  onRequestLocation: () => void;
  onSubmitZip: (zip: string) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length === 5) {
      onSubmitZip(zipCode);
    }
  };

  return (
    <Card padding="lg" className="text-center">
      <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-7 h-7 text-brand-600" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">
        Find Local Service Providers
      </h3>
      <p className="text-surface-600 mb-6">
        Share your location to find qualified professionals near you
      </p>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          icon={<Navigation className="w-4 h-4" />}
          onClick={onRequestLocation}
          loading={isLoading}
          className="w-full"
        >
          Use My Location
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-sm text-surface-400">or</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter zip code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={zipCode.length !== 5 || isLoading}
          >
            Find
          </Button>
        </form>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} padding="md">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function LocalProfessionals({ itemType, diagnosisId, issueTitle }: LocalProfessionalsProps) {
  const { location, isLoading: locationLoading, error: locationError, requestLocation, setManualZipCode } = useLocation();
  const [professionals, setProfessionals] = useState<LocalProfessional[]>([]);
  const [isLoadingPros, setIsLoadingPros] = useState(false);
  const [prosError, setProsError] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<LocalProfessional | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const serviceCategory = getServiceCategory(itemType);

  // Fetch professionals when location changes
  useEffect(() => {
    if (!location) return;

    const fetchProfessionals = async () => {
      setIsLoadingPros(true);
      setProsError(null);

      try {
        const response = await fetch('/api/professionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            category: serviceCategory,
            zipCode: location.zipCode,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch professionals');
        }

        const data = await response.json();
        setProfessionals(data.professionals || []);
      } catch (err) {
        setProsError('Unable to find professionals. Please try again.');
        console.error('Error fetching professionals:', err);
      } finally {
        setIsLoadingPros(false);
      }
    };

    fetchProfessionals();
  }, [location, serviceCategory]);

  const handleGetQuote = (professional: LocalProfessional) => {
    setSelectedProfessional(professional);
    setShowQuoteModal(true);
  };

  const handleGetGeneralQuote = () => {
    setSelectedProfessional(null);
    setShowQuoteModal(true);
  };

  return (
    <motion.section variants={item}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-surface-900">
            Local {formatCategory(serviceCategory)} Pros
          </h3>
          {location && (
            <p className="text-sm text-surface-500">
              Near {location.city ? `${location.city}, ${location.state}` : location.zipCode}
            </p>
          )}
        </div>
        {location && professionals.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetGeneralQuote}
          >
            Get Multiple Quotes
          </Button>
        )}
      </div>

      {/* No location - show prompt */}
      {!location && (
        <LocationPrompt
          onRequestLocation={requestLocation}
          onSubmitZip={setManualZipCode}
          isLoading={locationLoading}
          error={locationError}
        />
      )}

      {/* Loading */}
      {(locationLoading || isLoadingPros) && location && <LoadingSkeleton />}

      {/* Error */}
      {prosError && (
        <Card padding="md" className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{prosError}</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {!isLoadingPros && !prosError && professionals.length > 0 && (
        <div className="space-y-3">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onGetQuote={handleGetQuote}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoadingPros && !prosError && location && professionals.length === 0 && (
        <Card padding="lg" className="text-center">
          <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-surface-400" />
          </div>
          <h4 className="font-semibold text-surface-900 mb-2">No professionals found nearby</h4>
          <p className="text-surface-600 mb-4">
            Try expanding your search area or contact us for referrals.
          </p>
          <Button variant="primary" onClick={handleGetGeneralQuote}>
            Request Professional Referral
          </Button>
        </Card>
      )}

      {/* Quote Modal */}
      <GetQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        professional={selectedProfessional || undefined}
        diagnosisId={diagnosisId}
        itemType={itemType}
        issueTitle={issueTitle}
        userZipCode={location?.zipCode}
      />
    </motion.section>
  );
}

export default LocalProfessionals;
