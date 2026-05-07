import React from 'react'
import { motion } from 'framer-motion'

export default function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-white p-6 shadow-md"
    >
      <h3 className="text-lg font-bold text-darkText mb-4">{title}</h3>
      <div className="w-full overflow-x-auto">
        {children}
      </div>
    </motion.div>
  )
}
