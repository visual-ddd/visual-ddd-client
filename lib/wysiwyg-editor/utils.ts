import { MAX_IMAGE_SIZE } from './constants';

export function isValidImage(file: File) {
  return file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE;
}

export function transformFileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
