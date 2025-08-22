import "../globals.css";
import { SideMenu } from "@/components/SideMenu";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { isAuthenticated } from "@/lib/actions/auth.server.action";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <SideMenu />
      <div className="w-full relative">
        <Header />
        <div className="pt-[68px]">{children}</div>
      </div>
    </SidebarProvider>
  );
}
