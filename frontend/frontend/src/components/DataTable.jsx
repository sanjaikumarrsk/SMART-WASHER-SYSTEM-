import React from 'react'
import { motion } from 'framer-motion'

export default function DataTable({ title = '', columns, data = [] }) {
  const defaultData = [
    {
      id: 'C001',
      user_id: 'U123',
      fabric_type: 'Cotton',
      mode: 'Eco',
      status: 'Completed',
      time: '2 hours ago',
    },
    {
      id: 'C002',
      user_id: 'U124',
      fabric_type: 'Wool',
      mode: 'Delicate',
      status: 'Running',
      time: '15 mins ago',
    },
    {
      id: 'C003',
      user_id: 'U125',
      fabric_type: 'Synthetic',
      mode: 'Quick',
      status: 'Completed',
      time: '30 mins ago',
    },
    {
      id: 'C004',
      user_id: 'U126',
      fabric_type: 'Cotton',
      mode: 'Normal',
      status: 'Completed',
      time: '1 hour ago',
    },
  ]

  const displayData = data.length > 0 ? data : defaultData

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="overflow-hidden"
    >
      {title && <h3 className="text-lg font-bold text-darkText mb-4 px-6 pt-6">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 font-bold text-darkText">Cycle ID</th>
              <th className="text-left py-4 px-6 font-bold text-darkText">User</th>
              <th className="text-left py-4 px-6 font-bold text-darkText">Fabric</th>
              <th className="text-left py-4 px-6 font-bold text-darkText">Mode</th>
              <th className="text-left py-4 px-6 font-bold text-darkText">Status</th>
              <th className="text-left py-4 px-6 font-bold text-darkText">Time</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="py-4 px-6 font-semibold text-darkText">{row.id || row.cycle_id}</td>
                <td className="py-4 px-6 text-lightText font-medium">{row.user_id}</td>
                <td className="py-4 px-6 text-lightText">{row.fabric_type}</td>
                <td className="py-4 px-6 text-lightText">{row.mode || row.wash_mode}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-lightText">{row.time || row.start_time}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
