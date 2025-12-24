'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createToken } from '@/lib/auth/jwt'
import {
  getAccessCode,
  getAllAccessCodes,
  createAccessCode as createCode,
  updateAccessCode,
  deleteAccessCode,
  incrementCodeUsage,
  ensureAdminCode,
  type AccessCode
} from '@/lib/db/access-codes'
import { withRateLimit, RateLimitPresets } from '@/lib/utils/server-action-limiter'

// Internal implementation (not exported)
async function validateAccessCodeInternal(code: string) {
  try {
    // Ensure admin code exists from env variable (if set)
    await ensureAdminCode()

    // Get code from database
    const accessCode = await getAccessCode(code)

    if (!accessCode) {
      return { error: 'Invalid access code' }
    }

    // Validate
    if (!accessCode.active) {
      return { error: 'This code has been deactivated' }
    }

    if (accessCode.expiresAt < Date.now()) {
      return { error: 'This code has expired' }
    }

    if (accessCode.currentUses >= accessCode.maxUses) {
      return { error: 'This code has reached its usage limit' }
    }

    // Increment usage
    await incrementCodeUsage(accessCode.id)

    // Create session token
    const now = Date.now()
    const token = createToken({
      code: accessCode.code,
      isAdmin: accessCode.isAdmin,
      grantedAt: now,
      expiresAt: now + (12 * 60 * 60 * 1000) // 12 hours
    })

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('access-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 // 12 hours
    })

    return { success: true, isAdmin: accessCode.isAdmin }
  } catch (error) {
    console.error('Validate access code error:', error)
    return { error: 'Failed to validate access code' }
  }
}

// Export with rate limiting (5 requests per 15 minutes)
export const validateAccessCode = withRateLimit(
  RateLimitPresets.auth,
  validateAccessCodeInternal
)

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('access-token')
  redirect('/access-code')
}

export async function getAccessCodes() {
  try {
    const codes = await getAllAccessCodes()
    return { success: true, codes }
  } catch (error) {
    console.error('Get access codes error:', error)
    return { error: 'Failed to fetch access codes' }
  }
}

// Internal implementation (not exported)
async function createAccessCodeInternal(data: {
  code: string
  daysValid: number
  maxUses: number
  isAdmin: boolean
  description?: string
}) {
  try {
    const expiresAt = Date.now() + (data.daysValid * 24 * 60 * 60 * 1000)

    const newCode = await createCode({
      code: data.code,
      expiresAt,
      maxUses: data.maxUses,
      isAdmin: data.isAdmin,
      active: true,
      description: data.description || '',
      createdBy: 'admin'
    })

    return { success: true, code: newCode }
  } catch (error) {
    console.error('Create access code error:', error)
    return { error: 'Failed to create access code' }
  }
}

// Export with rate limiting (5 requests per 15 minutes)
export const createAccessCode = withRateLimit(
  RateLimitPresets.auth,
  createAccessCodeInternal
)

// Internal implementation (not exported)
async function toggleCodeStatusInternal(id: string, active: boolean) {
  try {
    await updateAccessCode(id, { active })
    return { success: true }
  } catch (error) {
    console.error('Toggle code status error:', error)
    return { error: 'Failed to update code status' }
  }
}

// Export with rate limiting
export const toggleCodeStatus = withRateLimit(
  RateLimitPresets.auth,
  toggleCodeStatusInternal
)

// Internal implementation (not exported)
async function removeAccessCodeInternal(id: string) {
  try {
    await deleteAccessCode(id)
    return { success: true }
  } catch (error) {
    console.error('Remove access code error:', error)
    return { error: 'Failed to delete code' }
  }
}

// Export with rate limiting
export const removeAccessCode = withRateLimit(
  RateLimitPresets.auth,
  removeAccessCodeInternal
)
