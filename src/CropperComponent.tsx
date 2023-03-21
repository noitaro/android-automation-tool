import React from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

export interface CropperComponentHandles {
  getCropImg(): { src: string } | null;
}

export const CropperComponent = React.forwardRef((props: { src: string, height: string, width: string, }, ref) => {
  const { src, height, width } = props;
  const cropperRef = React.useRef<ReactCropperElement>(null);

  React.useImperativeHandle(ref, () => ({
    getCropImg() {
      const cropper = cropperRef.current?.cropper;
      const canvas = cropper?.getCroppedCanvas();
      if (canvas == null) return null;
      return { src: canvas.toDataURL() };
    }
  }));

  return (
    <Cropper
      src={src}
      style={{ height: height, width: width }}
      // Cropper.js options
      initialAspectRatio={16 / 9}
      // guides={false}
      // crop={onCrop}
      ref={cropperRef}
    />
  );
});
