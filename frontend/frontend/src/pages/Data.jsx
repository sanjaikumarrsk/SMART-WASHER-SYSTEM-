import React, { useState, useEffect } from 'react'
import { Clock, RefreshCw, TrendingUp, Leaf, Gauge, Zap, Droplets, Scale } from 'lucide-react'
import { motion } from 'framer-motion'

const BACKEND_API = 'http://localhost:7098/api'

export default function Data() {
  const [analysisData, setAnalysisData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [sortBy, setSortBy] = useState('date') // 'date' or 'id'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' or 'desc'
  const [idFilter, setIdFilter] = useState('') // Optional id filter

  // Fetch analysis data
  const fetchAnalysisData = async () => {
    try {
      console.log('[Data Page] Fetching analysis data from:', `${BACKEND_API}/Analysis/getall`)
      const response = await fetch(`${BACKEND_API}/Analysis/getall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('[Data Page] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[Data Page] Received analysis data:', data)
        setAnalysisData(Array.isArray(data) ? data : data.data || [])
        setLastUpdate(new Date())
        setError(null)
      } else {
        console.error('[Data Page] Failed response:', response.status)
        setError(`Failed to fetch analysis data: ${response.status}`)
      }
    } catch (err) {
      console.error('[Data Page] Error fetching analysis data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh on interval
  useEffect(() => {
    fetchAnalysisData()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalysisData()
      }, 2000) // Refresh every 2 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Filter and sort data
  const getFilteredAndSortedData = () => {
    let filtered = [...analysisData]

    // Apply id filter if specified
    if (idFilter) {
      filtered = filtered.filter(item => 
        item.analysis_id.toString().includes(idFilter) || 
        item.sensor_id.toString().includes(idFilter)
      )
    }

    // Sort by selected field
    filtered.sort((a, b) => {
      let aVal, bVal
      if (sortBy === 'date') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else {
        aVal = a.analysis_id
        bVal = b.analysis_id
      }

      if (sortOrder === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })

    // Return only last 30 records
    return filtered.slice(0, 30)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-green-50 to-slate-50 pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Analysis & Eco Metrics</h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={fetchAnalysisData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Now
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-slate-700">Auto-refresh (2s)</span>
          </label>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-slate-600">Loading analysis data...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              {analysisData.length > 0 ? (
                <div>
                  {/* Latest Analysis Summary Cards */}
                  {analysisData[0] && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-green-600" />
                        Latest Analysis Summary
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Eco Score */}
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-green-700 uppercase tracking-widest">Eco Score</span>
                            <Leaf className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-5xl font-bold text-green-600">{analysisData[0].eco_score?.toFixed(1) || '—'}</p>
                          <p className="text-sm text-green-600 mt-2 font-semibold">/100</p>
                        </div>

                        {/* Avg Water Level */}
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Avg Water Level</span>
                            <Droplets className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-5xl font-bold text-blue-600">{analysisData[0].avg_water_level?.toFixed(1) || '—'}</p>
                          <p className="text-sm text-blue-600 mt-2 font-semibold">%</p>
                        </div>

                        {/* Avg Current */}
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">Avg Current</span>
                            <Zap className="w-6 h-6 text-purple-600" />
                          </div>
                          <p className="text-5xl font-bold text-purple-600">{analysisData[0].avg_current?.toFixed(2) || '—'}</p>
                          <p className="text-sm text-purple-600 mt-2 font-semibold">A</p>
                        </div>

                        {/* Avg Turbidity */}
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-orange-700 uppercase tracking-widest">Avg Turbidity</span>
                            <Gauge className="w-6 h-6 text-orange-600" />
                          </div>
                          <p className="text-5xl font-bold text-orange-600">{analysisData[0].avg_turbidity?.toFixed(2) || '—'}</p>
                          <p className="text-sm text-orange-600 mt-2 font-semibold">NTU</p>
                        </div>

                        {/* Avg Weight */}
                        <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-red-700 uppercase tracking-widest">Avg Weight</span>
                            <Scale className="w-6 h-6 text-red-600" />
                          </div>
                          <p className="text-5xl font-bold text-red-600">{analysisData[0].avg_weight?.toFixed(2) || '—'}</p>
                          <p className="text-sm text-red-600 mt-2 font-semibold">kg</p>
                        </div>

                        {/* Analysis Info */}
                        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-300 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-700 uppercase tracking-widest">Analysis ID</span>
                            <TrendingUp className="w-6 h-6 text-slate-600" />
                          </div>
                          <p className="text-4xl font-bold text-slate-700">{analysisData[0].analysis_id}</p>
                          <p className="text-xs text-slate-600 mt-3 font-medium">
                            {new Date(analysisData[0].created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis History Table */}
                  {analysisData.length > 0 && (
                    <div className="mt-10">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-slate-600" />
                        Analysis History (Last 30 Records)
                      </h2>

                      {/* Filter and Sort Controls */}
                      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-4 items-center">
                        {/* ID/Sensor Filter */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-slate-700">Filter by ID:</label>
                          <input
                            type="text"
                            placeholder="Analysis or Sensor ID..."
                            value={idFilter}
                            onChange={(e) => setIdFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                          {idFilter && (
                            <button
                              onClick={() => setIdFilter('')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Sort By */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-slate-700">Sort by:</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                          >
                            <option value="date">Date</option>
                            <option value="id">Analysis ID</option>
                          </select>
                        </div>

                        {/* Sort Order */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-slate-700">Order:</label>
                          <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                          >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                          </select>
                        </div>

                        {/* Record Count */}
                        <div className="ml-auto text-sm text-slate-600 font-medium">
                          Showing {getFilteredAndSortedData().length} of {analysisData.length} records
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-left font-bold text-slate-900">Analysis ID</th>
                              <th className="px-6 py-3 text-center font-bold text-slate-900">Eco Score</th>
                              <th className="px-6 py-3 text-center font-bold text-slate-900">Avg Weight (kg)</th>
                              <th className="px-6 py-3 text-center font-bold text-slate-900">Avg Water (%)</th>
                              <th className="px-6 py-3 text-center font-bold text-slate-900">Avg Turbidity (NTU)</th>
                              <th className="px-6 py-3 text-center font-bold text-slate-900">Avg Current (A)</th>
                              <th className="px-6 py-3 text-left font-bold text-slate-900">Created Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredAndSortedData().map((analysis, idx) => (
                              <tr key={analysis.analysis_id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors`}>
                                <td className="px-6 py-4 font-semibold text-slate-900">{analysis.analysis_id}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${
                                    analysis.eco_score >= 80
                                      ? 'bg-green-100 text-green-700'
                                      : analysis.eco_score >= 60
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {analysis.eco_score?.toFixed(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{analysis.avg_weight?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{analysis.avg_water_level?.toFixed(1)}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{analysis.avg_turbidity?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{analysis.avg_current?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                                  {new Date(analysis.created_at).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Leaf className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">No analysis data available yet</p>
                  <p className="text-slate-500 text-sm mt-2">Check back later or refresh the page</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
