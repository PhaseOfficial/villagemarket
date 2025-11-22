import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

class VisitTracker {
  constructor() {
    this.sessionId = this.getSessionId()
    this.pageStartTime = Date.now()
    this.currentPage = ''
  }

  getSessionId() {
    let sessionId = localStorage.getItem('website_session_id')
    if (!sessionId) {
      sessionId = this.generateSessionId()
      localStorage.setItem('website_session_id', sessionId)
    }
    return sessionId
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  async trackPageView(pagePath, user = null) {
    const timeOnPreviousPage = Date.now() - this.pageStartTime
    this.pageStartTime = Date.now()

    // Don't track if it's the same page (hash routing can cause multiple triggers)
    if (this.currentPage === pagePath) return

    this.currentPage = pagePath

    try {
      // Get visitor information
      const visitorInfo = await this.getVisitorInfo()

      const visitData = {
        session_id: this.sessionId,
        user_id: user?.id || null,
        page_path: pagePath,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        ip_address: visitorInfo.ip,
        country: visitorInfo.country,
        city: visitorInfo.city,
        device_type: this.getDeviceType(),
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        time_on_page: Math.floor(timeOnPreviousPage / 1000) // Convert to seconds
      }

      const { error } = await supabase
        .from('website_visits')
        .insert([visitData])

      if (error) {
        console.error('Error tracking visit:', error)
      }
    } catch (error) {
      console.error('Error in trackPageView:', error)
    }
  }

  async getVisitorInfo() {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return {
        ip: data.ip,
        country: data.country_name,
        city: data.city
      }
    } catch (error) {
      console.error('Error getting visitor info:', error)
      return {
        ip: null,
        country: null,
        city: null
      }
    }
  }

  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|phone/.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  // Track time on page when user leaves
  trackTimeOnPage() {
    const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000)
    if (timeSpent > 0 && this.currentPage) {
      // Update the last visit record with actual time spent
      this.updateTimeOnPage(this.currentPage, timeSpent)
    }
  }

  async updateTimeOnPage(pagePath, timeSpent) {
    try {
      const { error } = await supabase
        .from('website_visits')
        .update({ time_on_page: timeSpent })
        .eq('session_id', this.sessionId)
        .eq('page_path', pagePath)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error updating time on page:', error)
      }
    } catch (error) {
      console.error('Error in updateTimeOnPage:', error)
    }
  }
}

// Singleton instance
const visitTracker = new VisitTracker()

export const useVisitTracker = () => {
  const location = useLocation()
  const { user } = useAuth()
  const previousPath = useRef('')

  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash

    // Don't track if it's the same path
    if (previousPath.current === currentPath) return

    previousPath.current = currentPath

    // Track the page view
    visitTracker.trackPageView(currentPath, user)

    // Set up beforeunload to track time when user leaves
    const handleBeforeUnload = () => {
      visitTracker.trackTimeOnPage()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup function to track time when component unmounts
    return () => {
      visitTracker.trackTimeOnPage()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [location, user])

  return visitTracker
}

export default visitTracker