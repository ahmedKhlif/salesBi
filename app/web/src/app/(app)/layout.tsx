import { Suspense } from "react";
import { FilterProvider } from "@/components/providers/filter-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { GlobalFilterBar } from "@/components/filters/global-filter-bar";
import { PageContainer } from "@/components/layout/page-container";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading SalesLens...</div>}>
      <FilterProvider>
        <div className="flex min-h-screen overflow-x-clip bg-transparent text-[var(--foreground)]">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Header />
            <GlobalFilterBar />
            <PageContainer>{children}</PageContainer>
          </div>
        </div>
      </FilterProvider>
    </Suspense>
  );
}
