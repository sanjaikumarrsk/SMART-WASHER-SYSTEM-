import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function KPICard({ icon: Icon, title, value, trend, color = '#4DA8DA', gradientBg = 'from-blue-100 to-blue-50' }) {
  const isTrendPositive = trend && !trend.includes('-')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(77, 168, 218, 0.15)' }}
      className={`rounded-2xl bg-gradient-to-br ${gradientBg} p-6 shadow-md hover:shadow-xl border border-white/40 transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-lightText text-sm font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-darkText mt-2">{value}</p>
        </div>
        {Icon && (
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={32} color={color} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm pt-3 border-t border-white/50">
        <div className={`flex items-center gap-1 font-bold ${isTrendPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} />
          <span>{trend}</span>
        </div>
        <span className="text-lightText">vs last month</span>
      </div>
    </motion.div>
  )
}
