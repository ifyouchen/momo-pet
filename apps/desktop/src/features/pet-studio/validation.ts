import type { PetStudioPhoto } from './types';

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_BATCH_SIZE_BYTES = 30 * 1024 * 1024;
const MAX_REFERENCE_COUNT = 4;

export interface PhotoValidationResult {
  /** 校验是否通过，失败时不应加入草稿。 */
  readonly ok: boolean;
  /** 用户可理解的失败原因。 */
  readonly message: string | null;
}

/**
 * 校验待加入 Pet Studio 的本地图片。
 *
 * 前置条件：files 来自浏览器文件选择器。后置条件：返回可直接展示给用户的错误原因。
 */
export function validatePhotoFiles(
  files: readonly File[],
  currentPhotos: readonly PetStudioPhoto[],
): PhotoValidationResult {
  if (files.length === 0) {
    return { ok: true, message: null };
  }
  const unsupportedFile = files.find((file) => !SUPPORTED_IMAGE_TYPES.has(file.type));
  if (unsupportedFile) {
    return { ok: false, message: '只支持 JPG、PNG 或 WebP。' };
  }
  const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
  if (oversizedFile) {
    return { ok: false, message: '单张图片不能超过 10 MB。' };
  }
  const nextTotalSize = [...currentPhotos.map((photo) => photo.file), ...files].reduce(
    (totalSize, file) => totalSize + file.size,
    0,
  );
  if (nextTotalSize > MAX_BATCH_SIZE_BYTES) {
    return { ok: false, message: '本次图片总大小不能超过 30 MB。' };
  }
  const referenceCount = currentPhotos.filter((photo) => photo.role !== 'PRIMARY').length;
  const incomingReferenceCount = currentPhotos.some((photo) => photo.role === 'PRIMARY')
    ? files.length
    : Math.max(files.length - 1, 0);
  if (referenceCount + incomingReferenceCount > MAX_REFERENCE_COUNT) {
    return { ok: false, message: '最多上传 1 张主图和 4 张参考图。' };
  }
  return { ok: true, message: null };
}

/**
 * 判断 Pet Studio 草稿是否具备进入确认页的最低条件。
 *
 * 前置条件：name 和 photos 来自当前前端草稿。后置条件：返回阻止继续的文案。
 */
export function getDraftBlockingMessage(
  name: string,
  photos: readonly PetStudioPhoto[],
): string | null {
  if (name.trim().length === 0) {
    return '先告诉我它叫什么名字吧。';
  }
  if (name.trim().length > 20) {
    return '名字最多 20 个字符。';
  }
  if (!photos.some((photo) => photo.role === 'PRIMARY')) {
    return '需要先上传一张主图。';
  }
  return null;
}
