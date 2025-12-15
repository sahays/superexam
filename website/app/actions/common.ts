'use server'

import { revalidatePath } from "next/cache"

export async function refreshRoute(path: string) {
  revalidatePath(path)
}
