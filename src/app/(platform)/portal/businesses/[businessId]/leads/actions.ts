'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import {
  leadNoteSchema,
  leadStatusMutationSchema,
  leadValueMutationSchema,
  type FormActionState,
} from '@/lib/leads/schemas'
import { createClient } from '@/lib/supabase/server'

function value(formData: FormData, name: string): string {
  const entry = formData.get(name)
  return typeof entry === 'string' ? entry : ''
}

function paths(businessId: string, leadId: string) {
  return {
    pipeline: `/portal/businesses/${businessId}/leads`,
    detail: `/portal/businesses/${businessId}/leads/${leadId}`,
  }
}

export async function updateLeadStatus(
  businessId: string,
  leadId: string,
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAuthenticatedUser()
  const parsed = leadStatusMutationSchema.safeParse({
    status: value(formData, 'status'),
    lossReason: value(formData, 'lossReason'),
  })
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Review the status details.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_lead_status', {
    requested_business_id: businessId,
    requested_lead_id: leadId,
    requested_status: parsed.data.status,
    requested_loss_reason: parsed.data.lossReason ?? undefined,
  })
  if (error || !data) {
    return {
      status: 'error',
      message: 'The status could not be updated. Your access may have changed.',
    }
  }

  const route = paths(businessId, leadId)
  revalidatePath(route.pipeline)
  revalidatePath(route.detail)
  return { status: 'success', message: 'Lead status updated.' }
}

export async function updateLeadValues(
  businessId: string,
  leadId: string,
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAuthenticatedUser()
  const parsed = leadValueMutationSchema.safeParse({
    estimatedValueMinor: value(formData, 'estimatedValueMinor'),
    wonValueMinor: value(formData, 'wonValueMinor'),
  })
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Enter valid non-negative dollar amounts.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_lead_values', {
    requested_business_id: businessId,
    requested_lead_id: leadId,
    requested_estimated_value_minor:
      parsed.data.estimatedValueMinor ?? (null as never),
    requested_won_value_minor: parsed.data.wonValueMinor ?? (null as never),
  })
  if (error || !data) {
    return {
      status: 'error',
      message: 'The values could not be saved. Your access may have changed.',
    }
  }

  const route = paths(businessId, leadId)
  revalidatePath(route.pipeline)
  revalidatePath(route.detail)
  return { status: 'success', message: 'Recorded values updated.' }
}

export async function addLeadNote(
  businessId: string,
  leadId: string,
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAuthenticatedUser()
  const parsed = leadNoteSchema.safeParse({ body: value(formData, 'body') })
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Add a note before saving.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('add_lead_note', {
    requested_business_id: businessId,
    requested_lead_id: leadId,
    requested_body: parsed.data.body,
  })
  if (error || !data) {
    return {
      status: 'error',
      message: 'The note could not be saved. Your access may have changed.',
    }
  }

  const route = paths(businessId, leadId)
  revalidatePath(route.pipeline)
  revalidatePath(route.detail)
  return { status: 'success', message: 'Internal note added.' }
}
