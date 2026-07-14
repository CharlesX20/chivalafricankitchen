import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 1. Mark the client factory function as async
export async function createClient() {
  // 2. Await the native cookies store helper
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // 3. Mark the setAll loop as async
        async setAll(cookiesToSet) {
          try {
            // 4. Safely loop and await each individual cookie transformation
            for (const { name, value, options } of cookiesToSet) {
              await cookieStore.set(name, value, {
                ...options,
                maxAge: 60 * 60 * 24 * 30, // 30 days
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            }
          } catch {
            // Next.js Server Components safely throw an exception here 
            // if cookies are mutated during layout rendering.
          }
        },
      },
    }
  )
}
