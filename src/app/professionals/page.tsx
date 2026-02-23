'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Badge, Input } from '@/components/ui';
import { Professional, Discount } from '@/types';
import {
  Search,
  MapPin,
  Phone,
  Star,
  Clock,
  CheckCircle,
  Filter,
  ChevronDown,
  ExternalLink,
  Tag,
  Award,
  Percent,
  Zap,
} from 'lucide-react';

// Mock data for professionals with discounts
const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'ProFix Appliance Repair',
    specialty: 'Appliances',
    rating: 4.9,
    reviewCount: 234,
    distance: '2.3 miles',
    phone: '(555) 123-4567',
    available: true,
    certifications: ['EPA Certified', 'Factory Trained'],
    responseTime: 'Usually responds in 1 hour',
    yearsExperience: 12,
    discounts: [
      {
        id: 'd1',
        description: '15% off first repair',
        percentOff: 15,
        code: 'FIRST15',
        categories: ['Appliances'],
      },
    ],
  },
  {
    id: '2',
    name: 'Swift Plumbing Solutions',
    specialty: 'Plumbing',
    rating: 4.8,
    reviewCount: 187,
    distance: '3.1 miles',
    phone: '(555) 234-5678',
    available: true,
    certifications: ['Licensed Plumber', 'Insured'],
    responseTime: 'Usually responds in 2 hours',
    yearsExperience: 8,
    discounts: [
      {
        id: 'd2',
        description: '$25 off any service over $100',
        flatAmount: '$25',
        code: 'SAVE25',
        categories: ['Plumbing'],
      },
    ],
  },
  {
    id: '3',
    name: 'Elite HVAC Services',
    specialty: 'HVAC',
    rating: 4.7,
    reviewCount: 156,
    distance: '4.5 miles',
    phone: '(555) 345-6789',
    available: false,
    certifications: ['NATE Certified', 'EPA 608'],
    responseTime: 'Usually responds in 4 hours',
    yearsExperience: 15,
  },
  {
    id: '4',
    name: 'Bright Spark Electric',
    specialty: 'Electrical',
    rating: 4.9,
    reviewCount: 312,
    distance: '1.8 miles',
    phone: '(555) 456-7890',
    available: true,
    certifications: ['Master Electrician', 'Bonded & Insured'],
    responseTime: 'Usually responds in 30 minutes',
    yearsExperience: 20,
    discounts: [
      {
        id: 'd3',
        description: 'Free safety inspection with any repair',
        categories: ['Electrical'],
      },
      {
        id: 'd4',
        description: '10% off for RepairIQ users',
        percentOff: 10,
        code: 'REPAIRIQ10',
        categories: ['Electrical'],
      },
    ],
  },
  {
    id: '5',
    name: 'Home Pro Repairs',
    specialty: 'General',
    rating: 4.6,
    reviewCount: 98,
    distance: '5.2 miles',
    phone: '(555) 567-8901',
    available: true,
    certifications: ['Handyman Certified'],
    responseTime: 'Usually responds in 3 hours',
    yearsExperience: 5,
    discounts: [
      {
        id: 'd5',
        description: '20% off for new customers',
        percentOff: 20,
        code: 'NEW20',
        categories: ['General'],
      },
    ],
  },
  {
    id: '6',
    name: 'Quick Fix Garage Doors',
    specialty: 'Garage',
    rating: 4.8,
    reviewCount: 145,
    distance: '3.7 miles',
    phone: '(555) 678-9012',
    available: true,
    certifications: ['IDEA Certified'],
    responseTime: 'Same day service',
    yearsExperience: 10,
  },
];

const specialties = ['All', 'Appliances', 'Plumbing', 'HVAC', 'Electrical', 'General', 'Garage'];

function DiscountBadge({ discount }: { discount: Discount }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
      <Percent className="w-3 h-3" />
      {discount.percentOff ? `${discount.percentOff}% off` : discount.flatAmount ? discount.flatAmount + ' off' : 'Special'}
    </div>
  );
}

function ProfessionalCard({ professional, isRecommended }: { professional: Professional; isRecommended?: boolean }) {
  const [showDiscounts, setShowDiscounts] = useState(false);
  const hasDiscounts = professional.discounts && professional.discounts.length > 0;

  return (
    <Card hover padding="md" className={`group ${isRecommended ? 'ring-2 ring-brand-500' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-brand-500 text-white text-xs font-medium rounded-full">
          Recommended for your issue
        </div>
      )}
      <div className="flex gap-4">
        {/* Avatar/Logo placeholder */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-brand-600">
            {professional.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                  {professional.name}
                </h3>
                {hasDiscounts && (
                  <Tag className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" size="sm">
                  {professional.specialty}
                </Badge>
                <span className="text-sm text-surface-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {professional.distance}
                </span>
                {professional.yearsExperience && (
                  <span className="text-sm text-surface-500">
                    {professional.yearsExperience}+ years
                  </span>
                )}
              </div>
            </div>
            {professional.available ? (
              <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                Available
              </Badge>
            ) : (
              <Badge variant="default" size="sm" icon={<Clock className="w-3 h-3" />}>
                Busy
              </Badge>
            )}
          </div>

          {/* Certifications */}
          {professional.certifications && professional.certifications.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {professional.certifications.slice(0, 3).map((cert) => (
                <span key={cert} className="inline-flex items-center gap-1 text-xs text-surface-600 bg-surface-100 px-2 py-0.5 rounded">
                  <Award className="w-3 h-3 text-brand-500" />
                  {cert}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent-amber fill-accent-amber" />
              <span className="font-medium text-surface-900">{professional.rating}</span>
              <span className="text-sm text-surface-500">({professional.reviewCount} reviews)</span>
            </div>
            {professional.responseTime && (
              <span className="text-sm text-surface-500 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {professional.responseTime}
              </span>
            )}
          </div>

          {/* Discounts section */}
          {hasDiscounts && (
            <div className="mt-3">
              <button
                onClick={() => setShowDiscounts(!showDiscounts)}
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                <Tag className="w-4 h-4" />
                {professional.discounts!.length} discount{professional.discounts!.length > 1 ? 's' : ''} available
                <ChevronDown className={`w-4 h-4 transition-transform ${showDiscounts ? 'rotate-180' : ''}`} />
              </button>
              {showDiscounts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-2 space-y-2"
                >
                  {professional.discounts!.map((discount) => (
                    <div key={discount.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{discount.description}</span>
                      </div>
                      {discount.code && (
                        <code className="px-2 py-0.5 bg-white text-green-700 rounded text-xs font-mono">
                          {discount.code}
                        </code>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="primary"
              size="sm"
              icon={<Phone className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Call Now
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ProfessionalsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const issueParam = searchParams.get('issue');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false);

  // Set initial filter from URL params
  useEffect(() => {
    if (categoryParam) {
      // Map category to specialty
      const categoryMap: Record<string, string> = {
        'appliance': 'Appliances',
        'appliances': 'Appliances',
        'plumbing': 'Plumbing',
        'hvac': 'HVAC',
        'electrical': 'Electrical',
        'general': 'General',
        'garage': 'Garage',
      };
      const mappedSpecialty = categoryMap[categoryParam.toLowerCase()] || categoryParam;
      if (specialties.includes(mappedSpecialty)) {
        setSelectedSpecialty(mappedSpecialty);
      }
    }
    if (issueParam) {
      setSearchQuery(issueParam);
    }
  }, [categoryParam, issueParam]);

  const filteredProfessionals = mockProfessionals.filter((pro) => {
    const matchesSearch =
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' || pro.specialty === selectedSpecialty;
    const matchesAvailability = !showAvailableOnly || pro.available;
    const matchesDiscounts = !showDiscountsOnly || (pro.discounts && pro.discounts.length > 0);

    return matchesSearch && matchesSpecialty && matchesAvailability && matchesDiscounts;
  });

  // Sort to show professionals with discounts first
  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    const aHasDiscount = a.discounts && a.discounts.length > 0 ? 1 : 0;
    const bHasDiscount = b.discounts && b.discounts.length > 0 ? 1 : 0;
    return bHasDiscount - aHasDiscount;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const professionalsWithDiscounts = filteredProfessionals.filter(p => p.discounts && p.discounts.length > 0);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
              Find Professionals
            </h1>
            <p className="text-surface-600">
              Connect with vetted repair professionals in your area.
              {categoryParam && ` Showing ${selectedSpecialty} specialists.`}
            </p>
          </div>

          {/* Recommended for issue banner */}
          {issueParam && (
            <Card padding="md" className="bg-brand-50 border-brand-200 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-900 mb-1">
                    Based on your diagnosis
                  </h3>
                  <p className="text-sm text-brand-800">
                    Showing professionals who can help with: <strong>{issueParam}</strong>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Pro Discount Network Banner */}
          {professionalsWithDiscounts.length > 0 && (
            <Card padding="md" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Pro Discount Network</h3>
                    <p className="text-sm text-green-700">
                      {professionalsWithDiscounts.length} professional{professionalsWithDiscounts.length > 1 ? 's' : ''} offering exclusive discounts
                    </p>
                  </div>
                </div>
                <Button
                  variant={showDiscountsOnly ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setShowDiscountsOnly(!showDiscountsOnly)}
                  icon={<Percent className="w-4 h-4" />}
                >
                  {showDiscountsOnly ? 'Show All' : 'Discounts Only'}
                </Button>
              </div>
            </Card>
          )}

          {/* Info Banner */}
          <Card padding="md" className="bg-amber-50 border-amber-200 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Coming Soon</h3>
                <p className="text-sm text-amber-800">
                  We are building a network of vetted repair professionals. For now, this is placeholder data.
                  Soon you will be able to book appointments directly through RepairIQ.
                </p>
              </div>
            </div>
          </Card>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSpecialty === specialty
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-surface-600">Show available only</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-surface-500">
              {sortedProfessionals.length} professionals found
              {showDiscountsOnly && ' with discounts'}
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {sortedProfessionals.map((professional, index) => (
              <motion.div key={professional.id} variants={item}>
                <ProfessionalCard
                  professional={professional}
                  isRecommended={!!issueParam && index === 0}
                />
              </motion.div>
            ))}
          </motion.div>

          {sortedProfessionals.length === 0 && (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">
                No professionals found
              </h3>
              <p className="text-surface-600">
                Try adjusting your search or filters.
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
