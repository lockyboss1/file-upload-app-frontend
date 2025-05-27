/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  FileIcon,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
} from "lucide-react";
import axios from "axios";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();

    if (fileType === "csv" || fileType === "xlsx") {
      setFile(file);
      setUploadStatus("idle");
      setErrorMessage("");
    } else {
      setFile(null);
      setUploadStatus("error");
      setErrorMessage(
        "Invalid file format. Please upload a CSV or Excel (.xlsx) file."
      );
    }
  };

  const api = {
    fileUpload: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/orders/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );
      return response.data;
    },
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorDetails([]);

    try {
      console.log("Uploading file...");
      const response = await api.fileUpload(file);
      console.log("Response received:", response);

      if (response && response.errors) {
        console.log("Errors found:", response.errors);
        setUploadStatus("error");
        setErrorMessage("Failed to upload file. Please try again.");
        setErrorDetails(
          response.errors.map(
            (error: any) => `${error.orderNumber}: ${error.messages.join(", ")}`
          )
        );
      } else {
        setUploadProgress(100);
        setUploadStatus("success");
        console.log("Upload successful");
        setTimeout(() => {
          if (fileInputRef.current) fileInputRef.current.value = "";
          setFile(null);
        }, 3000);
      }
    } catch (error: any) {
      console.log("Upload failed", error);

      setUploadStatus("error");
      setErrorMessage("Failed to upload file. Please try again.");

      if (error.response && error.response.data && error.response.data.errors) {
        setErrorDetails(
          error.response.data.errors.map(
            (err: any) => `${err.orderNumber}: ${err.messages.join(", ")}`
          )
        );
      } else {
        setErrorDetails(["An unexpected error occurred."]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Upload Data File</CardTitle>
        <CardDescription>
          Upload your CSV or Excel (.xlsx) file to import data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="text-sm text-muted-foreground mb-4">
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>File must be in CSV or Excel (.xlsx) format</li>
            <li>Maximum file size: 10MB</li>
            <li>First row should contain column headers</li>
            <li>Drag and drop or click to select your file</li>
          </ul>
        </div>

        {/* Upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx"
            className="hidden"
          />
          <UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag and drop your file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports CSV and Excel (.xlsx) files
          </p>
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-md">
                {file.name.endsWith(".csv") ? (
                  <FileIcon className="h-5 w-5 text-primary" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium truncate max-w-[180px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Status messages */}
        {uploadStatus === "success" && (
          <Alert
            variant="default"
            className="bg-green-50 text-green-800 border-green-200"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your file has been uploaded successfully.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
            <div className="text-red-500">
              {errorDetails.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm">
                  {errorDetails.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={resetUpload}
          disabled={isUploading || !file}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={isUploading || !file || uploadStatus === "success"}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </CardFooter>
    </Card>
  );
}
