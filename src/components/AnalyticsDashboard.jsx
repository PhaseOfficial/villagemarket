import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  FaUsers,
  FaEye,
  FaClock,
  FaDesktop,
  FaMobile,
  FaTablet,
  FaGlobeAmericas,
  FaChartBar,
  FaCalendarAlt
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

      // 1. Fetch total visits
      const { count: totalVisits, error: visitsError } = await supabase
        .from('website_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (visitsError) throw visitsError

      // 2. Fetch unique visitors
      const { data: uniqueVisitors, error: uniqueError } = await supabase
        .from('website_visits')
        .select('session_id')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      if (uniqueError) throw uniqueError

      const uniqueVisitorCount = new Set(uniqueVisitors.map(v => v.session_id)).size

      // 3. Fetch average time on page
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

      // 4. Fetch page views
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

      // 5. Fetch device statistics
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
        totalVisits: totalVisits || 0,
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
      case '1d': start.setDate(start.getDate() - 1); break
      case '7d': start.setDate(start.getDate() - 7); break
      case '30d': start.setDate(start.getDate() - 30); break
      case '90d': start.setDate(start.getDate() - 90); break
      default: start.setDate(start.getDate() - 7);
    }

    return { start: start.toISOString(), end: end.toISOString() }
  }

  // --- GLASS STAT CARD COMPONENT ---
  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm p-6 flex items-start space-x-4 hover:shadow-md transition-all duration-300">
      <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{loading ? '-' : value}</p>
        {subtitle && <p className="text-xs text-emerald-600 font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  )

  if (loading && !stats.totalVisits) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pt-4 pb-12">
      
      {/* Background Blobs (for consistency) */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <FaChartBar size={24} />
              </div>
              Website Analytics
            </h2>
            <p className="text-slate-500 mt-1 ml-14">Track your store's performance and visitor growth.</p>
          </div>

          {/* Time Range Selector */}
          <div className="relative group">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer appearance-none min-w-[160px]"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaEye}
            title="Total Visits"
            value={stats.totalVisits?.toLocaleString()}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaUsers}
            title="Unique Visitors"
            value={stats.uniqueVisitors?.toLocaleString()}
            color="bg-purple-500"
          />
          <StatCard
            icon={FaClock}
            title="Avg. Time"
            value={`${stats.avgTimeOnPage}s`}
            color="bg-amber-500"
          />
          <StatCard
            icon={FaGlobeAmericas}
            title="Bounce Rate"
            value={`${Math.round((1 - stats.uniqueVisitors / Math.max(stats.totalVisits, 1)) * 100)}%`}
            color="bg-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Pages Table */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Top Viewed Pages
            </h3>
            
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Page</th>
                    <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider pr-4">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.pageViews.map((page, index) => (
                    <tr key={page.path} className="hover:bg-white/50 transition-colors">
                      <td className="py-3 pl-4">
                        <div className="flex items-center">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${index < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] md:max-w-sm">
                            {page.path === '/' ? 'Home / Storefront' : page.path.replace('/', '')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className="inline-block bg-slate-100 px-2 py-1 rounded-md text-xs font-bold text-slate-600">
                          {page.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.pageViews.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-8 text-center text-slate-400 text-sm">
                        No page views recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Devices
            </h3>
            
            <div className="space-y-4">
              {stats.deviceStats && Object.entries(stats.deviceStats).length > 0 ? (
                Object.entries(stats.deviceStats).map(([device, count]) => {
                  const percentage = ((count / stats.totalVisits) * 100).toFixed(1);
                  return (
                    <div key={device} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {device === 'desktop' && <FaDesktop />}
                            {device === 'mobile' && <FaMobile />}
                            {device === 'tablet' && <FaTablet />}
                            {!['desktop', 'mobile', 'tablet'].includes(device) && <FaGlobeAmericas />}
                          </div>
                          <span className="text-sm font-medium text-slate-700 capitalize">{device}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
              ) : (
                 <div className="text-center py-10 text-slate-400 text-sm">
                   No device data available.
                 </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard