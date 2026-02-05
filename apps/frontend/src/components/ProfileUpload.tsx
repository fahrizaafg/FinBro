import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ZoomIn, ZoomOut, RotateCw, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import getCroppedImg, { generateThumbnail } from '../lib/cropImage';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

export default function ProfileUpload() {
  const { user, updateUser, settings } = useApp();
  const t = translations[settings.language];
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validation
      if (file.size > 5 * 1024 * 1024) {
        setError(t.profile.errorSize);
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = () => {
             if (image.width < 200 || image.height < 200) {
                 setError(t.profile.errorRes);
                 return;
             }
             setImageSrc(reader.result as string);
             setError(null);
             setZoom(1);
             setRotation(0);
        };
      });
      reader.readAsDataURL(file);
    }
  }, [t.profile.errorSize, t.profile.errorRes]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      // Generate cropped image
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      
      // Generate thumbnail (150x150)
      const thumbnail = await generateThumbnail(croppedImage, 150);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save to Context (and theoretically to backend)
      updateUser({ avatar: thumbnail });
      
      setSuccess(true);
      setImageSrc(null); // Close cropper
      
      setTimeout(() => {
        setSuccess(false);
        setUploadProgress(0);
      }, 3000);

    } catch (e) {
      console.error(e);
      setError(t.profile.errorProcess);
    } finally {
      setIsUploading(false);
    }
  };

  const closeCropper = () => {
    setImageSrc(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
             {user?.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <ImageIcon className="text-gray-400" size={32} />
             )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" {...getRootProps()}>
              <input {...getInputProps()} />
              <Upload className="text-white" size={24} />
          </div>
        </div>
        
        <div className="flex-1">
            <h4 className="font-semibold text-lg">{t.profile.title}</h4>
            <p className="text-sm text-gray-400 mb-2">{t.profile.supports}. {t.profile.minRes}.</p>
            <div {...getRootProps()} className="inline-block">
                <input {...getInputProps()} />
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                    {t.profile.change}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-400 text-sm mt-2 flex items-center gap-2"><Check size={14}/> {t.profile.updateSuccess}</p>}
        </div>
      </div>

      {/* Cropper Modal */}
      {imageSrc && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col max-h-[95dvh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-white">{t.profile.edit}</h3>
                <button onClick={closeCropper} className="text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="relative h-[200px] sm:h-[300px] w-full bg-black shrink-0">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
              />
            </div>

            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-10">{t.profile.zoom}</span>
                        <ZoomOut size={14} className="text-gray-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-label="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <ZoomIn size={14} className="text-gray-400" />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-10">{t.profile.rotation}</span>
                        <RotateCw size={14} className="text-gray-400" />
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-label="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <span className="text-xs text-gray-400 w-8 text-right tabular-nums">{rotation}°</span>
                    </div>
                </div>

                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{t.profile.uploading}</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={closeCropper}
                        disabled={isUploading}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 font-medium hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {t.common.cancel}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isUploading}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : t.profile.savePhoto}
                    </button>
                </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
