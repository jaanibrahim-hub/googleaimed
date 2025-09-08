import React from 'react';
import { XIcon, DownloadIcon } from './icons';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-4 relative max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h2 id="image-modal-title" className="text-lg font-semibold text-slate-700">Generated Image</h2>
            <div className="flex items-center space-x-2">
                <a 
                    href={imageUrl} 
                    download="mediteach-ai-image.png" 
                    className="p-2 text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    aria-label="Download image"
                >
                    <DownloadIcon className="w-5 h-5" />
                </a>
                <button 
                    onClick={onClose} 
                    className="p-2 text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    aria-label="Close image viewer"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="mt-4 flex-1 overflow-auto">
          <img src={imageUrl} alt="Enlarged medical illustration" className="w-full h-auto object-contain rounded" />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;