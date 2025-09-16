import { Button } from "../ui/button";

export function VaultGetStarted() {
  return (
    <div className="flex h-[calc(100vh-250px)] items-center justify-center">
      <div className="relative z-20 m-auto flex w-full max-w-[380px] flex-col">
        <div className="relative flex w-full flex-col text-center">
          <div className="pb-4">
            <h2 className="text-lg font-medium">Always find what you need</h2>
          </div>

          <p className="pb-6 text-sm text-[#878787]">
            Drag & drop or upload your documents. We&apos;ll automatically
            organize them with tags based on content, making them easy and
            secure to find.
          </p>

          <Button
            variant="outline"
            onClick={() => document.getElementById("upload-files")?.click()}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
