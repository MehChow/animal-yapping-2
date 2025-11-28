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
  const pixelRatio = window.devicePixelRatio || 1;

  const size = Math.min(crop.width, crop.height);
  const sourceWidth = size * scaleX;
  const sourceHeight = size * scaleY;

  canvas.width = size * pixelRatio;
  canvas.height = size * pixelRatio;

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
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
    size,
    size
  );

  return canvas.toDataURL("image/png");
};

