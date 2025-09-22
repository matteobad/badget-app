import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitButton } from "~/components/submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import MultipleSelector from "~/components/ui/multiple-selector";
import { useTRPC } from "~/shared/helpers/trpc/client";

type Option = {
  id?: string;
  value: string;
  label: string;
};

type Props = {
  tags?: Option[];
  onSelect?: (tag: Option) => void;
  onRemove?: (tag: Option) => void;
  onChange?: (tags: Option[]) => void;
};

export function SelectTags({ tags, onSelect, onRemove, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option[]>(tags ?? []);
  const [editingTag, setEditingTag] = useState<Option | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.tag.get.queryOptions());

  const updateTagMutation = useMutation(
    trpc.tag.update.mutationOptions({
      onSuccess: () => {
        setIsOpen(false);
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey(),
        });
      },
    }),
  );

  const deleteTagMutation = useMutation(
    trpc.tag.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey(),
        });
      },
    }),
  );

  const createTagMutation = useMutation(
    trpc.tag.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey(),
        });
      },
    }),
  );

  const transformedTags = data
    ?.map((tag) => ({
      value: tag.name,
      label: tag.name,
      id: tag.id,
    }))
    .filter((tag) => !selected.some((s) => s.id === tag.id));

  const handleDelete = () => {
    if (editingTag?.id) {
      deleteTagMutation.mutate({ id: editingTag.id });

      setSelected(selected.filter((tag) => tag.id !== editingTag.id));
      setIsOpen(false);
    }
  };

  const handleUpdate = () => {
    if (editingTag?.id) {
      updateTagMutation.mutate({
        id: editingTag.id,
        name: editingTag.label,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <MultipleSelector
          options={transformedTags ?? []}
          value={selected}
          placeholder="Select tags"
          creatable
          emptyIndicator={<p className="text-sm">No results found.</p>}
          renderOption={(option) => (
            <div className="group flex w-full items-center justify-between">
              <span>{option.label}</span>

              <button
                type="button"
                className="text-xs opacity-0 group-hover:opacity-50"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingTag(option);
                  setIsOpen(true);
                }}
              >
                Edit
              </button>
            </div>
          )}
          onCreate={(option) => {
            createTagMutation.mutate(
              { name: option.value },
              {
                onSuccess: (data) => {
                  if (data) {
                    const newTag = {
                      id: data.id,
                      label: data.name,
                      value: data.name,
                    };

                    setSelected([...selected, newTag]);
                    onSelect?.(newTag);
                  }
                },
              },
            );
          }}
          onChange={(options) => {
            setSelected(options);
            onChange?.(options);

            const newTag = options.find(
              (tag) => !selected.find((opt) => opt.value === tag.value),
            );

            if (newTag) {
              onSelect?.(newTag);
              return;
            }

            if (options.length < selected.length) {
              const removedTag = selected.find(
                (tag) => !options.find((opt) => opt.value === tag.value),
              ) as Option & { id: string };

              if (removedTag) {
                onRemove?.(removedTag);
                setSelected(options);
              }
            }
          }}
        />
      </div>

      <DialogContent className="max-w-[455px]">
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Make changes to the tag here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex w-full flex-col space-y-2">
            <Label>Name</Label>
            <Input
              value={editingTag?.label}
              onChange={(event) => {
                if (editingTag) {
                  setEditingTag({
                    id: editingTag.id,
                    label: event.target.value,
                    value: editingTag.value,
                  });
                }
              }}
            />
          </div>

          <DialogFooter className="mt-8 w-full">
            <div className="flex w-full flex-col space-y-2">
              <SubmitButton
                isSubmitting={updateTagMutation.isPending}
                onClick={handleUpdate}
              >
                Save
              </SubmitButton>

              <SubmitButton
                isSubmitting={deleteTagMutation.isPending}
                variant="outline"
                onClick={handleDelete}
              >
                Delete
              </SubmitButton>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
