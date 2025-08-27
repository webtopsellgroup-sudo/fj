import { FormData } from '../types/FormData';

const STORAGE_KEY = 'bankCommitmentForms';

export const saveToLocalStorage = (data: FormData): string => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const forms = existing ? JSON.parse(existing) : {};
    
    const id = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    forms[id] = { ...data, id, savedAt: new Date().toISOString() };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
    return id;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
};

export const getFromLocalStorage = (id: string): FormData | null => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return null;
    
    const forms = JSON.parse(existing);
    return forms[id] || null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const getAllFromLocalStorage = (): Record<string, FormData> => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : {};
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
};

export const deleteFromLocalStorage = (id: string): boolean => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return false;
    
    const forms = JSON.parse(existing);
    if (forms[id]) {
      delete forms[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
}