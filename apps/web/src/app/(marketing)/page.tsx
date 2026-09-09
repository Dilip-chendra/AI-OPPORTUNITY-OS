import { HeroSection } from '@/components/marketing/hero-section'
import { ProblemSection } from '@/components/marketing/problem-section'
import { ProductVisionSection } from '@/components/marketing/product-vision-section'
import { RadarDemoSection } from '@/components/marketing/radar-demo-section'
import { AIScoreSection } from '@/components/marketing/ai-score-section'
import { DecisionEngineSection } from '@/components/marketing/decision-engine-section'
import { AIAnalystPreviewSection } from '@/components/marketing/ai-analyst-preview-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { PartnerIntelligenceSection } from '@/components/marketing/partner-intelligence-section'
import { ChangeRadarSection } from '@/components/marketing/change-radar-section'
import { TrustSection } from '@/components/marketing/trust-section'
import { UseCasesSection } from '@/components/marketing/use-cases-section'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FAQSection } from '@/components/marketing/faq-section'
import { FinalCTASection } from '@/components/marketing/final-cta-section'

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <ProblemSection />
      <ProductVisionSection />
      <RadarDemoSection />
      <AIScoreSection />
      <DecisionEngineSection />
      <AIAnalystPreviewSection />
      <HowItWorksSection />
      <PartnerIntelligenceSection />
      <ChangeRadarSection />
      <TrustSection />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  )
}
