import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import * as ImageManipulator from 'expo-image-manipulator';

async function compressImage(uri: string, maxWidth = 1200, quality = 0.8): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function uploadListingImages(uris: string[], listingId: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < uris.length; i++) {
    const compressed = await compressImage(uris[i]);
    const blob = await uriToBlob(compressed);
    const path = `listings/${listingId}/${Date.now()}_${i}.jpg`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

export async function uploadAvatar(uri: string, userId: string): Promise<string> {
  const compressed = await compressImage(uri, 400, 0.85);
  const blob = await uriToBlob(compressed);
  const path = `avatars/${userId}/avatar.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
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
