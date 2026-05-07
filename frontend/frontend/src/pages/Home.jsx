import React from 'react'
import HeroSection from '../components/HeroSection'
import InfoSection from '../components/InfoSection'
import SlidingCards from '../components/SlidingCards'
import FeatureGrid from '../components/FeatureGrid'
import CTASection from '../components/CTASection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <InfoSection />
      <SlidingCards />
      <FeatureGrid />
      <CTASection />
    </>
  )
}
