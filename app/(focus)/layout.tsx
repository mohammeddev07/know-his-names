/** Distraction-free layout for learning and review sessions. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="main" className="min-h-dvh">
      {children}
    </main>
  );
}
