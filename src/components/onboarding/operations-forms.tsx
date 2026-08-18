'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import {
  addRecipientAction,
  deleteAssetAction,
  deleteRecipientAction,
  deleteServiceAction,
  saveServiceAction,
  uploadAssetAction,
} from '@/app/(platform)/admin/businesses/[businessId]/onboarding/actions'
import { initialOnboardingActionState } from '@/lib/onboarding/action-state'
import type {
  OnboardingAsset,
  OnboardingRecipient,
  OnboardingService,
} from '@/lib/onboarding/types'
import {
  ActionMessage,
  Field,
  fieldClass,
  SubmitButton,
} from './form-primitives'

function ServiceForm({
  businessId,
  service,
}: {
  businessId: string
  service?: OnboardingService
}) {
  const action = saveServiceAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  const prefix = service?.id ?? 'new-service'

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="serviceId" value={service?.id ?? ''} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Service name"
          htmlFor={`${prefix}-name`}
          error={state.errors?.name}
        >
          <input
            id={`${prefix}-name`}
            name="name"
            defaultValue={service?.name ?? ''}
            className={fieldClass}
            placeholder="Example: Brake repair"
            required
          />
        </Field>
        <Field
          label="Service slug"
          htmlFor={`${prefix}-slug`}
          error={state.errors?.slug}
        >
          <input
            id={`${prefix}-slug`}
            name="slug"
            defaultValue={service?.slug ?? ''}
            className={fieldClass}
            placeholder="brake-repair"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
        </Field>
      </div>
      <Field
        label="Verified description"
        htmlFor={`${prefix}-description`}
        error={state.errors?.shortDescription}
      >
        <textarea
          id={`${prefix}-description`}
          name="shortDescription"
          defaultValue={service?.shortDescription ?? ''}
          className={`${fieldClass} min-h-24 resize-y`}
          placeholder="Leave blank until the business confirms the wording"
        />
      </Field>
      <div className="flex flex-wrap items-end gap-5">
        <Field
          label="Display order"
          htmlFor={`${prefix}-order`}
          error={state.errors?.displayOrder}
        >
          <input
            id={`${prefix}-order`}
            name="displayOrder"
            type="number"
            min={0}
            max={999}
            defaultValue={service?.displayOrder ?? 0}
            className={`${fieldClass} w-32`}
          />
        </Field>
        <label className="flex min-h-12 items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={service?.isFeatured ?? false}
            className="size-4 accent-[var(--brand)]"
          />
          Featured
        </label>
        <label className="flex min-h-12 items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={service?.isActive ?? true}
            className="size-4 accent-[var(--brand)]"
          />
          Active
        </label>
      </div>
      <ActionMessage state={state} />
      <div>
        <SubmitButton>{service ? 'Save service' : 'Add service'}</SubmitButton>
      </div>
    </form>
  )
}

function ServiceEditor({
  businessId,
  service,
}: {
  businessId: string
  service: OnboardingService
}) {
  const deleteAction = deleteServiceAction.bind(null, businessId)
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialOnboardingActionState,
  )

  return (
    <details className="group rounded-2xl border border-[var(--line)] bg-[var(--control)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
        <span>
          <span className="font-black">{service.name}</span>
          <span className="mt-1 block text-xs font-bold text-[var(--ink-muted)]">
            /{service.slug} · {service.isActive ? 'Active' : 'Hidden'}
          </span>
        </span>
        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-black group-open:bg-[var(--signal)]">
          Edit
        </span>
      </summary>
      <div className="border-t border-[var(--line)] p-5">
        <ServiceForm businessId={businessId} service={service} />
        <form
          action={deleteFormAction}
          className="mt-6 border-t border-[var(--line)] pt-5"
        >
          <input type="hidden" name="serviceId" value={service.id} />
          <ActionMessage state={deleteState} />
          <div className="mt-3">
            <SubmitButton variant="danger" pendingLabel="Removing…">
              Remove service
            </SubmitButton>
          </div>
        </form>
      </div>
    </details>
  )
}

export function ServicesManager({
  businessId,
  services,
}: {
  businessId: string
  services: OnboardingService[]
}) {
  return (
    <div className="grid gap-6">
      {services.length ? (
        <div className="grid gap-3">
          {services.map((service) => (
            <ServiceEditor
              key={service.id}
              businessId={businessId}
              service={service}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm leading-6 text-[var(--ink-muted)]">
          No services have been verified yet.
        </div>
      )}
      <details
        className="rounded-2xl bg-[var(--surface-hover)] p-5"
        open={services.length === 0}
      >
        <summary className="cursor-pointer font-black text-[var(--brand-bright)]">
          Add a verified service
        </summary>
        <div className="mt-5">
          <ServiceForm businessId={businessId} />
        </div>
      </details>
    </div>
  )
}

function AssetCard({
  businessId,
  asset,
}: {
  businessId: string
  asset: OnboardingAsset
}) {
  const action = deleteAssetAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--control)]">
      <div className="relative aspect-[4/3] bg-[var(--surface-hover)]">
        {asset.previewUrl ? (
          <Image
            src={asset.previewUrl}
            alt={asset.altText ?? ''}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            unoptimized
          />
        ) : null}
      </div>
      <div className="grid gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--surface-hover)] px-3 py-1 text-xs font-black uppercase">
            {asset.kind}
          </span>
          <span className="text-xs font-bold text-[var(--ink-muted)]">
            Rights recorded
          </span>
        </div>
        <p className="text-sm font-bold">{asset.altText}</p>
        <p className="text-xs leading-5 text-[var(--ink-muted)]">
          Source: {asset.source}
        </p>
        <form action={formAction}>
          <input type="hidden" name="assetId" value={asset.id} />
          <ActionMessage state={state} />
          <div className="mt-3">
            <SubmitButton variant="danger" pendingLabel="Removing…">
              Remove image
            </SubmitButton>
          </div>
        </form>
      </div>
    </article>
  )
}

export function AssetsManager({
  businessId,
  assets,
}: {
  businessId: string
  assets: OnboardingAsset[]
}) {
  const action = uploadAssetAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  return (
    <div className="grid gap-7">
      {assets.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <AssetCard key={asset.id} businessId={businessId} asset={asset} />
          ))}
        </div>
      ) : null}
      <form
        action={formAction}
        className="grid gap-5 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-5 sm:p-6"
      >
        <div>
          <p className="font-black">Upload an approved image</p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">
            JPEG, PNG, or WebP up to 5 MB. Files stay private until a later
            public-site milestone deliberately publishes them.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Image file" htmlFor="asset-file">
            <input
              id="asset-file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--action)] file:px-3 file:py-2 file:text-xs file:font-black file:text-[var(--action-text)]`}
              required
            />
          </Field>
          <Field
            label="Asset role"
            htmlFor="asset-kind"
            error={state.errors?.kind}
          >
            <select
              id="asset-kind"
              name="kind"
              className={fieldClass}
              defaultValue="photo"
            >
              <option value="photo">Business photo</option>
              <option value="logo">Logo</option>
            </select>
          </Field>
        </div>
        <Field
          label="Accessible description"
          htmlFor="asset-alt"
          error={state.errors?.altText}
        >
          <input
            id="asset-alt"
            name="altText"
            className={fieldClass}
            placeholder="Describe what is visibly meaningful"
            required
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Source"
            htmlFor="asset-source"
            error={state.errors?.source}
          >
            <input
              id="asset-source"
              name="source"
              className={fieldClass}
              placeholder="Client upload, photographer, licensed library…"
              required
            />
          </Field>
          <Field
            label="Permission / license notes"
            htmlFor="asset-permission"
            error={state.errors?.permissionNotes}
          >
            <textarea
              id="asset-permission"
              name="permissionNotes"
              className={`${fieldClass} min-h-24 resize-y`}
              required
            />
          </Field>
        </div>
        <ActionMessage state={state} />
        <div>
          <SubmitButton pendingLabel="Uploading securely…">
            Upload approved image
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}

function RecipientRow({
  businessId,
  recipient,
}: {
  businessId: string
  recipient: OnboardingRecipient
}) {
  const action = deleteRecipientAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--control)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold">{recipient.address}</p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          {recipient.verifiedAt ? 'Verified' : 'Verification pending'}
        </p>
      </div>
      <form action={formAction}>
        <input type="hidden" name="recipientId" value={recipient.id} />
        <ActionMessage state={state} />
        <SubmitButton variant="danger" pendingLabel="Removing…">
          Remove
        </SubmitButton>
      </form>
    </li>
  )
}

export function RecipientsManager({
  businessId,
  recipients,
}: {
  businessId: string
  recipients: OnboardingRecipient[]
}) {
  const action = addRecipientAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  return (
    <div className="grid gap-5">
      {recipients.length ? (
        <ul className="grid gap-3">
          {recipients.map((recipient) => (
            <RecipientRow
              key={recipient.id}
              businessId={businessId}
              recipient={recipient}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--ink-muted)]">
          No shop notification address has been added yet.
        </div>
      )}
      <form
        action={formAction}
        className="grid gap-4 rounded-2xl bg-[var(--surface-hover)] p-5 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <Field
          label="Shop notification email"
          htmlFor="notification-email"
          error={state.errors?.email}
        >
          <input
            id="notification-email"
            name="email"
            type="email"
            className={fieldClass}
            placeholder="service@example.com"
            required
          />
        </Field>
        <SubmitButton pendingLabel="Adding…">Add recipient</SubmitButton>
        <div className="sm:col-span-2">
          <ActionMessage state={state} />
        </div>
      </form>
    </div>
  )
}
