import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="w-full mt-16 h-[calc(100vh-4rem)] bg-black relative overflow-hidden" id="home">
      {/* Video Background - Full video visible, no crop, no zoom */}
      <video
        src="/asset/homevdo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        }}
      />

      {/* Hero Content - Absolutely positioned, vertically centered, left-aligned */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start pl-16 text-white">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg max-w-3xl">
          Smart Washing System
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-200 drop-shadow-md max-w-2xl">
          The Future of Laundry at Your Fingertips
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-orange-400 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/about')}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
