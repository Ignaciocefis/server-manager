export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <main>{children}</main>
    </div>
  );
}
