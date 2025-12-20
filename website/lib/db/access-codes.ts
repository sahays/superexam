import { db, collection } from './firebase'

export interface AccessCode {
  id: string
  code: string
  expiresAt: number
  maxUses: number
  currentUses: number
  isAdmin: boolean
  active: boolean
  description?: string
  createdBy: string
  createdAt: number
}

export async function getAccessCode(code: string) {
  try {
    const snapshot = await db
      .collection(collection('access-codes'))
      .where('code', '==', code)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as AccessCode
  } catch (error) {
    console.error('Get access code error:', error)
    return null
  }
}

export async function getAllAccessCodes() {
  try {
    const snapshot = await db
      .collection(collection('access-codes'))
      .orderBy('createdAt', 'desc')
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AccessCode))
  } catch (error) {
    console.error('Get all access codes error:', error)
    return []
  }
}

export async function createAccessCode(data: Omit<AccessCode, 'id' | 'createdAt' | 'currentUses'>) {
  try {
    const docRef = db.collection(collection('access-codes')).doc()

    const newCode: Omit<AccessCode, 'id'> = {
      ...data,
      currentUses: 0,
      createdAt: Date.now()
    }

    await docRef.set(newCode)

    return {
      id: docRef.id,
      ...newCode
    }
  } catch (error) {
    console.error('Create access code error:', error)
    throw error
  }
}

export async function updateAccessCode(id: string, updates: Partial<AccessCode>) {
  try {
    await db
      .collection(collection('access-codes'))
      .doc(id)
      .update(updates)
  } catch (error) {
    console.error('Update access code error:', error)
    throw error
  }
}

export async function deleteAccessCode(id: string) {
  try {
    await db
      .collection(collection('access-codes'))
      .doc(id)
      .delete()
  } catch (error) {
    console.error('Delete access code error:', error)
    throw error
  }
}

export async function incrementCodeUsage(id: string) {
  try {
    const docRef = db.collection(collection('access-codes')).doc(id)
    const doc = await docRef.get()

    if (doc.exists) {
      const currentUses = (doc.data()?.currentUses || 0) + 1
      await docRef.update({ currentUses })
    }
  } catch (error) {
    console.error('Increment code usage error:', error)
    throw error
  }
}

/**
 * Ensures the admin code from environment variable exists in Firestore.
 * Creates it automatically if it doesn't exist.
 */
export async function ensureAdminCode() {
  const adminCode = process.env.ADMIN_CODE

  if (!adminCode) {
    console.warn('ADMIN_CODE not set in environment variables')
    return
  }

  try {
    // Check if code already exists
    const existing = await getAccessCode(adminCode)

    if (existing) {
      // Admin code already exists
      return
    }

    // Create admin code
    await createAccessCode({
      code: adminCode,
      expiresAt: 9999999999999, // Far future (effectively permanent)
      maxUses: 999999, // Very high limit
      isAdmin: true,
      active: true,
      description: 'Auto-generated admin access from ADMIN_CODE env',
      createdBy: 'system'
    })

    console.log('Admin code created successfully from ADMIN_CODE env variable')
  } catch (error) {
    console.error('Failed to ensure admin code:', error)
  }
}
