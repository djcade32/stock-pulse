"use client";

import * as React from "react";

import { BiSolidHome } from "react-icons/bi";
import { FaEye, FaBell, FaMicrophoneAlt } from "react-icons/fa";
import { FaNewspaper } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BiSolidHome,
    },
    {
      title: "Watch List",
      url: "/watchlist",
      icon: FaEye,
    },
    {
      title: "Earnings",
      url: "/earnings",
      icon: FaMicrophoneAlt,
    },
    {
      title: "News",
      url: "/news",
      icon: FaNewspaper,
    },
    {
      title: "Alerts",
      url: "/alerts",
      icon: FaBell,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IoSettingsSharp,
    },
  ],
};

export const SideMenu = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const [hideLogo, setHideLogo] = React.useState(false);
  // const menuOpened = useSidebar().state === "expanded";
  const isMobile = useIsMobile();

  // React.useEffect(() => {
  //   if (menuOpened && hideLogo) {
  //     setHideLogo(false);
  //   }
  // }, [menuOpened]);

  return (
    <Sidebar collapsible="icon" {...props} className="border-none w-[300px]">
      <SidebarHeader className="py-2">
        <div className="flex items-center justify-center py-3">
          <Image src="/stock_pulse_icon.png" alt="Stock Pulse logo" width={35} height={35} />
          {/* <a
            href="#"
            className={cn(
              "flex items-center gap-2 w-fit",
              hideLogo ? "hidden" : "flex",
              menuOpened ? "pl-2" : "pl-0"
            )}
            onMouseOver={() => !menuOpened && setHideLogo(true)}
          >
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <Image src="/stock_pulse_icon.png" alt="Stock Pulse logo" width={45} height={45} />
            </div>
          </a>
          <SidebarTrigger
            className={(hideLogo || menuOpened) && !isMobile ? "flex" : "hidden"}
            onMouseLeave={() => !menuOpened && setHideLogo(false)}
          /> */}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
};
