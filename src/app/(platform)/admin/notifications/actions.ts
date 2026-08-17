'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { retryFailedNotification } from '@/data/notifications'
import { processBusinessNotificationJobs } from '@/lib/notifications/worker'

const jobIdSchema = z.string().uuid()

export async function retryNotificationAction(formData: FormData) {
  const parsed = jobIdSchema.safeParse(formData.get('jobId'))
  if (!parsed.success) return
  const businessId = jobIdSchema.safeParse(formData.get('businessId'))

  const retried = await retryFailedNotification(parsed.data)
  if (retried) {
    await processBusinessNotificationJobs({ limit: 1, jobId: parsed.data })
  }
  revalidatePath('/admin/notifications')
  if (businessId.success) {
    revalidatePath(`/admin/notifications/${businessId.data}`)
  }
}
