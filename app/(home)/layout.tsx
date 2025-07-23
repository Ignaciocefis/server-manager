import { AppSidebar, Navbar } from "@/components/Shared";
import { SidebarProvider } from "@/components/ui/sidebar";

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
