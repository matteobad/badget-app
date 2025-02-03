// components/csv-uploader/dropzone.tsx
import { AlertCircle, File, Upload } from "lucide-react";

interface DropzoneProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRootProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInputProps: any;
  isDragActive: boolean;
  file?: File;
  // onUpload: () => void;
}

export const Dropzone = ({
  getRootProps,
  getInputProps,
  isDragActive,
  file,
  // onUpload,
}: DropzoneProps) => (
  <>
    <div
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      {isDragActive ? (
        <p>Drop the CSV file here ...</p>
      ) : (
        <p>{"Drag 'n' drop a CSV file here, or click to select a file"}</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">CSV files only</p>
    </div>

    {file && (
      <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4">
        <div className="flex items-center space-x-2">
          <File className="h-5 w-5 text-primary" />
          <span className="font-medium">{file.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
      </div>
    )}

    {!file && (
      <div className="mt-4 flex items-center space-x-2 rounded-lg bg-yellow-500/10 p-4">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <p className="text-sm text-yellow-500">No file selected</p>
      </div>
    )}
    {/* 
    <Button className="mt-6 w-full" onClick={onUpload} disabled={!file}>
      Upload and Process CSV
    </Button> */}
  </>
);
