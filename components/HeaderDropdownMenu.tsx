"use client";

import React, { useState } from "react";
import { CircleUser, Settings, LogOut, ChevronDown } from "lucide-react";
import DropdownMenu from "./general/DropdownMenu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUid } from "@/hooks/useUid";
import { auth } from "@/firebase/client";
import LoaderComponent from "./general/LoaderComponent";

async function postJSON<T = any>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

const HeaderDropdownMenu = () => {
  const router = useRouter();
  const { loading } = useUid();
  const user = auth.currentUser;
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const DROPDOWN_ITEMS = [
    { label: "Profile", icon: <CircleUser size={16} />, onClick: () => router.push("/profile") },
    { label: "Settings", icon: <Settings size={16} /> },
    {
      label: "Sign Out",
      icon: <LogOut size={16} />,
      onClick: async () => await postJSON("/api/auth/sign-out").then(() => router.push("/sign-in")),
    },
  ];

  return (
    <LoaderComponent loading={loading} height="40px" width="140px" rounded="lg">
      <DropdownMenu
        items={DROPDOWN_ITEMS}
        sideOffset={10}
        renderTrigger={
          <div
            onMouseEnter={() => setIsHovered(!isHovered)}
            onMouseLeave={() => setIsHovered(!isHovered)}
            className="flex items-center gap-2 cursor-pointer font-bold hover:bg-(--color-sidebar-accent) transition-colors duration-200 p-2 rounded-lg"
          >
            <CircleUser
              color={cn(isHovered ? "var(--foreground)" : "var(--secondary-text-color)")}
              className="cursor-pointer"
            />
            <p>{user?.displayName}</p>
            <ChevronDown
              color="var(--secondary-text-color)"
              className={`cursor-pointer ${
                isOpen && "rotate-180 transition-transform duration-200"
              }`}
            />
          </div>
        }
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </LoaderComponent>
  );
};

export default HeaderDropdownMenu;
