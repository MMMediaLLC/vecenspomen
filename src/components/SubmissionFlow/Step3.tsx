import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Check, Loader2, AlertCircle, RefreshCw, Move } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface Step3Props {
  photoUrl: string;
  onPhotoChange: (url: string) => void;
  onPositionChange: (position: string) => void;
  photoPosition?: string;
}

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

// Frame dimensions — same proportions as OG card photo panel (440×630)
const FRAME_W = 220;
const FRAME_H = 315;

const CropSelector: React.FC<{
  photoUrl: string;
  position: string;
  onChange: (position: string) => void;
}> = ({ photoUrl, position, onChange }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Parse current position into x/y percentages (0–100)
  const parsePosition = (pos: string): { x: number; y: number } => {
    const parts = pos.trim().split(/\s+/);
    const parseVal = (s: string) => {
      if (s === 'center') return 50;
      if (s === 'top' || s === 'left') return 0;
      if (s === 'bottom' || s === 'right') return 100;
      return parseFloat(s) || 50;
    };
    return {
      x: parts.length >= 1 ? parseVal(parts[0]) : 50,
      y: parts.length >= 2 ? parseVal(parts[1]) : 50,
    };
  };

  const posToString = (x: number, y: number): string => {
    const cx = Math.round(Math.max(0, Math.min(100, x)));
    const cy = Math.round(Math.max(0, Math.min(100, y)));
    return `${cx}% ${cy}%`;
  };

  const current = parsePosition(position);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    // Moving photo right = moving focal point left (invert x), same for y
    const sensitivity = 0.3;
    const newX = current.x - dx * sensitivity;
    const newY = current.y - dy * sensitivity;
    onChange(posToString(newX, newY));
  }, [current, onChange]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
        Позиционирај ја фотографијата
      </p>

      {/* Crop frame */}
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ width: FRAME_W, height: FRAME_H }}
        className="relative overflow-hidden rounded-sm border-2 border-stone-900 cursor-grab active:cursor-grabbing shadow-xl select-none"
      >
        <img
          src={photoUrl}
          alt="Crop preview"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: position,
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-6 h-6 flex items-center justify-center opacity-60">
            <Move size={20} className="text-white drop-shadow-md" />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-stone-400 font-light text-center">
        Повлечи за да ја центрираш фотографијата
      </p>

      {/* Reset button */}
      {position !== '50% 0%' && (
        <button
          onClick={() => onChange('50% 0%')}
          className="text-[10px] text-stone-400 hover:text-stone-700 uppercase tracking-widest font-bold transition-colors"
        >
          Ресетирај позиција
        </button>
      )}
    </div>
  );
};

export const Step3: React.FC<Step3Props> = ({ photoUrl, onPhotoChange, onPositionChange, photoPosition }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(photoUrl !== DEFAULT_PHOTO && !!photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const position = photoPosition ?? '50% 0%';
  const isDefault = !photoUrl || photoUrl === DEFAULT_PHOTO;

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(10);

    try {
      const filename = `posts/${file.name}-${Date.now()}`;
      const storageRef = ref(storage, filename);

      setUploadProgress(40);
      const snapshot = await uploadBytes(storageRef, file);

      setUploadProgress(80);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setUploadProgress(100);
      onPhotoChange(downloadURL);
      onPositionChange('50% 0%');
      setUploadSuccess(true);
      setIsUploading(false);
    } catch (err: any) {
      if (err.code === 'storage/unauthorized') {
        setUploadError('Firebase врати "Unauthorized". Ве молиме отворете Firebase Console -> Storage -> Rules и ставете allow read, write: if true;');
      } else {
        setUploadError('Грешка при прикачување. Проверете Firebase конфигурацијата (.env) и CORS полисите.');
      }
      setIsUploading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Дозволени се само слики (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Фотографијата е преголема. Максимум 10MB.');
      return;
    }
    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-serif mb-2">Прикачете фотографија</h3>
        <p className="text-stone-500 text-sm">
          Портрет формат, JPG или PNG. Максимум 10MB.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-300 select-none ${
          isDragging
            ? 'border-stone-900 bg-stone-100 scale-[1.01]'
            : isUploading
            ? 'border-stone-300 bg-stone-50 cursor-not-allowed'
            : 'border-stone-200 hover:border-stone-500 hover:bg-stone-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 text-stone-500">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-medium">Прикачување... {uploadProgress}%</p>
            <div className="w-full max-w-xs bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-stone-900 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : uploadSuccess && !isDefault ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="text-green-600" size={28} />
            </div>
            <p className="text-green-700 font-medium">Сликата е успешно прикачена!</p>
            <span className="flex items-center gap-1 text-stone-400 text-sm hover:text-stone-600 transition-colors">
              <RefreshCw size={12} /> Кликнете за да замените
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-stone-400">
            <Upload size={48} />
            <div>
              <p className="text-stone-600 font-medium text-base">Повлечете слика овде, или кликнете за избор</p>
              <p className="text-sm mt-1">JPG, PNG, WEBP — до 10MB</p>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-sm px-4 py-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Crop selector — only shown after successful upload */}
      {uploadSuccess && !isDefault && (
        <div className="flex justify-center pt-4 border-t border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CropSelector
            photoUrl={photoUrl}
            position={position}
            onChange={onPositionChange}
          />
        </div>
      )}
    </div>
  );
};
