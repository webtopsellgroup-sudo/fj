export interface FormData {
  fullName?: string;
  position?: string;
  signatureUrl?: string;
  submittedAt: string;
}

export interface WebhookPayload extends FormData {
  id: string;
  localStorageKey: string;
}