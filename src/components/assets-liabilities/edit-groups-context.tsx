"use client";

import { createContext, useContext, useState } from "react";

type EditGroupsContextType = {
  editing: boolean;
  setEditing: (value: boolean) => void;
};

const EditGroupsContext = createContext<EditGroupsContextType | undefined>(
  undefined,
);

export function EditGroupsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <EditGroupsContext.Provider value={{ editing, setEditing }}>
      {children}
    </EditGroupsContext.Provider>
  );
}

export function useEditGroups() {
  const ctx = useContext(EditGroupsContext);
  if (!ctx) throw new Error("useEditGroups must be used within provider");
  return ctx;
}
