import Papa from "papaparse";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Controller } from "react-hook-form";
import { Spinner } from "~/components/load-more";
import { cn } from "~/lib/utils";

import { useCsvContext } from "./context";
import { readLines } from "./utils";

export function SelectFile() {
  const { watch, control, setFileColumns, setFirstRows } = useCsvContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const file = watch("file");

  async function processFile() {
    if (!file) {
      setFileColumns(null);
      return;
    }

    setIsLoading(true);

    readLines(file, 4)
      .then((lines) => {
        const { data, meta } = Papa.parse(lines, {
          worker: false,
          skipEmptyLines: true,
          header: true,
        });

        if (!data || data.length < 2) {
          setError("CSV file must have at least 2 rows.");
          setFileColumns(null);
          setFirstRows(null);
          setIsLoading(false);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (!meta || !meta.fields || meta.fields.length <= 1) {
          setError("Failed to retrieve CSV column data.");
          setFileColumns(null);
          setFirstRows(null);
          setIsLoading(false);
          return;
        }

        setFileColumns(meta.fields);
        // @ts-expect-error unknown
        setFirstRows(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to read CSV file.");
        setFileColumns(null);
        setFirstRows(null);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    void processFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="file"
        render={({ field: { onChange, onBlur } }) => (
          <Dropzone
            onDrop={([file]) => onChange(file)}
            maxFiles={1}
            accept={{
              "text/csv": [".csv"],
            }}
            maxSize={5000000}
          >
            {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
              <div
                {...getRootProps()}
                className={cn(
                  "mt-8 mb-8 flex h-[200px] w-full items-center justify-center border border-dashed",
                  isDragActive && "bg-secondary text-primary",
                  isDragReject && "border-destructive",
                )}
              >
                <div className="flex flex-col items-center justify-center text-center text-xs text-[#878787]">
                  <input {...getInputProps()} onBlur={onBlur} />

                  {isLoading ? (
                    <div className="flex items-center space-x-1">
                      <Spinner />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div>
                      <p>Drop your file here, or click to browse.</p>
                      <span>5MB file limit. </span>
                      <span className="mt-2 text-[10px]">CSV format</span>
                    </div>
                  )}

                  {error && (
                    <p className="mt-4 text-center text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Dropzone>
        )}
      />
    </div>
  );
}
