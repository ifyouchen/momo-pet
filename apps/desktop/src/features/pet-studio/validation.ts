/**
 * Pet Studio 校验模块，委托至共享 pet-creation 层。
 */
export {
  validatePhotoFiles,
  validateImageDecoding,
  getDraftBlockingMessage,
} from '../pet-creation/validation';
export type { PhotoValidationResult } from '../pet-creation/validation';
