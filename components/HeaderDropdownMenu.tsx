"use client";

import React, { useState } from "react";
import { CircleUser, Settings, LogOut, ChevronDown } from "lucide-react";
import DropdownMenu from "./general/DropdownMenu";
import { signOut } from "@/lib/actions/auth.client.action";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUid } from "@/hooks/useUid";
import { auth } from "@/firebase/client";
import LoaderComponent from "./general/LoaderComponent";

const HeaderDropdownMenu = () => {
  const router = useRouter();
  const { uid, loading } = useUid();
  const user = auth.currentUser;
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const DROPDOWN_ITEMS = [
    { label: "Profile", icon: <CircleUser size={16} />, onClick: () => router.push("/profile") },
    { label: "Settings", icon: <Settings size={16} /> },
    {
      label: "Sign Out",
      icon: <LogOut size={16} />,
      onClick: async () => await signOut(),
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
