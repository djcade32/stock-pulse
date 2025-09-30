"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";

interface SidebarItem {
  title: string;
  url: string;
  icon: IconType | LucideIcon;
}

export const NavMain = ({ items }: { items: SidebarItem[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, toggleSidebar } = useSidebar();

  const handlePress = (url: string) => {
    if (isMobile) {
      toggleSidebar();
    }
    router.push(url);
  };
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-7 mt-3">
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="flex items-center justify-center">
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => handlePress(item.url)}
                className={`cursor-pointer`}
                size={"lg"}
                asChild
                isActive={pathname?.includes(item.url)}
                // isActive={pathname === item.url}
              >
                <item.icon />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
