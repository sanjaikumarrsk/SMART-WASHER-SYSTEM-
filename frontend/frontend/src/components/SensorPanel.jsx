import React from 'react'
import { motion } from 'framer-motion'
import { Droplets, Thermometer, Wind, Zap } from 'lucide-react'

export default function SensorPanel({ data = {} }) {
  const sensors = [
    {
      icon: Droplets,
      label: 'Water Level',
      value: data.waterLevel || '85%',
      unit: '',
      color: '#4DA8DA',
      background: 'bg-gradient-to-br from-blue-50 to-cyan-100/50',
      borderColor: 'border-l-4 border-blue-500',
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: data.temperature || '45',
      unit: '°C',
      color: '#F4A261',
      background: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
      borderColor: 'border-l-4 border-orange-500',
    },
    {
      icon: Wind,
      label: 'Turbidity',
      value: data.turbidity || '32',
      unit: 'NTU',
      color: '#7FD1B9',
      background: 'bg-gradient-to-br from-teal-50 to-emerald-100/50',
      borderColor: 'border-l-4 border-teal-500',
    },
    {
      icon: Zap,
      label: 'Drum Speed',
      value: data.drumSpeed || '1200',
      unit: 'RPM',
      color: '#FF6B6B',
      background: 'bg-gradient-to-br from-red-50 to-red-100/50',
      borderColor: 'border-l-4 border-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      {sensors.map((sensor, index) => {
        const Icon = sensor.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)' }}
            className={`rounded-2xl ${sensor.background} ${sensor.borderColor} p-6 shadow-md hover:shadow-lg border border-white/60 transition-all duration-300`}
          >
            <Icon className="w-10 h-10 mb-3" style={{ color: sensor.color }} />
            <p className="text-lightText text-sm font-semibold">{sensor.label}</p>
            <p className="text-3xl font-bold text-darkText mt-2">
              {sensor.value}
              {sensor.unit && <span className="text-sm text-lightText ml-1">{sensor.unit}</span>}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
