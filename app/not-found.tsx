import { ButtonLink } from "@/components/ui/button";
import { StarMark } from "@/components/ui/star";

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center"
    >
      <StarMark className="size-12 text-primary" />
      <h1 className="mt-6 font-serif text-[2.25rem] leading-tight text-ink">
        This page isn&apos;t here
      </h1>
      <p className="mt-3 text-ink-2">
        The link may be mistyped, or the page may have moved.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <ButtonLink href="/" size="lg" block>
          Go to home
        </ButtonLink>
        <ButtonLink href="/explore" variant="quiet" size="lg" block>
          Explore the Names
        </ButtonLink>
      </div>
    </main>
  );
}
