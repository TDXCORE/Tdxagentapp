import { createClientSide } from "./supabase/client"

export async function debugAuth() {
  try {
    const supabase = createClientSide()

    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    return {
      hasSession: !!sessionData?.session,
      user: userData?.user
        ? {
            id: userData.user.id,
            email: userData.user.email,
          }
        : null,
      sessionExpires: sessionData?.session?.expires_at,
      errors: {
        session: sessionError?.message,
        user: userError?.message,
      },
    }
  } catch (error: any) {
    return {
      error: error.message,
      stack: error.stack,
    }
  }
}
