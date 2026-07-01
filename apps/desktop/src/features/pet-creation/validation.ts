export interface PhotoEntry {
  readonly file: File;
  readonly role: string;
}

export interface PhotoValidationResult {
  readonly ok: boolean;
  readonly message: string | null;
}

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_BATCH_SIZE_BYTES = 30 * 1024 * 1024;
const MAX_TOTAL_PHOTOS = 5;

/**
 * 校验待加入的本地图片（文件选择阶段）。
 */
export function validatePhotoFiles(
  files: readonly File[],
  currentPhotos: readonly PhotoEntry[],
): PhotoValidationResult {
  if (files.length === 0) {
    return { ok: true, message: null };
  }
  const allFiles = [...currentPhotos.map((p) => p.file), ...files];
  if (allFiles.length > MAX_TOTAL_PHOTOS) {
    return { ok: false, message: `最多上传 ${MAX_TOTAL_PHOTOS} 张照片。` };
  }
  const unsupportedFile = files.find((file) => !SUPPORTED_IMAGE_TYPES.has(file.type));
  if (unsupportedFile) {
    return { ok: false, message: '只支持 JPG、PNG 或 WebP。' };
  }
  const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
  if (oversizedFile) {
    return { ok: false, message: '单张图片不能超过 10 MB。' };
  }
  const nextTotalSize = allFiles.reduce((totalSize, file) => totalSize + file.size, 0);
  if (nextTotalSize > MAX_BATCH_SIZE_BYTES) {
    return { ok: false, message: '图片总大小不能超过 30 MB。' };
  }
  const hasPrimary = currentPhotos.some((photo) => photo.role === 'PRIMARY');
  const referenceCount = currentPhotos.filter((photo) => photo.role !== 'PRIMARY').length;
  const incomingReferenceCount = files.length;
  if (!hasPrimary && incomingReferenceCount > 1) {
    const neededPrimary = 1;
    if (referenceCount + incomingReferenceCount - neededPrimary > 4) {
      return { ok: false, message: '最多 1 张主图和 4 张参考图。' };
    }
  } else if (hasPrimary && referenceCount + incomingReferenceCount > 4) {
    return { ok: false, message: '最多 1 张主图和 4 张参考图。' };
  }
  return { ok: true, message: null };
}

/**
 * 校验当前完整照片集合（确认提交阶段）。
 * @param requirePrimary 是否要求恰好有一张主图
 */
export function validatePhotoCollection(
  photos: readonly PhotoEntry[],
  requirePrimary: boolean,
): PhotoValidationResult {
  const totalSize = photos.reduce((s, p) => s + p.file.size, 0);
  if (totalSize > MAX_BATCH_SIZE_BYTES) {
    return { ok: false, message: '图片总大小不能超过 30 MB。' };
  }
  const primaryCount = photos.filter((p) => p.role === 'PRIMARY').length;
  if (primaryCount > 1) {
    return { ok: false, message: '只能有一张主图。' };
  }
  if (requirePrimary && primaryCount !== 1) {
    return { ok: false, message: '请选择一张主图。' };
  }
  const referenceCount = photos.filter((p) => p.role !== 'PRIMARY').length;
  if (referenceCount > 4) {
    return { ok: false, message: '最多 4 张参考图。' };
  }
  return { ok: true, message: null };
}

/**
 * 校验图片文件是否能被当前浏览器解码。
 */
export async function validateImageDecoding(
  files: readonly File[],
): Promise<PhotoValidationResult> {
  for (const file of files) {
    const canDecode = await canDecodeImage(file);
    if (!canDecode) {
      return { ok: false, message: '这张图片无法读取，请换一张更清晰的。' };
    }
  }
  return { ok: true, message: null };
}

/**
 * 判断草稿是否具备进入确认页的最低条件。
 */
export function getDraftBlockingMessage(
  name: string,
  photos: readonly PhotoEntry[],
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

async function canDecodeImage(file: File): Promise<boolean> {
  if ('createImageBitmap' in window) {
    return canDecodeWithImageBitmap(file);
  }
  return canDecodeWithImageElement(file);
}

async function canDecodeWithImageBitmap(file: File): Promise<boolean> {
  try {
    const imageBitmap = await createImageBitmap(file);
    imageBitmap.close();
    return true;
  } catch {
    return false;
  }
}

function canDecodeWithImageElement(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };
    image.src = objectUrl;
  });
}
