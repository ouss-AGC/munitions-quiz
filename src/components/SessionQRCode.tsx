import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface SessionQRCodeProps {
  pin: string;
}

export function SessionQRCode({ pin }: SessionQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && pin) {
      // Generate QR code with the current URL
      const url = window.location.origin;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff'
        }
      });
    }
  }, [pin]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border-2 border-blue-900 shadow-lg">
      <div className="text-center">
        <h3 className="text-xl font-bold text-blue-900 mb-2">Code PIN de Session</h3>
        <div className="text-5xl font-mono font-bold text-blue-600 tracking-widest bg-blue-50 px-8 py-4 rounded-lg border-2 border-blue-300">
          {pin || '------'}
        </div>
        <p className="text-sm text-gray-600 mt-2">Les étudiants doivent entrer ce code PIN</p>
      </div>

      <div className="border-t-2 border-gray-200 pt-4 w-full">
        <h4 className="text-center text-sm font-semibold text-gray-700 mb-3">
          Ou scanner le QR Code
        </h4>
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="border-4 border-blue-900 rounded-lg" />
        </div>
        <p className="text-xs text-center text-gray-500 mt-2">
          Scannez pour accéder directement au quiz
        </p>
      </div>
    </div>
  );
}

