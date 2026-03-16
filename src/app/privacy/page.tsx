'use client';

import { Header } from '@/components/layout';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-surface-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-surface max-w-none space-y-6 text-surface-700">
          <p className="text-sm text-surface-500">Last updated: March 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>RepairIQ collects the following information to provide our repair diagnostic service:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Repair descriptions and photos</strong> you provide for diagnosis (sent to our AI service for analysis)</li>
              <li><strong>Location data</strong> (only when you request nearby professionals, with your permission)</li>
              <li><strong>Device photos</strong> (only when you choose to photograph an item for diagnosis)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To analyze your repair issues and provide diagnostic recommendations</li>
              <li>To find local repair professionals near you (when requested)</li>
              <li>To improve our diagnostic accuracy over time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 mt-8 mb-3">3. Data Storage</h2>
            <p>Your repair history, appliance inventory, and preferences are stored locally on your device. We do not maintain a centralized database of your personal repair data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Anthropic (Claude AI)</strong> — processes repair descriptions for diagnosis</li>
              <li><strong>YouTube Data API</strong> — provides repair tutorial videos</li>
              <li><strong>Google Places API</strong> — finds local repair professionals</li>
              <li><strong>ElevenLabs</strong> — optional text-to-speech for voice-guided repairs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 mt-8 mb-3">5. Your Rights</h2>
            <p>Since data is stored locally on your device, you can delete all your data at any time by clearing the app data or uninstalling the app.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 mt-8 mb-3">6. Contact</h2>
            <p>For privacy questions, contact us at privacy@repairiq.app.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
