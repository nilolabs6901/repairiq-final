import { isNative } from './platform';

export interface PickedImage {
  dataUrl: string; // base64 data URL
}

/**
 * Pick an image from the device camera or gallery.
 * Uses Capacitor Camera plugin on native, returns null on web (web uses react-dropzone).
 */
export async function pickImageNative(source: 'camera' | 'gallery'): Promise<PickedImage | null> {
  if (!isNative()) return null;

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
    width: 1200,
    height: 1200,
  });

  if (!photo.dataUrl) return null;
  return { dataUrl: photo.dataUrl };
}
