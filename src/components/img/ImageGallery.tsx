import { useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { API_GET_PROXY } from "@/lib/api";
interface ImageGalleryProps {
  images: string[];
}

const isImage = (url: string) => /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(url);
const isVideo = (url: string) => /\.(mp4|mov|webm|ogg)$/i.test(url);

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [index, setIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false); // Track loading state

  const handleOpen = (i: number) => {
    setIndex(i);
    setIsOpen(true);
    setIsLoaded(false); // Reset loading state when opening
  };

  const currentFile = images[index];
  const proxyUrl = `${API_GET_PROXY}${currentFile}`;

  return (
    <div>
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap p-2">
        {images.map((img, i) => (
          isImage(img) ? (
            <img
              key={i}
              src={`${API_GET_PROXY}${img}`}
              alt={`Thumbnail ${i}`}
              className="w-24 h-24 cursor-pointer rounded-lg border flex-shrink-0"
              onClick={() => handleOpen(i)}
            />
          ) : isVideo(img) ? (
            <video
              key={i}
              src={`${API_GET_PROXY}${img}`}
              className="w-24 h-24 cursor-pointer rounded-lg border flex-shrink-0"
              muted
              playsInline
              onClick={() => handleOpen(i)}
            />
          ) : null
        ))}
      </div>

      {/* Lightbox Viewer */}
      {isOpen && isImage(currentFile) && (
        <Lightbox
          mainSrc={`${API_GET_PROXY}${images[index]}`}
          nextSrc={`${API_GET_PROXY}${images[(index + 1) % images.length]}`}
          prevSrc={`${API_GET_PROXY}${images[(index + images.length - 1) % images.length]}`}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => setIndex((index + images.length - 1) % images.length)}
          onMoveNextRequest={() => setIndex((index + 1) % images.length)}
          imageLoadErrorMessage="Failed to load image" // Optional error message
          onImageLoad={() => setIsLoaded(true)} // Mark as loaded
        />
      )}
      {/* Custom Lightbox for Video */}
      {isOpen && isVideo(currentFile) && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl">
            <video
              src={proxyUrl}
              controls
              autoPlay
              className="w-full max-h-[80vh] rounded-lg"
              onLoadedData={() => setIsLoaded(true)}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-white text-xl bg-black bg-opacity-60 rounded-full px-3 py-1"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Loading Indicator */}
      {isOpen && !isLoaded && <p className="text-center mt-2">Loading...</p>}
    </div>
  );
};

export default ImageGallery;
