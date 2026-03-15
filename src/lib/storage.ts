import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; } // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (blob) => { blob ? resolve(blob) : reject(new Error('Compression failed')); },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export async function uploadListingImages(files: File[], listingId: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i]);
    const ext = files[i].name.split('.').pop() || 'jpg';
    const path = `listings/${listingId}/${Date.now()}_${i}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const compressed = await compressImage(file, 400, 0.85);
  const path = `avatars/${userId}/avatar.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadDealerLogo(file: File, dealerId: string): Promise<string> {
  const compressed = await compressImage(file, 400, 0.85);
  const path = `dealers/${dealerId}/logo.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadDealerCover(file: File, dealerId: string): Promise<string> {
  const compressed = await compressImage(file, 1600, 0.85);
  const path = `dealers/${dealerId}/cover.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function deleteImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch {
    // file may not exist
  }
}

export async function downloadExternalImage(url: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}
