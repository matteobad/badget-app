import { useState } from "react";
import { upload } from "@vercel/blob/client";

interface UploadParams {
  file: File;
  path: string[];
}

interface UploadResult {
  url: string;
  pathname: string;
}

export function useUpload() {
  const [isLoading, setLoading] = useState<boolean>(false);

  const uploadFile = async ({
    file,
    path,
  }: UploadParams): Promise<UploadResult> => {
    setLoading(true);

    try {
      const result = await upload(path.join("/"), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      return {
        url: result.url,
        pathname: result.pathname,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    isLoading,
  };
}
