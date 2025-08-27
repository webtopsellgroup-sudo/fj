import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  disabled?: boolean;
}

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Handle mouse events
    if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    
    // Handle touch events
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const startDrawingMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing(e);
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    startDrawing(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const drawMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    draw(e);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing.current || disabled) return;
    
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onSignatureChange(dataURL);
      setSignaturePreview(dataURL);
    }
  };

  const stopDrawingMouse = () => {
    stopDrawing();
  };

  const stopDrawingTouch = () => {
    stopDrawing();
  };

  const clearSignature = () => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onSignatureChange('');
      setSignaturePreview(null);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onSignatureChange(dataURL);
      setSignaturePreview(dataURL);
    }
    closeModal();
  };

  const isMobileDevice = isMobile();

  return (
    <div className="signature-pad-container">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanda Tangan Digital *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {isMobileDevice
            ? "Klik tombol di bawah untuk menandatangani"
            : "Silakan tanda tangan di area di bawah ini"}
        </p>
      </div>
      
      {isMobileDevice ? (
        <div className="flex flex-col items-center">
          {signaturePreview ? (
            <div className="border-2 border-gray-300 rounded-lg p-2 bg-white mb-4 w-full">
              <img
                src={signaturePreview}
                alt="Signature preview"
                className="w-full h-40 object-contain"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 mb-4 w-full h-40 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Belum ada tanda tangan</p>
            </div>
          )}
          <button
            type="button"
            onClick={openModal}
            disabled={disabled}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Tanda Tangan
          </button>
        </div>
      ) : (
        <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
          <canvas
            ref={canvasRef}
            className={`w-full h-40 cursor-crosshair ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onMouseDown={startDrawingMouse}
            onMouseMove={drawMouse}
            onMouseUp={stopDrawingMouse}
            onMouseLeave={stopDrawingMouse}
            onTouchStart={startDrawingTouch}
            onTouchMove={drawTouch}
            onTouchEnd={stopDrawingTouch}
          />
        </div>
      )}
      
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clearSignature}
          disabled={disabled}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hapus Tanda Tangan
        </button>
      </div>

      {/* Signature Modal for Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Tanda Tangan Digital</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Silakan tanda tangan di area di bawah ini
              </p>
              <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  className={`w-full h-40 cursor-crosshair ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onMouseDown={startDrawingMouse}
                  onMouseMove={drawMouse}
                  onMouseUp={stopDrawingMouse}
                  onMouseLeave={stopDrawingMouse}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawingTouch}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;