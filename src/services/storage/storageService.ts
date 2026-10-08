import { supabase, isSupabaseConfigured } from '../supabase/client';

/**
 * Resizes and compresses an image file to a lightweight data URL
 * Ensures instant UI updates and seamless persistence even if remote bucket is offline
 */
async function compressImageToDataUrl(file: File, maxDim = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof reader.result === 'string' ? reader.result : '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  /**
   * Upload member profile picture to Supabase Storage
   * Returns the persistent image URL
   */
  async uploadProfilePicture(innovaId: string, file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file (JPG, PNG, WEBP)');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Profile picture must be under 5MB');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${innovaId}_${Date.now()}.${fileExt}`;

    // Try Supabase Storage if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            // Also sync to Supabase profiles table directly
            try {
              await supabase
                .from('profiles')
                .update({ avatar_url: publicData.publicUrl, updated_at: new Date().toISOString() })
                .eq('innova_id', innovaId);
            } catch {
              // ignore table update failure here as store sync will handle it
            }
            return publicData.publicUrl;
          }
        } else if (error) {
          console.warn('Supabase storage upload returned error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase storage upload exception:', err?.message || err);
      }
    }

    // High-fidelity compressed persistent data URL fallback
    const compressedUrl = await compressImageToDataUrl(file);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: compressedUrl, updated_at: new Date().toISOString() })
          .eq('innova_id', innovaId);
      } catch {
        // ignore
      }
    }
    return compressedUrl;
  },

  /**
   * Upload payment verification receipt screenshot to Supabase Storage
   */
  async uploadPaymentScreenshot(innovaId: string, file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file for screenshot');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Screenshot must be under 5MB');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${innovaId}_${Date.now()}.${fileExt}`;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .upload(filePath, file, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            return publicData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage receipt upload fallback:', err);
      }
    }

    return compressImageToDataUrl(file, 600, 0.8);
  },
};

