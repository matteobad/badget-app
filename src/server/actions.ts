"use server";

import { parse } from "@fast-csv/parse";

// Server Action
export async function parseCsv(file: File) {
  const text = await file.text();

  return new Promise<string[]>((resolve, reject) => {
    let headers: string[] = [];

    // Create stream and attach all handlers before writing data
    const stream = parse({ headers: true })
      .on("error", (error) => reject(error))
      .on("headers", (headerList) => (headers = headerList as string[]))
      .on("data", console.log)
      .on("end", (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        console.log("Final headers:", headers);
        resolve(headers);
      });

    // Process the CSV text through the stream after all handlers are set up
    stream.write(text);
    stream.end();
  });
}
