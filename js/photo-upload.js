/**
 * Photo Upload Module
 * Handles file selection, preview, and canvas-based compression.
 */

const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.7;

/**
 * Compress an image file using canvas
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 dataURL of compressed image
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if wider than MAX_WIDTH
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = function () {
        reject(new Error('Failed to load image'));
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Create a photo uploader component
 * @param {Function} onPhotoSelected - Callback receiving the base64 dataURL string
 * @returns {HTMLElement} The uploader DOM element
 */
export function createPhotoUploader(onPhotoSelected) {
  const container = document.createElement('div');
  container.className = 'photo-uploader';

  const dropZone = document.createElement('div');
  dropZone.className = 'photo-uploader__dropzone';

  const label = document.createElement('label');
  label.className = 'photo-uploader__label';
  label.textContent = 'Click or drag a photo here';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.className = 'photo-uploader__input';
  input.setAttribute('aria-label', 'Upload a photo');

  const preview = document.createElement('div');
  preview.className = 'photo-uploader__preview';
  preview.style.display = 'none';

  const previewImg = document.createElement('img');
  previewImg.className = 'photo-uploader__preview-img';
  previewImg.alt = 'Photo preview';
  preview.appendChild(previewImg);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'photo-uploader__remove';
  removeBtn.textContent = 'Remove';
  removeBtn.setAttribute('aria-label', 'Remove photo');
  removeBtn.style.display = 'none';

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    try {
      dropZone.classList.add('photo-uploader__dropzone--loading');
      const dataUrl = await compressImage(file);
      previewImg.src = dataUrl;
      preview.style.display = 'block';
      removeBtn.style.display = 'inline-block';
      dropZone.style.display = 'none';
      if (onPhotoSelected) onPhotoSelected(dataUrl);
    } catch (err) {
      console.warn('Photo upload failed:', err.message);
    } finally {
      dropZone.classList.remove('photo-uploader__dropzone--loading');
    }
  }

  input.addEventListener('change', function () {
    if (input.files && input.files[0]) {
      handleFile(input.files[0]);
    }
  });

  // Drag and drop
  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropZone.classList.add('photo-uploader__dropzone--active');
  });

  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('photo-uploader__dropzone--active');
  });

  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('photo-uploader__dropzone--active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  removeBtn.addEventListener('click', function () {
    previewImg.src = '';
    preview.style.display = 'none';
    removeBtn.style.display = 'none';
    dropZone.style.display = '';
    input.value = '';
    if (onPhotoSelected) onPhotoSelected(null);
  });

  dropZone.appendChild(label);
  dropZone.appendChild(input);
  container.appendChild(dropZone);
  container.appendChild(preview);
  container.appendChild(removeBtn);

  // Public method to set existing photo
  container.setPhoto = function (dataUrl) {
    if (dataUrl) {
      previewImg.src = dataUrl;
      preview.style.display = 'block';
      removeBtn.style.display = 'inline-block';
      dropZone.style.display = 'none';
    }
  };

  return container;
}

export default { createPhotoUploader };
