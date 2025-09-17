"use client";

import { forwardRef, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpload } from "~/hooks/use-upload";
import { cn } from "~/lib/utils";
import { stripSpecialCharacters } from "~/shared/helpers/documents";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { Loader2, UserCircleIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Props = {
  userId: string;
  avatarUrl?: string | null;
  onUpload?: (url: string) => void;
  size?: number;
  className?: string;
};

export const AvatarUpload = forwardRef<HTMLInputElement, Props>(
  (
    { userId, avatarUrl: initialAvatarUrl, size = 65, onUpload, className },
    ref,
  ) => {
    const [avatar, setAvatar] = useState(initialAvatarUrl);
    const inputRef = useRef<HTMLInputElement>(null);
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const updateUserMutation = useMutation(
      trpc.user.update.mutationOptions({
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: trpc.user.me.queryKey(),
          });
        },
      }),
    );

    const { isLoading, uploadFile } = useUpload();

    const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = evt.target;
      const selectedFile = files!;

      const filename = stripSpecialCharacters(selectedFile[0]?.name ?? "");

      const { url } = await uploadFile({
        path: [userId, "avatars", filename],
        file: selectedFile[0]!,
      });

      if (url) {
        updateUserMutation.mutate({ image: url });
        setAvatar(url);
        onUpload?.(url);
      }
    };

    const fileInputRef = ref ?? inputRef;

    return (
      <Avatar
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-none border border-border bg-accent",
          className,
        )}
        style={{ width: size, height: size }}
        onClick={() => {
          if ("current" in fileInputRef && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <AvatarImage src={avatar ?? undefined} />
            <AvatarFallback>
              <UserCircleIcon className="size-5" />
            </AvatarFallback>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          multiple={false}
          onChange={handleUpload}
        />
      </Avatar>
    );
  },
);

AvatarUpload.displayName = "AvatarUpload";
