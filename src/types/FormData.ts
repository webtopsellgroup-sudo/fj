export interface FormData {
  signatureUrl?: string;
  submittedAt: string;
}

export interface WebhookPayload extends FormData {
  id: string;
  localStorageKey: string;
}