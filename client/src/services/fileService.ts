/**
 * Service for handling file operations
 */
import { apiRequest, uploadFiles } from './api';

/**
 * Upload multiple files
 * @param files List of files to upload
 * @param onProgress Progress callback
 * @returns Upload result
 */
export async function uploadMultipleFiles(
  files: File[],
  onProgress?: (progress: number) => void
) {
  return uploadFiles(files, onProgress);
}

/**
 * Get a specific file
 * @param fileId ID of the file
 * @returns File data or download URL
 */
export async function getFile(fileId: string) {
  // This endpoint returns the actual file, not JSON data
  const url = `/api/v1/files/${fileId}`;
  return url;
}

/**
 * Delete a file
 * @param fileId ID of the file
 * @returns Deletion status
 */
export async function deleteFile(fileId: string) {
  return apiRequest(`/files/${fileId}`, {
    method: 'DELETE',
  });
}