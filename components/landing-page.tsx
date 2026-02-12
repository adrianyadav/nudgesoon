'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, Bell, Shield } from 'lucide-react';
import { NudgeIcon } from '@/components/nudge-icon';

export function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Calendar,
      title: 'Simple Tracking',
      description: 'Just add the year and item name. We handle the rest.',
    },
    {
      icon: Sparkles,
      title: 'Instant Updates',
      description: 'See your items update in real-time, no waiting.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Visual nudges when things are about to expire.',
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data is yours. Each user sees only their items.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background grain mesh-gradient dot-pattern overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="blob blob-1 float-slow" />
      <div className="blob blob-2 float-medium" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-20 max-w-7xl relative z-10"
      >
        {/* Subtle decorative circles in hero */}
        <div className="absolute top-32 left-[10%] w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-48 right-[15%] w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <Badge className="bg-primary text-primary-foreground border-0 px-4 py-2 text-sm font-medium">
              ✨ Never forget what expires
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 md:gap-6 mb-6 text-foreground tracking-tight"
          >
            <NudgeIcon className="w-16 h-16 md:w-24 md:h-24 text-primary" />
            <span className="text-7xl md:text-9xl font-bold">Nudge</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
          >
            Gentle reminders for everything that expires.
            <br />
            <span className="text-xl">
              Passports, memberships, food, medicine, and more.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Button
              onClick={() => router.push('/auth/signin')}
              size="lg"
              className="cursor-pointer text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => {
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </motion.div>
        </div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-5xl mx-auto relative"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />

          <Card className="p-8 bg-card/90 backdrop-blur-xl border shadow-2xl relative z-10">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Demo Cards */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-emerald-900">
                    Passport
                  </h3>
                  <Badge className="bg-emerald-500 text-white border-0 font-medium">
                    SAFE
                  </Badge>
                </div>
                <p className="text-5xl font-bold text-emerald-700 mb-2">2028</p>
                <p className="text-sm text-emerald-600 font-medium">
                  850 days left
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-amber-50 border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-amber-900">Gym Pass</h3>
                  <Badge className="bg-amber-500 text-white border-0 font-medium">
                    APPROACHING
                  </Badge>
                </div>
                <p className="text-5xl font-bold text-amber-700 mb-2">2026</p>
                <p className="text-sm text-amber-600 font-medium">
                  5 days left
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-red-50 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-red-900">Milk</h3>
                  <Badge className="bg-red-500 text-white border-0 font-medium">
                    CRITICAL
                  </Badge>
                </div>
                <p className="text-5xl font-bold text-red-700 mb-2">2026</p>
                <p className="text-sm text-red-600 font-medium">1 day left</p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-20 max-w-7xl"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Why Choose Nudge?
          </h2>
          <p className="text-xl text-muted-foreground">
            The simplest way to track everything that matters
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full hover:shadow-xl transition-all hover:scale-105 bg-card/80 backdrop-blur group">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 max-w-7xl border-t">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-medium">
            Made with care · Never miss what matters
          </p>
        </div>
      </div>
    </div>
  );
}
