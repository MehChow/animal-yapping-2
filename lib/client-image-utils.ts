export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const getRoundedCroppedImage = async (
  image: HTMLImageElement,
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to create canvas");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Fixed size for profile icons (smaller for better performance and smaller base64)
  const targetSize = 200;

  const size = Math.min(crop.width, crop.height);
  const sourceWidth = size * scaleX;
  const sourceHeight = size * scaleY;

  canvas.width = targetSize;
  canvas.height = targetSize;

  ctx.imageSmoothingQuality = "high";
  ctx.beginPath();
  ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetSize,
    targetSize
  );

  // Use JPEG with quality compression to reduce file size
  return canvas.toDataURL("image/jpeg", 0.85);
};

