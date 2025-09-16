"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stripSpecialCharacters } from "~/shared/helpers/documents";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { CountrySelector } from "../country-selector";
import { Spinner } from "../load-more";
import { SubmitButton } from "../submit-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

export function SpaceSettings() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [country, setCountry] = useState<string>("IT");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.organization.current.queryOptions(),
  );

  const updateSpaceMutation = useMutation(
    trpc.organization.update.mutationOptions({
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.organization.current.queryKey(),
        });

        // Get current data
        const previousData = queryClient.getQueryData(
          trpc.organization.current.queryKey(),
        );

        // Optimistically update
        queryClient.setQueryData(
          trpc.organization.current.queryKey(),
          // @ts-expect-error types
          (old) => ({
            ...old,
            ...newData,
          }),
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Rollback on error
        queryClient.setQueryData(
          trpc.organization.current.queryKey(),
          context?.previousData,
        );
      },
      onSettled: async () => {
        // Refetch after error or success
        await queryClient.invalidateQueries({
          queryKey: trpc.organization.current.queryKey(),
        });
      },
    }),
  );

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = evt.target;
    const selectedFile = files as FileList;

    const filename = stripSpecialCharacters(selectedFile[0]?.name ?? "");

    const { url } = await uploadFile({
      bucket: "avatars",
      path: [data?.id ?? "", filename],
      file: selectedFile[0] as File,
    });

    if (url) {
      updateSpaceMutation.mutate({ logoUrl: url });
    }
  };

  useEffect(() => {
    if (data?.name) {
      setName(data.name);
    }

    if (data?.email) {
      setName(data.email);
    }

    if (data?.countryCode) {
      setCountry(data.countryCode);
    }
  }, [setName, data]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between pr-6">
          <CardHeader>
            <CardTitle>Space logo</CardTitle>
            <CardDescription>
              This is your company's logo. Click on the logo to upload a custom
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Space name</CardTitle>
          <CardDescription>
            This is your space&apos;s visible name within Badget. For example,
            the name of your family or group.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-row justify-between gap-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-[300px]"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            maxLength={32}
          />
          <SubmitButton
            type="button"
            onClick={() => updateSpaceMutation.mutate({ name })}
            isSubmitting={updateSpaceMutation.isPending}
            disabled={updateSpaceMutation.isPending}
          >
            Save name
          </SubmitButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company email</CardTitle>
          <CardDescription>
            This is the email address that will be used to receive emails from
            Midday.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-row justify-between gap-6">
          <Input
            className="max-w-[300px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <SubmitButton
            isSubmitting={updateSpaceMutation.isPending}
            disabled={updateSpaceMutation.isPending}
            onClick={() => updateSpaceMutation.mutate({ email })}
          >
            Save email
          </SubmitButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Space country</CardTitle>
          <CardDescription>
            This is your space&apos;s country of origin.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-row justify-between gap-6">
          <CountrySelector
            defaultValue={country}
            onSelect={(code) => {
              setCountry(code);
            }}
          />
          <SubmitButton
            isSubmitting={updateSpaceMutation.isPending}
            disabled={updateSpaceMutation.isPending}
          >
            Save country
          </SubmitButton>
        </CardContent>
      </Card>
    </div>
  );
}
