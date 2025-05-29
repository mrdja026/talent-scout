import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ManualStepControlsProps {
  nodeId: string;
  nodeType: "manualStep" | "fileUpload";
  prompt?: string;
  instructions?: string;
  status?: "idle" | "waiting" | "complete" | string;
  acceptedTypes?: string;
  onContinue: (nodeId: string, data: any) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

/**
 * Component for rendering manual step controls
 * This allows users to interact with the workflow by providing input
 * or uploading documents as required by the node
 */
export default function ManualStepControls({
  nodeId,
  nodeType,
  prompt,
  instructions,
  status = "idle",
  acceptedTypes,
  onContinue
}: ManualStepControlsProps) {
  const [userInput, setUserInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [localStatus, setLocalStatus] = useState(status);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  // Clean up file previews when component unmounts
  useEffect(() => {
    return () => {
      // Revoke object URLs to avoid memory leaks
      uploadedFiles.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [uploadedFiles]);

  // Generate file preview if it's an image
  const generateFilePreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles || newFiles.length === 0) return;
    
    processFiles(Array.from(newFiles));
  };
  
  // Process files that were selected or dropped
  const processFiles = (fileList: File[]) => {
    const newUploadedFiles = fileList.map(file => ({
      file,
      preview: generateFilePreview(file),
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  // Remove a file from the upload list
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };
  
  // Handle drag events for file dropping
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  // Handle user clicking the continue button
  const handleContinue = () => {
    // Create a more detailed data object
    const processedFiles = uploadedFiles.map(uploadedFile => {
      // Extract file extension
      const extension = uploadedFile.file.name.split('.').pop()?.toLowerCase() || '';
      
      // Determine file category based on MIME type or extension
      let category = 'other';
      if (uploadedFile.file.type.startsWith('image/')) {
        category = 'image';
      } else if (uploadedFile.file.type.includes('pdf')) {
        category = 'document';
      } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
        category = 'document';
      } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
        category = 'spreadsheet';
      } else if (['ppt', 'pptx'].includes(extension)) {
        category = 'presentation';
      }
      
      return {
        name: uploadedFile.file.name,
        size: uploadedFile.file.size,
        type: uploadedFile.file.type,
        lastModified: new Date(uploadedFile.file.lastModified).toISOString(),
        preview: uploadedFile.preview || null,
        extension,
        category
      };
    });
    
    // Create data object based on node type
    const data = nodeType === "manualStep" 
      ? { userDecision: "approved", userInput }
      : { 
          files: processedFiles,
          metadata: {
            count: uploadedFiles.length,
            totalSize: uploadedFiles.reduce((sum, file) => sum + file.file.size, 0),
            categories: Array.from(new Set(processedFiles.map(f => f.category))),
            uploadedAt: new Date().toISOString()
          }
        };
    
    // Update local status
    setLocalStatus("complete");
    
    // Call parent handler
    onContinue(nodeId, data);
  };
  
  // Reset the form
  const handleReset = () => {
    // Clean up URL objects
    uploadedFiles.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    
    setUserInput("");
    setUploadedFiles([]);
    setUploadProgress(0);
    setLocalStatus("idle");
  };
  
  // Render different controls based on node type
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
      {/* Display current status */}
      <div className="flex items-center mb-2">
        <div className={`w-2 h-2 rounded-full mr-2 ${
          localStatus === "idle" ? "bg-gray-400" :
          localStatus === "waiting" ? "bg-yellow-400" :
          "bg-green-500"
        }`}></div>
        <span className="text-xs text-gray-600">
          Status: {
            localStatus === "idle" ? "Ready" :
            localStatus === "waiting" ? "Waiting for input" :
            "Complete"
          }
        </span>
      </div>
      
      {/* Show the prompt if in manual step mode */}
      {nodeType === "manualStep" && prompt && (
        <p className="text-sm font-medium mb-2">{prompt}</p>
      )}
      
      {/* Show instructions */}
      {instructions && (
        <p className="text-xs text-gray-500 mb-3">{instructions}</p>
      )}
      
      {/* Manual step input */}
      {nodeType === "manualStep" && (
        <>
          <Textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Enter your response..."
            className="mb-2 text-sm"
            rows={3}
            disabled={localStatus === "complete"}
          />
        </>
      )}
      
      {/* File upload input with drag and drop */}
      {nodeType === "fileUpload" && localStatus !== "complete" && (
        <div className="mb-2">
          {/* Regular file input (hidden but functional) */}
          <Input 
            id={`file-upload-${nodeId}`}
            type="file" 
            accept={acceptedTypes}
            onChange={handleFileChange}
            multiple
            className="hidden"
            disabled={localStatus === "complete" as any}
          />
          
          {/* Custom drag & drop zone */}
          <div 
            ref={dropAreaRef}
            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => document.getElementById(`file-upload-${nodeId}`)?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <p className="mt-1 text-xs text-gray-500">
                {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-1 text-[10px]">
                {acceptedTypes ? `Accepted formats: ${acceptedTypes}` : 'All file types accepted'}
              </p>
            </div>
          </div>
          
          {/* Upload progress bar - only show if uploading */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-200" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* File preview area */}
      {nodeType === "fileUpload" && uploadedFiles.length > 0 && (
        <div className="mt-2 border rounded p-2 max-h-40 overflow-y-auto">
          <div className="text-xs font-medium mb-1">
            Uploaded Files ({uploadedFiles.length})
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-start space-x-2">
                {/* Preview thumbnail for images */}
                {uploadedFile.preview ? (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={uploadedFile.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <svg 
                      className="w-4 h-4 text-gray-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* File name and size */}
                <div className="flex-1 text-xs text-[10px]">
                  <div className="font-medium truncate max-w-xs">
                    {uploadedFile.file.name}
                  </div>
                  <div className="text-gray-500">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                
                {/* Remove button - only show when not complete */}
                {localStatus !== "complete" && (
                  <button 
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between mt-3">
        {localStatus === "complete" ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            Reset
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm"
            onClick={handleContinue}
            className="text-xs"
            disabled={
              (nodeType === "fileUpload" && uploadedFiles.length === 0) ||
              (uploadProgress > 0 && uploadProgress < 100)
            }
          >
            {uploadProgress > 0 && uploadProgress < 100 
              ? `Uploading (${uploadProgress}%)` 
              : 'Continue'
            }
          </Button>
        )}
      </div>
    </div>
  );
}