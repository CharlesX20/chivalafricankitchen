import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle auth errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/?error=auth_failed&message=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch (err) {
      console.error('Error exchanging code for session:', err)
      return NextResponse.redirect(
        new URL('/?error=session_failed', requestUrl.origin)
      )
    }
  }

  // Get the user session
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error('Error getting user:', userError)
    return NextResponse.redirect(
      new URL('/?error=user_not_found', requestUrl.origin)
    )
  }

  if (user) {
    try {
      const adminClient = createAdminClient()
      
      // Check if profile exists
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      // Only create profile if it doesn't exist
      if (!existingProfile) {
        const phone = user.user_metadata?.phone || ''
        
        const { error: insertError } = await adminClient
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email!,
            phone: phone,
            full_name: user.user_metadata?.full_name || '',
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
          // Don't block the user, just log the error
        }
      }
    } catch (err) {
      console.error('Error in profile creation:', err)
      // Don't block the user
    }
  }

  // Redirect to home page with success param
  return NextResponse.redirect(
    new URL('/?auth=success', requestUrl.origin)
  )
}