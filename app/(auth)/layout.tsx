import { Title } from "@/features/auth/components";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <div className="flex w-screen h-screen">
        <div className="relative flex h-screen w-[35%] bg-gray-app-600">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-[80%] bg-gray-app-500">
            <Title />
          </div>
        </div>
        <div className="relative flex h-screen w-[65%] bg-gray-app-200">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gray-app-300">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
