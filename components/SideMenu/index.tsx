"use client";

import * as React from "react";

import { BiSolidHome } from "react-icons/bi";
import { FaEye, FaBell, FaMicrophoneAlt, FaCalendar } from "react-icons/fa";
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
import BetaBadge from "../BetaBadge";

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
      title: "Upcoming Events",
      url: "/upcoming-events",
      icon: FaCalendar,
    },
    {
      title: "News",
      url: "/news",
      icon: FaNewspaper,
    },
    // {
    //   title: "Alerts",
    //   url: "/alerts",
    //   icon: FaBell,
    // },
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: IoSettingsSharp,
    // },
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
          <div className="flex items-center md:hidden">
            <Image
              src="/stock_pulse_logo.png"
              alt="StockWisp Logo"
              width={150}
              height={150}
              priority
            />
            <BetaBadge />
          </div>
          <Image
            src="/stock_pulse_icon.png"
            alt="StockWisp logo"
            width={32}
            height={32}
            className="hidden md:block"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
};
