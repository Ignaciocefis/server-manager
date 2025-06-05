import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Shared/AppSidebar";
import { Navbar } from "@/components/Shared/Navbar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full flex flex-col min-h-screen">
        <Navbar />
        <main>{children}</main>
      </div>
    </SidebarProvider>
  );
}
