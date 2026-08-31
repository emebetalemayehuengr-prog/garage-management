const MAX_IMAGE_BYTES = 650 * 1024;

export const readProfileImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file || !['image/png', 'image/jpeg'].includes(file.type)) {
      reject(new Error('Please choose a PNG or JPG image.'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Image must be smaller than 650 KB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
