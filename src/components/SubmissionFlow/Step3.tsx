import React, { useState, useRef } from 'react';
import { Upload, Check, Image as ImageIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isMock } from '../../lib/firebase';

interface Step3Props {
  photoUrl: string;
  onPhotoChange: (url: string) => void;
}

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

export const Step3: React.FC<Step3Props> = ({ photoUrl, onPhotoChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(photoUrl !== DEFAULT_PHOTO);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(10);

    try {
      if (isMock) {
        let p = 0;
        const int = setInterval(() => {
          p += 20;
          setUploadProgress(p);
          if (p >= 100) {
            clearInterval(int);
            onPhotoChange(URL.createObjectURL(file));
            setUploadSuccess(true);
            setIsUploading(false);
          }
        }, 200);
        return;
      }

      const filename = `posts/${file.name}-${Date.now()}`;
      const storageRef = ref(storage, filename);
      
      setUploadProgress(40);
      const snapshot = await uploadBytes(storageRef, file);
      
      setUploadProgress(80);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploadProgress(100);
      onPhotoChange(downloadURL);
      setUploadSuccess(true);
      setIsUploading(false);
    } catch (err: any) {
      console.error('Firebase Storage upload error:', err);
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

  const isDefault = photoUrl === DEFAULT_PHOTO || !photoUrl;

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

      {/* Preview */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Преглед</p>
        <div className="relative w-36 h-52 overflow-hidden rounded-md shadow-xl border-4 border-white ring-1 ring-stone-200">
          <img
            src={photoUrl || DEFAULT_PHOTO}
            className="w-full h-full object-cover"
            alt="Преглед"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PHOTO; }}
          />
          {isDefault && (
            <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
              <ImageIcon className="text-white/80" size={28} />
            </div>
          )}
        </div>
        {isDefault && (
          <p className="text-stone-400 text-xs text-center">
            Сите фотографии се означуваат со црна лента во аголот во спомен на починатиот.
          </p>
        )}
      </div>
    </div>
  );
};
