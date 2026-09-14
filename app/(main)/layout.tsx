import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-ink focus:translate-y-[env(safe-area-inset-top)]"
      >
        Skip to content
      </a>
      <AppHeader />
      <main
        id="main"
        className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-16"
      >
        {children}
      </main>
      <BottomNav />
    </>
  );
}
