import React from "react";
import Input from "./general/Input";
import { Search, Bell, CircleUser, Settings, LogOut } from "lucide-react";
import DropdownMenu from "./general/DropdownMenu";
import { signOut } from "@/lib/actions/auth.client.action";
// import { useRouter } from "next/navigation";

const signOutAction = async () => {
  // const router = useRouter();
  await signOut();
  // router.replace("/sign-in");
};

const DROPDOWN_ITEMS = [
  { label: "Profile", icon: <CircleUser size={16} /> },
  { label: "Settings", icon: <Settings size={16} /> },
  { label: "Logout", icon: <LogOut size={16} />, onClick: signOut },
];

const Header = () => {
  return (
    <nav className="border-b-2 border-(--secondary-color) bg-(--background) py-3 px-10 flex items-center fixed top-0 md:left-[64px] right-0 z-50 ">
      <div className="flex items-center gap-10 flex-1">
        <p className="font-black text-2xl tracking-tighter">StockPulse</p>
        <Input
          type="text"
          placeholder="Search ticker or company..."
          preIcon={<Search color="var(--secondary-text-color)" size={20} />}
          className="bg-(--secondary-color) max-w-[300px] border-(--gray-accent-color) py-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="hover:bg-(--color-sidebar-accent) transition-colors duration-200 p-2 rounded-lg cursor-pointer">
          <Bell color="var(--secondary-text-color)" className="cursor-pointer" />
        </div>
        <DropdownMenu items={DROPDOWN_ITEMS} sideOffset={20} />
      </div>
    </nav>
  );
};

export default Header;
