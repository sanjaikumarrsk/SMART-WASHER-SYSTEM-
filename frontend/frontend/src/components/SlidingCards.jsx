import React from 'react'
import { motion } from 'framer-motion'

export default function SlidingCards() {
  const cards = [
    {
      title: 'Smart Controls',
      description: 'Control your washing machine from anywhere using our intuitive mobile app and web interface.',
      icon: '📱',
    },
    {
      title: 'Real-Time Monitoring',
      description: 'Track your wash cycles in real-time with detailed notifications and progress updates.',
      icon: '👁️',
    },
    {
      title: 'Energy Efficient',
      description: 'Reduce energy consumption by up to 40% with our intelligent optimization algorithms.',
      icon: '⚡',
    },
    {
      title: 'Water Optimization',
      description: 'Save water with smart load detection and adaptive water level adjustment.',
      icon: '💧',
    },
    {
      title: 'Auto Scheduling',
      description: 'Schedule cycles during off-peak hours for maximum efficiency and cost savings.',
      icon: '⏱️',
    },
    {
      title: 'AI Learning',
      description: 'Our AI learns your preferences and automatically optimizes cycles over time.',
      icon: '🧠',
    },
  ]

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-darkText mb-4">
            Why Choose Our System?
          </h2>
          <p className="text-lg text-lightText">
            Experience the future of laundry with cutting-edge features
          </p>
        </motion.div>

        {/* Scrolling Container */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -100 * cards.length] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* Render cards twice for seamless infinite scroll */}
            {[...cards, ...cards].map((card, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-64 rounded-2xl soft-shadow p-6 bg-white hover-lift"
                whileHover={{ y: -10 }}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-darkText mb-3">{card.title}</h3>
                <p className="text-lightText leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Gradient Fade Effect */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>
      </div>
    </section>
  )
}
