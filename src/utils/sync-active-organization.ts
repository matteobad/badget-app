"use client";

import { useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import { useAuth, useOrganizationList } from "@clerk/nextjs";

export function SyncActiveOrganization() {
  const { setActive, isLoaded } = useOrganizationList();

  // Get the organization ID from the session
  const { orgId } = useAuth();

  // Get the organization ID from the URL
  const { orgId: urlOrgId } = useParams<{ orgId: string }>();

  useEffect(() => {
    if (!isLoaded) return;

    // If the org ID in the URL is not valid, redirect to the homepage
    if (!urlOrgId?.startsWith("org_")) {
      redirect("/");
    }

    // If the org ID in the URL is not the same as the org ID in the session (the active organization), set the active organization to be the org ID from the URL
    if (urlOrgId && urlOrgId !== orgId) {
      void setActive({ organization: urlOrgId });
    }
  }, [orgId, isLoaded, setActive, urlOrgId]);

  return null;
}
