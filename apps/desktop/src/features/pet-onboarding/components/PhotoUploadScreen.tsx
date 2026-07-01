import { useEffect, useRef, useState } from 'react';
import { validatePhotoCollection, validateImageDecoding } from '../../pet-creation/validation';
import { validatePhotoFiles } from '../../pet-creation/validation';

interface PhotoUploadScreenProps {
  readonly isProcessing: boolean;
  readonly onConfirm: (photos: { file: File; role: string }[]) => void;
  readonly onSkip: () => void;
  readonly onBack: () => void;
}

const ROLE_OPTIONS = ['PRIMARY', 'REFERENCE'];

export function PhotoUploadScreen({
  isProcessing,
  onConfirm,
  onSkip,
  onBack,
}: PhotoUploadScreenProps) {
  const [photos, setPhotos] = useState<{ file: File; role: string; preview: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setError(null);
    setIsValidating(true);
    const fileList = Array.from(files);
    try {
      const validation = validatePhotoFiles(fileList, photos);
      if (!validation.ok) {
        setError(validation.message ?? '照片校验失败。');
        return;
      }
      const decodingValidation = await validateImageDecoding(fileList);
      if (!decodingValidation.ok) {
        setError(decodingValidation.message);
        return;
      }
      const hasPrimary = photos.some((photo) => photo.role === 'PRIMARY');
      const newPhotos = fileList.map((file, index) => {
        const preview = URL.createObjectURL(file);
        previewUrlsRef.current.add(preview);
        return {
          file,
          role: !hasPrimary && index === 0 ? 'PRIMARY' : 'REFERENCE',
          preview,
        };
      });
      setPhotos((previous) => [...previous, ...newPhotos]);
    } finally {
      setIsValidating(false);
    }
  };

  const isDisabled = isProcessing || isValidating;

  const setRole = (index: number, role: string) => {
    if (role === 'PRIMARY') {
      setPhotos((previous) =>
        previous.map((p, i) => ({
          ...p,
          role: i === index ? 'PRIMARY' : 'REFERENCE',
        })),
      );
    } else {
      setPhotos((previous) => previous.map((p, i) => (i === index ? { ...p, role } : p)));
    }
  };

  const removePhoto = (index: number) => {
    const removed = photos[index];
    URL.revokeObjectURL(removed.preview);
    previewUrlsRef.current.delete(removed.preview);
    setPhotos((previous) => previous.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    setError(null);
    const primaryCount = photos.filter((p) => p.role === 'PRIMARY').length;
    if (primaryCount !== 1) {
      setError('请保留且只保留一张主图。');
      return;
    }
    const collectionValidation = validatePhotoCollection(photos, true);
    if (!collectionValidation.ok) {
      setError(collectionValidation.message ?? '请调整照片后重试。');
      return;
    }
    const mapped = photos.map((p) => ({
      file: p.file,
      role: p.role === 'REFERENCE' ? ('OTHER' as string) : 'PRIMARY',
    }));
    onConfirm(mapped);
  };

  return (
    <div className="onboarding-screen photo-upload-screen">
      <h1>上传宠物照片</h1>
      <p>至少上传一张主图，最多 5 张。支持 JPG/PNG/WebP，单张不超过 10 MB。</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => void handleFiles(event.target.files)}
        disabled={isDisabled}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled || photos.length >= 5}
      >
        选择照片
      </button>
      {photos.length > 0 ? (
        <ul className="photo-list">
          {photos.map((photo, index) => (
            <li key={photo.preview}>
              <img src={photo.preview} alt={`照片 ${index + 1}`} width={80} height={80} />
              <select
                value={photo.role}
                onChange={(event) => setRole(index, event.target.value)}
                disabled={isDisabled}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => removePhoto(index)} disabled={isDisabled}>
                删除
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="onboarding-error">{error}</p> : null}
      <div className="onboarding-actions">
        <button type="button" onClick={onBack} disabled={isDisabled}>
          返回
        </button>
        <button type="button" onClick={onSkip} disabled={isDisabled}>
          跳过照片（手动创建）
        </button>
        <button type="button" onClick={handleConfirm} disabled={isDisabled || photos.length === 0}>
          {isProcessing ? '处理中...' : '开始分析'}
        </button>
      </div>
    </div>
  );
}
