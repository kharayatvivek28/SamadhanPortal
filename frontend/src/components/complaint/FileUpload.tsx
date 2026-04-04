import { useState, useRef, useCallback } from "react";
import { Upload, X, FileImage, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

const FileUpload = ({ onFilesChange, maxFiles = 5, accept = "image/*,.pdf,.doc,.docx", className = "" }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const updated = [...files, ...arr].slice(0, maxFiles);
      setFiles(updated);
      onFilesChange?.(updated);
    },
    [files, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      onFilesChange?.(updated);
    },
    [files, onFilesChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className={className}>
      {/* Drop zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <motion.div
          animate={dragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            {dragOver ? "Drop files here" : "Drag & drop files, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports images, PDF, DOC — max {maxFiles} files
          </p>
        </motion.div>
      </motion.div>

      {/* Preview list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="mt-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {files.map((file, i) => (
              <motion.div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ delay: i * 0.05 }}
              >
                {isImage(file) ? (
                  <FileImage className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <File className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="p-1 text-muted-foreground hover:text-destructive rounded"
                  whileTap={{ scale: 0.85 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
