import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "./lib/constants";

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [readError, setReadError] = React.useState<string | null>(null);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  // Clear any running interval/timeout when the component unmounts
  React.useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);
    setReadError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_STEP;
          if (next >= 100) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            timeoutRef.current = setTimeout(() => {
              onComplete?.(base64);
            }, REDIRECT_DELAY_MS);
            return 100;
          }
          return next;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.onerror = () => {
      const message =
        reader.error?.message ?? "Failed to read file. Please try again.";
      setReadError(message);
      setFile(null);
      setProgress(0);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    const selected = event.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSignedIn) setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSignedIn) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isSignedIn) return;
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!ALLOWED_TYPES.includes(dropped.type)) {
      setReadError(
        `Unsupported file type "${dropped.type}". Please upload a JPG, PNG, or WebP.`,
      );
      return;
    }
    processFile(dropped);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp"
            disabled={!isSignedIn}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Drag and drop your floor plan here"
                : "Please sign in to upload"}
            </p>
            <p className="help">
              Supported formats: JPG, PNG, WebP (Maximum file size 10MB)
            </p>
            {readError && <p className="upload-error">{readError}</p>}
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="status-text">
              {progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
