import React from 'react'
import { motion } from 'framer-motion'

export default function InfoSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6 py-12">
          {/* Left Side Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-darkText leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Revolutionizing Laundry with Smart Technology
            </motion.h2>

            <motion.p
              className="text-lg text-lightText leading-relaxed space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our smart washing system combines IoT technology with intelligent automation 
              to deliver an unprecedented laundry experience. Control your washing machine 
              from anywhere, monitor cycles in real-time, and enjoy optimized water and 
              energy consumption like never before.
            </motion.p>

            <motion.p
              className="text-lg text-lightText leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              With advanced AI algorithms, our system learns your preferences and 
              automatically adjusts settings for optimal results while minimizing 
              environmental impact.
            </motion.p>
          </motion.div>

          {/* Right Side - Real Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <img
              src="/asset/img1.png"
              alt="Smart Washing System Feature"
              className="w-full h-[350px] object-cover rounded-2xl shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
