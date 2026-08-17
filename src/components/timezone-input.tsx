import { reportingTimezones } from '@/lib/agency-business/timezones'
import { fieldClass } from '@/components/onboarding/form-primitives'

export function TimezoneInput({
  id,
  defaultValue,
}: {
  id: string
  defaultValue: string
}) {
  const optionsId = `${id}-options`

  return (
    <>
      <input
        id={id}
        name="timezone"
        className={fieldClass}
        defaultValue={defaultValue}
        list={optionsId}
        placeholder="Search by city or timezone"
        autoComplete="off"
        spellCheck={false}
        required
      />
      <datalist id={optionsId}>
        {reportingTimezones.map((timezone) => (
          <option
            key={timezone.value}
            value={timezone.value}
            label={timezone.label}
          />
        ))}
      </datalist>
    </>
  )
}
