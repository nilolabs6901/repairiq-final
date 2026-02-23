'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Clock, AlertTriangle, CheckCircle, MapPin, User } from 'lucide-react';
import { Button, Input, Textarea, Card, Badge } from '@/components/ui';
import { LeadCapture, LocalProfessional } from '@/types';

interface GetQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: LocalProfessional;
  diagnosisId?: string;
  itemType?: string;
  issueTitle?: string;
  userZipCode?: string;
}

export function GetQuoteModal({
  isOpen,
  onClose,
  professional,
  diagnosisId,
  itemType,
  issueTitle,
  userZipCode,
}: GetQuoteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    zipCode: userZipCode || '',
    problemDescription: issueTitle ? `Issue: ${issueTitle}\n\n` : '',
    preferredContactTime: 'anytime' as LeadCapture['preferredContactTime'],
    preferredContactMethod: 'phone' as LeadCapture['preferredContactMethod'],
    urgency: 'flexible' as LeadCapture['urgency'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          diagnosisId,
          itemType,
          issueTitle,
          selectedProfessionalId: professional?.id,
          selectedProfessionalName: professional?.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      zipCode: userZipCode || '',
      problemDescription: issueTitle ? `Issue: ${issueTitle}\n\n` : '',
      preferredContactTime: 'anytime',
      preferredContactMethod: 'phone',
      urgency: 'flexible',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <Card padding="lg" className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-surface-900">
                  {submitted ? 'Request Submitted!' : 'Get a Free Quote'}
                </h2>
                {professional && !submitted && (
                  <p className="text-sm text-surface-500 mt-1">
                    From {professional.name}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {submitted ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  Your Request Has Been Sent!
                </h3>
                <p className="text-surface-600 mb-6">
                  {professional
                    ? `${professional.name} will contact you within 24 hours.`
                    : 'A qualified professional will contact you soon.'}
                </p>
                <Button onClick={handleClose}>Done</Button>
              </motion.div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Professional info if selected */}
                {professional && (
                  <div className="p-3 bg-brand-50 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{professional.name}</p>
                        <p className="text-sm text-surface-500">
                          {professional.distanceText} away - {professional.rating} stars
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Address (Optional)"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    label="Zip Code"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                  />
                </div>

                <Textarea
                  label="Describe Your Problem"
                  placeholder="Tell us about the issue you're experiencing..."
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  required
                  rows={3}
                />

                {/* Preferences */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-surface-700">
                    How urgent is this?
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-600' },
                      { value: 'soon', label: 'Within a few days', icon: Clock, color: 'text-amber-600' },
                      { value: 'flexible', label: 'Flexible', icon: Clock, color: 'text-green-600' },
                    ].map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: value as LeadCapture['urgency'] })}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          formData.urgency === value
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-surface-200 hover:border-surface-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mx-auto mb-1 ${formData.urgency === value ? 'text-brand-600' : color}`} />
                        <p className={`text-xs font-medium ${formData.urgency === value ? 'text-brand-700' : 'text-surface-600'}`}>
                          {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-surface-700">
                    Preferred contact method
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'phone', label: 'Phone Call' },
                      { value: 'text', label: 'Text Message' },
                      { value: 'email', label: 'Email' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredContactMethod: value as LeadCapture['preferredContactMethod'] })}
                        className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.preferredContactMethod === value
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-surface-200 text-surface-600 hover:border-surface-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-surface-700">
                    Best time to contact
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'morning', label: 'Morning' },
                      { value: 'afternoon', label: 'Afternoon' },
                      { value: 'evening', label: 'Evening' },
                      { value: 'anytime', label: 'Anytime' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredContactTime: value as LeadCapture['preferredContactTime'] })}
                        className={`flex-1 py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                          formData.preferredContactTime === value
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-surface-200 text-surface-600 hover:border-surface-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    className="flex-1"
                  >
                    Get Free Quote
                  </Button>
                </div>

                <p className="text-xs text-surface-400 text-center">
                  By submitting, you agree to be contacted about your repair request.
                </p>
              </form>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GetQuoteModal;
