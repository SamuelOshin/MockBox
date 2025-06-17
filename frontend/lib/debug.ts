// Test file to debug authentication and API issues
import { supabase } from '../lib/supabase'
import { mockApi } from '../lib/api'

export async function testAuthAndApi() {
  console.log('=== Testing Authentication and API ===')
  
  try {
    // Test 1: Check Supabase connection
    console.log('1. Testing Supabase connection...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return { success: false, error: 'Session error', details: sessionError }
    }
    
    console.log('Session:', session ? 'Valid' : 'None')
    if (session) {
      console.log('User ID:', session.user?.id)
      console.log('Email:', session.user?.email)
      console.log('Token expires:', new Date(session.expires_at! * 1000))
    }
    
    // Test 2: Check API endpoint
    console.log('2. Testing API endpoint...')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    console.log('API URL:', apiUrl)
    
    // Test 3: Try fetching mocks
    console.log('3. Testing mock API...')
    const mocks = await mockApi.getAllMocks()
    console.log('Mocks fetched successfully:', mocks.length, 'items')
    
    return { success: true, mocksCount: mocks.length }
    
  } catch (error) {
    console.error('Test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', details: error }
  }
}
