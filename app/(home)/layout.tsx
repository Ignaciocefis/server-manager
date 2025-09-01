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
        <main className="flex flex-col w-full mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
