import React from 'react'
import { motion } from 'framer-motion'

export default function FeatureGrid() {
  const features = [
    {
      icon: '🔐',
      title: 'Enterprise Security',
      description: 'Military-grade encryption protects all your personal data and machine settings.',
    },
    {
      icon: '🌍',
      title: 'Eco-Friendly',
      description: 'Reduce your carbon footprint with our sustainable and energy-conscious design.',
    },
    {
      icon: '🤝',
      title: 'Seamless Integration',
      description: 'Works perfectly with your smart home ecosystem and popular automation platforms.',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track usage patterns, costs, and environmental impact with detailed reports.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-darkText mb-4">
            Premium Features
          </h2>
          <p className="text-lg text-lightText">
            Everything you need for a superior laundry experience
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="rounded-2xl soft-shadow p-8 bg-gradient-to-br from-white to-gray-50 hover-lift group cursor-pointer"
              variants={cardVariants}
              whileHover={{
                y: -12,
                boxShadow: '0 30px 50px rgba(77, 168, 218, 0.2)',
              }}
            >
              {/* Icon */}
              <motion.div
                className="text-6xl mb-6 transition-all duration-300"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {feature.icon}
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-bold text-darkText mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-lightText leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover Accent Line */}
              <motion.div
                className="h-1 bg-gradient-hero rounded-full mt-6"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
