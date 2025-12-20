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
  type AccessCode
} from '@/lib/db/access-codes'

export async function validateAccessCode(code: string) {
  try {
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
    cookies().set('access-token', token, {
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

export async function signOut() {
  cookies().delete('access-token')
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

export async function createAccessCode(data: {
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

export async function toggleCodeStatus(id: string, active: boolean) {
  try {
    await updateAccessCode(id, { active })
    return { success: true }
  } catch (error) {
    console.error('Toggle code status error:', error)
    return { error: 'Failed to update code status' }
  }
}

export async function removeAccessCode(id: string) {
  try {
    await deleteAccessCode(id)
    return { success: true }
  } catch (error) {
    console.error('Remove access code error:', error)
    return { error: 'Failed to delete code' }
  }
}
