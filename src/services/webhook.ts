import { WebhookPayload } from '../types/FormData';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://webhook.site/demo';

export const sendToWebhook = async (data: WebhookPayload): Promise<boolean> => {
  try {
    console.log('Sending data to webhook:', WEBHOOK_URL);
    console.log('Webhook payload:', data);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors'
    });

    if (!response.ok) {
      console.warn(`Webhook returned status: ${response.status}`);
      // Don't throw error for webhook failures, just log them
      return true;
    }
    
    console.log('Webhook sent successfully');

    return true;
  } catch (error) {
    console.warn('Webhook error (continuing anyway):', error);
    // Don't throw error for webhook failures in demo mode
    return true;
  }
};