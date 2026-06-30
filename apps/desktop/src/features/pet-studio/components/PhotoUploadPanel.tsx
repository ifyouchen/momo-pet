import { ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import type { PetStudioPhoto, PhotoRole } from '../types';

const REFERENCE_ROLES: readonly PhotoRole[] = ['FRONT', 'SIDE', 'BACK', 'DETAIL', 'OTHER'];

interface PhotoUploadPanelProps {
  /** 当前已选择的图片草稿。 */
  readonly photos: readonly PetStudioPhoto[];
  /** 添加用户选择的本地图片。 */
  readonly onAddPhotos: (files: readonly File[]) => Promise<void>;
  /** 删除指定图片。 */
  readonly onRemovePhoto: (photoId: string) => void;
  /** 调整参考图角色。 */
  readonly onUpdateRole: (photoId: string, role: PhotoRole) => void;
}

/**
 * Pet Studio 图片选择面板。
 *
 * 前置条件：父级负责图片校验。后置条件：用户可以选择主图和参考图。
 */
export function PhotoUploadPanel({
  photos,
  onAddPhotos,
  onRemovePhoto,
  onUpdateRole,
}: PhotoUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void onAddPhotos(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void onAddPhotos(Array.from(event.dataTransfer.files));
  };

  return (
    <section className="pet-studio-panel" aria-label="宠物照片上传">
      <div className="pet-studio-panel-header">
        <h3>照片</h3>
        <span>1 张主图，最多 4 张参考图</span>
      </div>

      <label
        className={`photo-upload-dropzone${isDragging ? ' is-dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImagePlus size={24} />
        <strong>拖拽或点击选择图片</strong>
        <span>JPG / PNG / WebP，单张不超过 10 MB</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          multiple
          type="file"
          onChange={handleFileChange}
        />
      </label>

      {photos.length > 0 ? (
        <div className="photo-grid" aria-label="已选择图片">
          {photos.map((photo) => (
            <article className="photo-tile" key={photo.id}>
              <img
                alt={photo.role === 'PRIMARY' ? '主图预览' : '参考图预览'}
                src={photo.previewUrl}
              />
              <div className="photo-tile-footer">
                {photo.role === 'PRIMARY' ? (
                  <span className="photo-role-pill">PRIMARY</span>
                ) : (
                  <select
                    aria-label="参考图角色"
                    value={photo.role}
                    onChange={(event) => onUpdateRole(photo.id, event.target.value as PhotoRole)}
                  >
                    {REFERENCE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}
                <button type="button" aria-label="删除图片" onClick={() => onRemovePhoto(photo.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
