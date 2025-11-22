import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  FaUsers,
  FaEye,
  FaClock,
  FaDesktop,
  FaMobile,
  FaTablet,
  FaGlobeAmericas
} from 'react-icons/fa'

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    avgTimeOnPage: 0,
    pageViews: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const dateRange = getDateRange(timeRange)

      // Fetch total visits
      const { count: totalVisits, error: visitsError } = await supabase
        .from('website_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (visitsError) throw visitsError

      // Fetch unique visitors
      const { data: uniqueVisitors, error: uniqueError } = await supabase
        .from('website_visits')
        .select('session_id')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (uniqueError) throw uniqueError

      const uniqueVisitorCount = new Set(uniqueVisitors.map(v => v.session_id)).size

      // Fetch average time on page
      const { data: timeData, error: timeError } = await supabase
        .from('website_visits')
        .select('time_on_page')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .gt('time_on_page', 0)

      if (timeError) throw timeError

      const avgTime = timeData.length > 0 
        ? timeData.reduce((sum, visit) => sum + visit.time_on_page, 0) / timeData.length 
        : 0

      // Fetch page views
      const { data: pageViews, error: pagesError } = await supabase
        .from('website_visits')
        .select('page_path')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (pagesError) throw pagesError

      const pageViewCounts = pageViews.reduce((acc, visit) => {
        acc[visit.page_path] = (acc[visit.page_path] || 0) + 1
        return acc
      }, {})

      const sortedPageViews = Object.entries(pageViewCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Fetch device statistics
      const { data: deviceData, error: deviceError } = await supabase
        .from('website_visits')
        .select('device_type')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (deviceError) throw deviceError

      const deviceStats = deviceData.reduce((acc, visit) => {
        acc[visit.device_type] = (acc[visit.device_type] || 0) + 1
        return acc
      }, {})

      setStats({
        totalVisits,
        uniqueVisitors: uniqueVisitorCount,
        avgTimeOnPage: Math.round(avgTime),
        pageViews: sortedPageViews,
        deviceStats
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = (range) => {
    const end = new Date()
    const start = new Date()
    
    switch (range) {
      case '1d':
        start.setDate(start.getDate() - 1)
        break
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
      case '90d':
        start.setDate(start.getDate() - 90)
        break
      default:
        start.setDate(start.getDate() - 7)
    }

    return { start: start.toISOString(), end: end.toISOString() }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  if (loading && !stats.totalVisits) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Website Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaEye}
          title="Total Visits"
          value={stats.totalVisits?.toLocaleString() || '0'}
        />
        <StatCard
          icon={FaUsers}
          title="Unique Visitors"
          value={stats.uniqueVisitors?.toLocaleString() || '0'}
        />
        <StatCard
          icon={FaClock}
          title="Avg. Time on Page"
          value={`${stats.avgTimeOnPage}s`}
        />
        <StatCard
          icon={FaGlobeAmericas}
          title="Bounce Rate"
          value={`${Math.round((1 - stats.uniqueVisitors / Math.max(stats.totalVisits, 1)) * 100)}%`}
        />
      </div>

      {/* Device Statistics */}
      {stats.deviceStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.deviceStats).map(([device, count]) => (
              <div key={device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    {device === 'desktop' && <FaDesktop className="w-4 h-4" />}
                    {device === 'mobile' && <FaMobile className="w-4 h-4" />}
                    {device === 'tablet' && <FaTablet className="w-4 h-4" />}
                  </div>
                  <span className="capitalize">{device}</span>
                </div>
                <span className="font-semibold">
                  {((count / stats.totalVisits) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Pages */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Pages</h3>
        <div className="space-y-3">
          {stats.pageViews.map((page, index) => (
            <div key={page.path} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <span className="w-6 text-sm text-gray-500">#{index + 1}</span>
                <span className="ml-3 text-sm font-medium truncate max-w-xs">
                  {page.path === '/' ? 'Homepage' : page.path}
                </span>
              </div>
              <span className="text-sm text-gray-600">{page.count} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard