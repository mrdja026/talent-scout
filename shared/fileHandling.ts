/**
 * File handling models and utilities
 */
import { z } from "zod";

/**
 * File metadata schema
 */
export const fileMetadataSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  path: z.string(),
  size: z.number(),
  contentType: z.string(),
  extension: z.string().optional(),
  hash: z.string().optional(),
  uploadTime: z.string(),
  uploadedBy: z.number().or(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

/**
 * File category based on MIME type or extension
 */
export const FileCategory = z.enum([
  "image",       // Images (jpg, png, gif, etc.)
  "document",    // Documents (pdf, docx, etc.)
  "spreadsheet", // Spreadsheets (xlsx, csv, etc.)
  "presentation",// Presentations (pptx, etc.)
  "audio",       // Audio files (mp3, wav, etc.)
  "video",       // Video files (mp4, mov, etc.)
  "archive",     // Archives (zip, rar, etc.)
  "code",        // Code files (js, py, etc.)
  "text",        // Plain text files (txt, etc.)
  "other"        // Other file types
]);

export type FileCategory = z.infer<typeof FileCategory>;

/**
 * File processing status
 */
export const FileProcessingStatus = z.enum([
  "uploaded",    // Initial upload complete
  "processing",  // File is being processed
  "processed",   // Processing complete
  "failed",      // Processing failed
  "deleted"      // File was deleted
]);

export type FileProcessingStatus = z.infer<typeof FileProcessingStatus>;

/**
 * File processing result
 */
export const fileProcessingResultSchema = z.object({
  fileId: z.string(),
  status: FileProcessingStatus,
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  error: z.string().optional(),
  outputs: z.record(z.any()).optional(),
  extractedText: z.string().optional(),
  extractedMetadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  category: FileCategory.optional(),
  preview: z.string().optional() // URL or base64 for preview
});

export type FileProcessingResult = z.infer<typeof fileProcessingResultSchema>;

/**
 * Upload request schema
 */
export const uploadRequestSchema = z.object({
  filenames: z.array(z.string()),
  nodeId: z.string().optional(),
  workflowId: z.string().or(z.number()).optional(),
  executionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  processingOptions: z.record(z.any()).optional()
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

/**
 * Upload response schema
 */
export const uploadResponseSchema = z.object({
  files: z.array(fileMetadataSchema),
  count: z.number(),
  message: z.string().optional(),
  totalSize: z.number().optional()
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

/**
 * Helper function to determine file category from MIME type and extension
 */
export function determineFileCategory(mimeType: string, extension: string): FileCategory {
  // Check MIME type first
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return 'spreadsheet';
  if (mimeType.includes('presentation')) return 'presentation';
  if (mimeType.startsWith('text/plain')) return 'text';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  
  // Check extension if MIME type didn't help
  extension = extension.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return 'image';
  if (['doc', 'docx', 'pdf', 'rtf', 'txt', 'odt'].includes(extension)) return 'document';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) return 'spreadsheet';
  if (['ppt', 'pptx', 'odp'].includes(extension)) return 'presentation';
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) return 'audio';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) return 'video';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
  if (['js', 'py', 'java', 'c', 'cpp', 'cs', 'rb', 'php', 'html', 'css', 'ts', 'json'].includes(extension)) return 'code';
  if (['txt', 'md', 'log'].includes(extension)) return 'text';
  
  // Default category
  return 'other';
}