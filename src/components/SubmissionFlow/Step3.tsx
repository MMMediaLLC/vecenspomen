import React, { useState, useRef, useCallback } from 'react';
import { Upload, Check, Loader2, AlertCircle, RefreshCw, Move, Scissors } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface Step3Props {
  photoUrl: string;
  onPhotoChange: (url: string) => void;
  onPositionChange: (position: string) => void;
  photoPosition?: string;
}

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

const FRAME_W = 220;
const FRAME_H = 315;

// Parse "x% y%" / "center top" / etc. into { x, y } in 0–100
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

const posToString = (x: number, y: number): string =>
  `${Math.round(Math.max(0, Math.min(100, x)))}% ${Math.round(Math.max(0, Math.min(100, y)))}%`;

// ─── CropSelector ────────────────────────────────────────────────────────────

interface CropSelectorProps {
  photoUrl: string;
  position: string;
  onChange: (position: string) => void;
  onConfirm: () => void;
  isCropping: boolean;
  cropConfirmed: boolean;
  imgRef: React.RefObject<HTMLImageElement>;
}

const CropSelector: React.FC<CropSelectorProps> = ({
  photoUrl, position, onChange, onConfirm, isCropping, cropConfirmed, imgRef,
}) => {
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
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
    const sensitivity = 0.3;
    onChange(posToString(current.x - dx * sensitivity, current.y - dy * sensitivity));
  }, [current, onChange]);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
        Позиционирај ја фотографијата
      </p>

      {/* Crop frame */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ width: FRAME_W, height: FRAME_H }}
        className="relative overflow-hidden rounded-sm border-2 border-stone-900 cursor-grab active:cursor-grabbing shadow-xl select-none"
      >
        <img
          ref={imgRef}
          src={photoUrl}
          alt="Crop preview"
          crossOrigin="anonymous"
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
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <Move size={20} className="text-white opacity-60 drop-shadow-md" />
        </div>
      </div>

      <p className="text-[10px] text-stone-400 font-light text-center">
        Повлечи за да ја центрираш фотографијата
      </p>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={isCropping}
        className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50 rounded-sm shadow"
      >
        {isCropping ? (
          <><Loader2 className="animate-spin" size={14} /> Се обработува...</>
        ) : cropConfirmed ? (
          <><Check size={14} /> Потврдено — примени повторно</>
        ) : (
          <><Scissors size={14} /> Потврди ја позицијата</>
        )}
      </button>

      {/* Reset */}
      {position !== '50% 0%' && !isCropping && (
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

// ─── Step3 ───────────────────────────────────────────────────────────────────

export const Step3: React.FC<Step3Props> = ({
  photoUrl, onPhotoChange, onPositionChange, photoPosition,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(photoUrl !== DEFAULT_PHOTO && !!photoUrl);
  const [isCropping, setIsCropping] = useState(false);
  const [cropConfirmed, setCropConfirmed] = useState(false);

  // Keep the original (un-cropped) URL so user can re-crop after confirming
  const [originalUrl, setOriginalUrl] = useState<string>(
    photoUrl !== DEFAULT_PHOTO && photoUrl ? photoUrl : ''
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const position = photoPosition ?? '50% 0%';
  const isDefault = !photoUrl || photoUrl === DEFAULT_PHOTO;

  // ── Upload original photo ──────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setCropConfirmed(false);
    setUploadProgress(10);

    try {
      const filename = `posts/${file.name}-${Date.now()}`;
      const storageRef = ref(storage, filename);
      setUploadProgress(40);
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(80);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadProgress(100);
      setOriginalUrl(downloadURL);
      onPhotoChange(downloadURL);
      onPositionChange('50% 0%');
      setUploadSuccess(true);
      setIsUploading(false);
    } catch (err: any) {
      setUploadError(
        err.code === 'storage/unauthorized'
          ? 'Firebase врати "Unauthorized". Проверете Firebase Console → Storage → Rules.'
          : 'Грешка при прикачување. Проверете Firebase конфигурацијата и CORS полисите.'
      );
      setIsUploading(false);
    }
  };

  // ── Canvas crop + re-upload ────────────────────────────────────────────────
  const cropAndUpload = async () => {
    if (!originalUrl) return;
    setIsCropping(true);
    setUploadError(null);

    try {
      const img = imgRef.current;
      if (!img) throw new Error('Image ref not available');

      // Crop to 2:3 ratio based on position
      const { x: px, y: py } = parsePosition(position);
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      let cropW = Math.floor(imgH * (2 / 3));
      let cropH = imgH;
      if (cropW > imgW) {
        cropW = imgW;
        cropH = Math.floor(imgW * (3 / 2));
      }
      const sx = Math.max(0, Math.min(Math.floor((imgW - cropW) * (px / 100)), imgW - cropW));
      const sy = Math.max(0, Math.min(Math.floor((imgH - cropH) * (py / 100)), imgH - cropH));
      const MAX_W = 880;
      const MAX_H = 1260;
      const canvasW = cropW >= MAX_W ? MAX_W : cropW;
      const canvasH = cropH >= MAX_H ? MAX_H : cropH;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, canvasW, canvasH);

      const croppedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
          'image/jpeg',
          0.92
        );
      });

      // Upload cropped image
      const croppedRef = ref(storage, `posts/cropped-${Date.now()}.jpg`);
      const croppedSnapshot = await uploadBytes(croppedRef, croppedBlob, { contentType: 'image/jpeg' });
      const croppedUrl = await getDownloadURL(croppedSnapshot.ref);

      onPhotoChange(croppedUrl);
      setCropConfirmed(true);
    } catch (err) {
      console.error('cropAndUpload failed:', err);
      setUploadError('Грешка при обработка на фотографијата. Обидете се повторно.');
    } finally {
      setIsCropping(false);
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
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-serif mb-2">Прикачете фотографија</h3>
        <p className="text-stone-500 text-sm">Портрет формат, JPG или PNG. Максимум 10MB.</p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-300 select-none ${
          isDraggingOver
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
              <div className="bg-stone-900 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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

      {/* Crop selector — only after successful upload */}
      {uploadSuccess && !isDefault && originalUrl && (
        <div className="flex justify-center pt-4 border-t border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CropSelector
            photoUrl={originalUrl}
            position={position}
            onChange={onPositionChange}
            onConfirm={cropAndUpload}
            isCropping={isCropping}
            cropConfirmed={cropConfirmed}
            imgRef={imgRef}
          />
        </div>
      )}
    </div>
  );
};
