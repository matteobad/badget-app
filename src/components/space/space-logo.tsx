"use client";

import { useRef } from "react";
import { useSpaceMutation, useSpaceQuery } from "~/hooks/use-space";
import { useUpload } from "~/hooks/use-upload";
import { stripSpecialCharacters } from "~/shared/helpers/documents";

import { Spinner } from "../load-more";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function SpaceLogo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoading, uploadFile } = useUpload();
  const { data } = useSpaceQuery();
  const { mutate: updateSpace } = useSpaceMutation();

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = evt.target;
    const selectedFile = files!;

    const filename = stripSpecialCharacters(selectedFile[0]?.name ?? "");

    const { url } = await uploadFile({
      path: [data?.id ?? "", "avatars", filename],
      file: selectedFile[0]!,
    });

    if (url) {
      updateSpace({ logoUrl: url });
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between pr-6">
        <CardHeader>
          <CardTitle>Space logo</CardTitle>
          <CardDescription>
            This is your space&apos;s logo. Click on the logo to upload a custom
            one from your files.
          </CardDescription>
        </CardHeader>

        <Avatar
          className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-none bg-accent"
          onClick={() => inputRef?.current?.click()}
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              <AvatarImage
                src={data?.logo ?? undefined}
                alt={data?.name ?? undefined}
                width={64}
                height={64}
              />
              <AvatarFallback>
                <span className="text-md">{data?.name?.charAt(0)}</span>
              </AvatarFallback>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            multiple={false}
            onChange={handleUpload}
          />
        </Avatar>
      </div>
      <CardFooter>An avatar is optional but strongly recommended.</CardFooter>
    </Card>
  );
}
