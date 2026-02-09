export async function uploadPhoto({
  file,
  slotWidth,
  slotHeight,
  scale = 3,
}) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = slotWidth * scale;
      canvas.height = slotHeight * scale;

      ctx.scale(scale, scale);

      // ---- crop center ----
      const imgRatio = img.width / img.height;
      const slotRatio = slotWidth / slotHeight;

      let sx, sy, sWidth, sHeight;
      if (slotRatio > imgRatio) {
        sWidth = img.width;
        sHeight = img.width / slotRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      } else {
        sWidth = img.height * slotRatio;
        sHeight = img.height;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      }

      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        slotWidth,
        slotHeight
      );

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    reader.readAsDataURL(file);
  });
}
