import { ButtonLink } from "@/components/ui/button";
import { SessionMessage } from "./session-states";

export function StorageUnavailable() {
  return (
    <SessionMessage
      title="Progress can't be saved here"
      actions={
        <ButtonLink href="/explore" size="lg" block>
          Explore the Names
        </ButtonLink>
      }
    >
      <p>
        This browser isn&apos;t allowing the app to store data, which it needs
        to remember your progress. Private browsing or strict privacy settings
        often cause this. You can still explore all 99 Names.
      </p>
    </SessionMessage>
  );
}
