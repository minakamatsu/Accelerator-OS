'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  detectAvatar,
  maxAvatarBytes,
  type AvatarDetails,
} from '@/lib/profile/avatar'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(80, 'Keep the display name under 80 characters.'),
})

export type ProfileSettingsState = {
  status: 'idle' | 'success' | 'error'
  message: string | null
  errors?: { displayName?: string[]; avatar?: string[] }
}

function refreshProfileSurfaces() {
  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}

export async function updateProfileSettings(
  _previousState: ProfileSettingsState,
  formData: FormData,
): Promise<ProfileSettingsState> {
  void _previousState

  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Profile changes are not connected in this environment.',
    }
  }

  const validated = profileSchema.safeParse({
    displayName: formData.get('displayName'),
  })
  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the highlighted profile field.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const suppliedAvatar = formData.get('avatar')
  const avatar =
    suppliedAvatar instanceof File && suppliedAvatar.size > 0
      ? suppliedAvatar
      : null

  if (avatar && avatar.size > maxAvatarBytes) {
    return {
      status: 'error',
      message: 'Choose a smaller profile picture.',
      errors: { avatar: ['Profile pictures must be 2 MB or smaller.'] },
    }
  }

  let avatarDetails: AvatarDetails | null = null
  if (avatar) {
    const header = new Uint8Array(await avatar.slice(0, 12).arrayBuffer())
    avatarDetails = detectAvatar(header, avatar.type)
    if (!avatarDetails) {
      return {
        status: 'error',
        message: 'Choose a supported image file.',
        errors: { avatar: ['Use a genuine JPG, PNG, or WebP image.'] },
      }
    }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const userId = claimsError ? null : claimsData?.claims?.sub
  if (typeof userId !== 'string') {
    return {
      status: 'error',
      message: 'Your session expired. Sign in again before saving changes.',
    }
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .single()
  if (currentProfileError || !currentProfile) {
    return {
      status: 'error',
      message: 'Your profile could not be loaded. Refresh and try again.',
    }
  }

  let nextAvatarPath = currentProfile.avatar_path
  if (avatar && avatarDetails) {
    nextAvatarPath = `${userId}/avatar.${avatarDetails.extension}`
    const { error: uploadError } = await supabase.storage
      .from('profile-avatars')
      .upload(nextAvatarPath, avatar, {
        cacheControl: '0',
        contentType: avatarDetails.contentType,
        upsert: true,
      })

    if (uploadError) {
      return {
        status: 'error',
        message: 'The profile picture could not be saved. Try again.',
      }
    }
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: validated.data.displayName,
      avatar_path: nextAvatarPath,
    })
    .eq('id', userId)
    .select('id')
    .single()

  if (updateError || !updatedProfile) {
    return {
      status: 'error',
      message: 'The profile could not be saved. Refresh and try again.',
    }
  }

  if (
    avatar &&
    currentProfile.avatar_path &&
    currentProfile.avatar_path !== nextAvatarPath
  ) {
    await supabase.storage
      .from('profile-avatars')
      .remove([currentProfile.avatar_path])
  }

  refreshProfileSurfaces()
  return {
    status: 'success',
    message: avatar
      ? 'Your name and profile picture were updated.'
      : 'Your display name was updated.',
  }
}

export async function removeProfilePicture(
  _previousState: ProfileSettingsState,
  _formData: FormData,
): Promise<ProfileSettingsState> {
  void _previousState
  void _formData

  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Profile changes are not connected in this environment.',
    }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const userId = claimsError ? null : claimsData?.claims?.sub
  if (typeof userId !== 'string') {
    return {
      status: 'error',
      message: 'Your session expired. Sign in again before saving changes.',
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .single()
  if (profileError || !profile) {
    return {
      status: 'error',
      message: 'Your profile could not be loaded. Refresh and try again.',
    }
  }

  if (!profile.avatar_path) {
    return { status: 'success', message: 'No profile picture was stored.' }
  }

  const { error: removeError } = await supabase.storage
    .from('profile-avatars')
    .remove([profile.avatar_path])
  if (removeError) {
    return {
      status: 'error',
      message: 'The profile picture could not be removed. Try again.',
    }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('id', userId)
  if (updateError) {
    return {
      status: 'error',
      message:
        'The picture was deleted, but the profile needs a refresh before it disappears.',
    }
  }

  refreshProfileSurfaces()
  return { status: 'success', message: 'Your profile picture was removed.' }
}
