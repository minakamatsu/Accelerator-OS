export type OnboardingActionState = {
  status: 'idle' | 'success' | 'error'
  message: string | null
  errors?: Record<string, string[] | undefined>
}

export const initialOnboardingActionState: OnboardingActionState = {
  status: 'idle',
  message: null,
}
