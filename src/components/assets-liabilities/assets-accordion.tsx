"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { useBankAccountFilterParams } from "~/hooks/use-bank-account-filter-params";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { DataTable } from "../bank-account/table/data-table";
import { NoAccounts, NoResults } from "../bank-account/table/empty-states";
import { Loading } from "../bank-account/table/loading";
import { useEditGroups } from "./edit-groups-context";

type AccountGroupDto = RouterOutput["preferences"]["listAccountGroups"][number];

export function AssetsAccordion() {
  const draggingIdRef = useRef<string | null>(null);
  const draggingGroupIdRef = useRef<string | null>(null);

  const [groupsLocal, setGroupsLocal] = useState<AccountGroupDto[]>([]);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>("");

  const { filters, hasFilters } = useBankAccountFilterParams();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: accounts, isSuccess } = useQuery(
    trpc.asset.get.queryOptions({
      q: filters.q,
    }),
  );

  const { data: groupsData } = useQuery(
    trpc.preferences.listAccountGroups.queryOptions(),
  );

  const assignMutation = useMutation(
    trpc.preferences.assignAccountToGroup.mutationOptions({
      onSuccess: async () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.preferences.listAccountGroups.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.asset.get.queryKey(),
        });
      },
    }),
  );

  const updateGroupsMutation = useMutation(
    trpc.preferences.updateAccountGroups.mutationOptions({
      onSuccess: async () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.preferences.listAccountGroups.queryKey(),
        });
      },
    }),
  );

  const { editing } = useEditGroups();

  useEffect(() => {
    if (groupsData) setGroupsLocal(groupsData);
  }, [groupsData]);

  const persistGroups = (next: AccountGroupDto[]) => {
    setGroupsLocal(next);
    updateGroupsMutation.mutate({ groups: next });
  };

  const addGroup = () => {
    const next: AccountGroupDto = {
      id: `grp_${Date.now()}`,
      name: "Nuovo gruppo",
      order: (groupsLocal.at(-1)?.order ?? 0) + 1,
      accounts: [],
    };
    persistGroups([...groupsLocal, next]);
  };

  const renameGroup = (groupId: string, name: string) => {
    const next = groupsLocal.map((g) =>
      g.id === groupId ? { ...g, name } : g,
    );
    persistGroups(next);
  };

  const deleteGroup = (groupId: string) => {
    if (groupsLocal.length <= 1) return; // keep at least one group
    const toDelete = groupsLocal.find((g) => g.id === groupId);
    if (!toDelete) return;
    const reassigned = groupsLocal
      .filter((g) => g.id !== groupId)
      .map((g) => ({ ...g }));
    // move deleted group's accounts to "others" (implicit) by removing from groups arrays
    persistGroups(reassigned);
  };

  const accountById = new Map((accounts ?? []).map((a) => [a.id, a] as const));

  const sortedGroups = useMemo(
    () => [...(groupsLocal ?? [])].sort((a, b) => a.order - b.order),
    [groupsLocal],
  );

  const assignedIds = new Set(sortedGroups.flatMap((g) => g.accounts ?? []));

  const others = (accounts ?? []).filter((a) => !assignedIds.has(a.id));

  let groupsWithAccounts = [
    ...sortedGroups.map((g) => ({
      id: g.id,
      name: g.name,
      order: g.order,
      accounts: (g.accounts ?? [])
        .map((id) => accountById.get(id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    })),
  ] as { id: string; name: string; order: number; accounts: typeof accounts }[];

  const othersGroup = {
    id: "others",
    name: "Altri account",
    order: Number.MAX_SAFE_INTEGER,
    accounts: others,
  } as const;

  if ((others?.length ?? 0) > 0) {
    groupsWithAccounts.push(othersGroup);
  }

  if (!editing) {
    groupsWithAccounts = groupsWithAccounts.filter(
      (g) => (g.accounts?.length ?? 0) > 0,
    );
  }

  if (!accounts?.length && isSuccess && !hasFilters) {
    return (
      <div className="absolute inset-0 h-screen overflow-hidden p-6">
        <NoAccounts />
        <Loading isEmpty />
      </div>
    );
  }

  if (!accounts?.length && isSuccess && hasFilters) {
    return (
      <div className="relative h-[300px] overflow-hidden p-6">
        <NoResults />
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-4"
      defaultValue={["checking", "savings"]}
    >
      {editing ? (
        <div className="flex justify-end px-1">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:underline"
            onClick={addGroup}
          >
            + Aggiungi gruppo
          </button>
        </div>
      ) : null}
      {groupsWithAccounts.map((group) => {
        const total =
          group.accounts?.reduce(
            (tot, value) => (tot += value?.balance ?? 0),
            0,
          ) ?? 0;

        return (
          <AccordionItem
            value={group.id}
            key={group.id}
            className="rounded-md border bg-background p-0 outline-none last:border-b has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
            draggable={editing}
            onDragStart={
              editing
                ? () => {
                    draggingGroupIdRef.current = group.id;
                  }
                : undefined
            }
            onDragOver={
              editing
                ? (e) => {
                    if (draggingGroupIdRef.current) e.preventDefault();
                  }
                : undefined
            }
            onDrop={
              editing
                ? () => {
                    const draggedId = draggingGroupIdRef.current;
                    if (!draggedId || draggedId === group.id) return;
                    const next = [...sortedGroups];
                    const fromIdx = next.findIndex((g) => g.id === draggedId);
                    const toIdx = next.findIndex((g) => g.id === group.id);
                    if (fromIdx === -1 || toIdx === -1) return;
                    const moved = next[fromIdx]!;
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, moved);
                    // recompute order
                    const withOrder = next.map((g, idx) => ({
                      ...g,
                      order: idx + 1,
                    }));
                    persistGroups(withOrder);
                    draggingGroupIdRef.current = null;
                  }
                : undefined
            }
          >
            <AccordionTrigger
              className="flex h-10 px-4 text-sm leading-6 hover:no-underline focus-visible:ring-0"
              onDragOver={
                editing
                  ? (e) => {
                      if (draggingIdRef.current) e.preventDefault();
                    }
                  : undefined
              }
              onDrop={
                editing
                  ? (e) => {
                      e.preventDefault();
                      const draggingId = draggingIdRef.current;
                      if (!draggingId) return;
                      assignMutation.mutate({
                        accountId: draggingId,
                        groupId: group.id,
                      });
                      draggingIdRef.current = null;
                    }
                  : undefined
              }
            >
              {editing && editingNameId === group.id ? (
                <input
                  className="shrink-0 bg-transparent outline-none"
                  autoFocus
                  value={editingNameValue}
                  onChange={(e) => setEditingNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const name = editingNameValue.trim();
                      if (!name) {
                        if (window.confirm("Eliminare il gruppo?"))
                          deleteGroup(group.id);
                        setEditingNameId(null);
                        return;
                      }
                      renameGroup(group.id, name);
                      setEditingNameId(null);
                    }
                    if (e.key === "Escape") setEditingNameId(null);
                  }}
                  onBlur={() => {
                    const name = editingNameValue.trim();
                    if (!name) {
                      if (window.confirm("Eliminare il gruppo?"))
                        deleteGroup(group.id);
                      setEditingNameId(null);
                      return;
                    }
                    renameGroup(group.id, name);
                    setEditingNameId(null);
                  }}
                />
              ) : (
                <span
                  className="shrink-0"
                  onDoubleClick={
                    editing
                      ? () => {
                          setEditingNameId(group.id);
                          setEditingNameValue(group.name);
                        }
                      : undefined
                  }
                >
                  {group.name}
                </span>
              )}
              {editing && group.id !== "others" ? (
                <button
                  type="button"
                  className="ml-2 shrink-0 text-xs text-destructive hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm("Eliminare il gruppo?"))
                      deleteGroup(group.id);
                  }}
                >
                  Elimina
                </button>
              ) : null}
              <div className="mr-[50px] w-full text-right">
                {formatAmount({ amount: total, currency: "EUR" })}
              </div>
            </AccordionTrigger>
            <AccordionContent
              className="p-0 text-muted-foreground"
              onDragOver={
                editing
                  ? (e) => {
                      if (draggingIdRef.current) e.preventDefault();
                    }
                  : undefined
              }
              onDrop={
                editing
                  ? (e) => {
                      e.preventDefault();
                      const draggingId = draggingIdRef.current;
                      if (!draggingId) return;
                      assignMutation.mutate({
                        accountId: draggingId,
                        groupId: group.id,
                      });
                      draggingIdRef.current = null;
                    }
                  : undefined
              }
            >
              {group.accounts && group.accounts.length > 0 ? (
                <DataTable
                  data={group.accounts}
                  draggable={editing}
                  onRowDragStart={(id) => {
                    draggingIdRef.current = id;
                  }}
                />
              ) : (
                <div
                  className="flex h-24 items-center justify-center text-xs text-muted-foreground"
                  onDragOver={
                    editing
                      ? (e) => {
                          if (draggingIdRef.current) e.preventDefault();
                        }
                      : undefined
                  }
                  onDrop={
                    editing
                      ? (e) => {
                          e.preventDefault();
                          const draggingId = draggingIdRef.current;
                          if (!draggingId) return;
                          assignMutation.mutate({
                            accountId: draggingId,
                            groupId: group.id,
                          });
                          draggingIdRef.current = null;
                        }
                      : undefined
                  }
                >
                  {editing ? "Trascina qui un account" : null}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
