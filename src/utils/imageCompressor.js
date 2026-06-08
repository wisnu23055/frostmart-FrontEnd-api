/**
 * Utility function to compress images using Canvas API on client-side.
 * Resizes the image to fit within maxWidth/maxHeight and compresses quality.
 * 
 * @param {File} file - The original input file
 * @param {number} maxWidth - Maximum width of the output image (default: 1024)
 * @param {number} maxHeight - Maximum height of the output image (default: 1024)
 * @param {number} quality - Compression quality between 0.1 and 1.0 (default: 0.7)
 * @returns {Promise<File>} - Resolves with the compressed File object
 */
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      return resolve(file); // Return original if not an image
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob (JPEG format with specified quality)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object from the blob, renaming extension to .jpg
              const compressedFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, "") + ".jpg", 
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
