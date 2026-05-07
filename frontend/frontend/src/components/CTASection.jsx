import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-aqua/10" id="analytics">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-darkText">
            Ready to Transform Your Laundry?
          </h2>
          <p className="text-xl text-lightText">
            Join thousands of customers enjoying smarter, cleaner, and more efficient laundry
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-8 py-4"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </motion.button>
            <motion.button
              onClick={() => navigate('/about')}
              className="px-8 py-4 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-all duration-300"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
