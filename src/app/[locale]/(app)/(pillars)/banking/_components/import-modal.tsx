"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Label } from "recharts";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { importTransactions } from "~/server/actions/import-transaction";

type ColumnMapping = Record<string, string>;

export function ImportModal() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const router = useRouter();

  const { execute, status } = useAction(importTransactions);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split("\n");
        const headers = lines[0]?.split(",");
        setPreview(lines.slice(0, 6).map((line) => line.split(",")));
        setColumnMapping(
          Object.fromEntries(headers.map((header) => [header, ""])),
        );
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleColumnMappingChange = (csvColumn: string, dbColumn: string) => {
    setColumnMapping((prev) => ({ ...prev, [csvColumn]: dbColumn }));
  };

  const handleImport = async () => {
    if (file && Object.values(columnMapping).every(Boolean)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("columnMapping", JSON.stringify(columnMapping));

      const result = await execute(formData);

      if (result.data) {
        router.refresh();
      } else if (result.serverError) {
        console.error("Import failed:", result.serverError);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="relative">Aggiungi conto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {preview.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-lg font-semibold">Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview[0]?.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {preview.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {Object.keys(columnMapping).length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-lg font-semibold">Column Mapping</h3>
              <div className="grid gap-4">
                {Object.entries(columnMapping).map(([csvColumn, dbColumn]) => (
                  <div
                    key={csvColumn}
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    <Label className="text-right">{csvColumn}</Label>
                    <Select
                      value={dbColumn}
                      onValueChange={(value) =>
                        handleColumnMappingChange(csvColumn, value)
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={
              status === "executing" ||
              !file ||
              Object.values(columnMapping).some((value) => !value)
            }
          >
            {status === "executing" ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
