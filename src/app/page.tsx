'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import {
  Wrench,
  Zap,
  Shield,
  Clock,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Users,
  Play,
  Camera,
  Video,
  Image,
  Mic,
  Search,
  HelpCircle,
  Hammer,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Photo & Video Diagnosis',
    description: 'Snap a photo or record a video of the problem. Our AI analyzes visual details for faster, more accurate diagnosis.',
    color: 'bg-brand-500',
  },
  {
    icon: MessageSquare,
    title: 'Conversational AI',
    description: 'Describe your problem in plain English or use voice input. Our AI asks smart follow-up questions.',
    color: 'bg-accent-amber',
  },
  {
    icon: DollarSign,
    title: 'Cost Estimates',
    description: 'Know what parts you need and how much they cost before you start. No surprises.',
    color: 'bg-accent-cyan',
  },
  {
    icon: Clock,
    title: 'Time Estimates',
    description: 'Plan your repair with accurate time estimates for each step. Know exactly what you are getting into.',
    color: 'bg-accent-violet',
  },
];

const categories = [
  { name: 'Appliances', icon: '🔌', examples: 'Washers, dryers, dishwashers' },
  { name: 'Plumbing', icon: '🚿', examples: 'Leaks, clogs, water heaters' },
  { name: 'HVAC', icon: '❄️', examples: 'AC, furnace, thermostats' },
  { name: 'Electrical', icon: '💡', examples: 'Outlets, switches, fixtures' },
  { name: 'Garage', icon: '🚗', examples: 'Door openers, tools, storage' },
  { name: 'Outdoor', icon: '🌳', examples: 'Lawn equipment, grills, pools' },
];

const testimonials = [
  {
    content: 'Saved me $300 on a dishwasher repair. The AI walked me through fixing a simple drain issue I thought needed a technician.',
    author: 'Sarah M.',
    role: 'Homeowner',
    rating: 5,
  },
  {
    content: 'Finally, an app that does not treat me like an idiot but also does not assume I am a professional. Perfect balance.',
    author: 'Mike T.',
    role: 'First-time DIYer',
    rating: 5,
  },
  {
    content: 'The safety warnings alone are worth it. Helped me realize my electrical issue actually needed a licensed electrician.',
    author: 'Jennifer L.',
    role: 'Apartment Renter',
    rating: 5,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />

        {/* Floating Elements */}
        <motion.div
          className="hidden md:block absolute top-32 left-[10%] w-16 h-16 rounded-2xl bg-brand-100 opacity-60 float"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hidden md:block absolute top-48 right-[15%] w-12 h-12 rounded-full bg-accent-amber opacity-40 float"
          animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="hidden md:block absolute bottom-32 left-[20%] w-20 h-20 rounded-3xl bg-accent-cyan opacity-30 float"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge
              variant="success"
              size="lg"
              className="mb-6"
              icon={<Sparkles className="w-4 h-4" />}
            >
              AI-Powered Repair Diagnostics
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-surface-900 mb-6 leading-tight">
              Fix anything with{' '}
              <span className="gradient-text">confidence</span>
            </h1>

            <p className="text-lg md:text-xl text-surface-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              From leaky faucets to broken appliances, RepairIQ guides you through
              diagnosing and fixing problems—or knowing when to call a pro.
            </p>

            {/* Two-Path CTA Cards */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto mt-2">
              <Link href="/diagnose">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-6 sm:p-8 text-white shadow-xl cursor-pointer group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      <HelpCircle className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold mb-2">
                      Don&apos;t Know What&apos;s Wrong
                    </h3>
                    <p className="text-white/80 text-sm sm:text-base mb-4">
                      Describe your problem and let AI diagnose it for you
                    </p>
                    <div className="flex items-center gap-2 text-white/90 font-medium text-sm">
                      Start Diagnosis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/toolkit">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 sm:p-8 text-white shadow-xl cursor-pointer group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      <Hammer className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold mb-2">
                      Help Me Fix It
                    </h3>
                    <p className="text-white/80 text-sm sm:text-base mb-4">
                      I know the problem — give me tools, parts & guides
                    </p>
                    <div className="flex items-center gap-2 text-white/90 font-medium text-sm">
                      Open Toolkit
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-6 text-sm text-surface-500">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-500" />
                  Photo diagnosis
                </span>
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-brand-500" />
                  Video support
                </span>
                <span className="flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-brand-500" />
                  Voice input
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-surface-400">
              No account required • Free to use • Expert-level guidance
            </p>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <Card variant="elevated" padding="none" className="max-w-4xl mx-auto overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <span className="ml-4 text-white/80 text-sm">RepairIQ Diagnosis</span>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-surface-50">
                <div className="space-y-4">
                  {/* AI Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-sm border border-surface-100 max-w-md">
                      <p className="text-surface-800">
                        Hey! I am here to help diagnose your repair issue. What is giving you trouble today?
                      </p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-brand-500 text-white rounded-2xl rounded-br-md p-4 max-w-md">
                      <p>My washing machine is making a loud banging noise during the spin cycle</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-sm border border-surface-100 max-w-md">
                      <p className="text-surface-800">
                        I can help with that! A few quick questions: Does the banging happen only with large loads, or also with small ones? And is it a rhythmic bang-bang-bang or more random?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-4">
              Everything you need to fix it yourself
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              Our AI understands your problem and guides you through the solution,
              step by step.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <Card hover padding="lg" className="h-full">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-surface-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-4">
              What can we help you fix?
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              From common household items to complex systems, we have got you covered.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {categories.map((category) => (
              <motion.div key={category.name} variants={item}>
                <Link href={`/diagnose?category=${category.name.toLowerCase()}`}>
                  <Card
                    hover
                    padding="md"
                    className="text-center h-full group"
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-surface-500">{category.examples}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              From broken to fixed in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Show or describe the problem',
                description: 'Snap a photo, record a video, or describe what is broken. Our AI analyzes visual details instantly.',
                icon: Camera,
              },
              {
                step: '02',
                title: 'Get your diagnosis',
                description: 'Our AI analyzes your issue and asks clarifying questions to pinpoint the cause.',
                icon: Lightbulb,
              },
              {
                step: '03',
                title: 'Follow the guide',
                description: 'Get step-by-step instructions, repair videos, parts lists, and know when to call a pro.',
                icon: CheckCircle,
              },
            ].map((stepItem, index) => (
              <motion.div
                key={stepItem.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-display font-bold text-brand-100 mb-4">
                  {stepItem.step}
                </div>
                <h3 className="text-xl font-semibold text-surface-900 mb-2">
                  {stepItem.title}
                </h3>
                <p className="text-surface-600">{stepItem.description}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-brand-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Trusted by DIYers everywhere
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              Join thousands of homeowners who have saved time and money with RepairIQ.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={item}>
                <Card padding="lg" className="h-full bg-surface-800 border-surface-700">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-accent-amber fill-accent-amber"
                      />
                    ))}
                  </div>
                  <p className="text-surface-200 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-surface-400">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-500 to-brand-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to fix something?
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Start your free diagnosis now. No account needed, no strings attached.
          </p>
          <Link href="/diagnose">
            <Button
              variant="secondary"
              size="xl"
              className="bg-white text-brand-600 hover:bg-brand-50"
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Start Diagnosis
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
