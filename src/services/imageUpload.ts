const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'demo-key';
const IMGBB_EXPIRATION = import.meta.env.VITE_IMGBB_EXPIRATION || '259200'; // 3 days default

export const uploadToImgBB = async (base64Image: string): Promise<string> => {
  try {
    if (IMGBB_API_KEY === 'demo-key') {
      console.warn('Using demo ImgBB key. Please set VITE_IMGBB_API_KEY in .env file');
      // Return a placeholder image URL for demo
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
    
    // Remove data:image/png;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', cleanBase64);
    formData.append('expiration', IMGBB_EXPIRATION); // 3 days in seconds (3 * 24 * 60 * 60)

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    // Return the original base64 as fallback
    console.warn('Falling back to base64 image');
    return base64Image;
  }
};