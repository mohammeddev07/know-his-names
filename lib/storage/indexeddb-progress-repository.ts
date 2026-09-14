import {
  DEFAULT_PREFERENCES,
  type CardState,
  type ReviewEvent,
  type UserPreferences,
} from "@/lib/learning/types";
import {
  StorageUnavailableError,
  type ProgressRepository,
  type ProgressSnapshot,
  type ReviewHistoryQuery,
} from "./progress-repository";
import {
  cardStateSchema,
  preferencesSchema,
  reviewEventSchema,
} from "./records";

const DB_VERSION = 1;
const CARDS = "cards";
const REVIEWS = "reviews";
const META = "meta";
const PREFERENCES_KEY = "preferences";
const ROLLBACK_KEY = "rollback";

interface RollbackRecord {
  key: typeof ROLLBACK_KEY;
  savedAt: string;
  snapshot: { cards: unknown[]; reviews: unknown[]; preferences: unknown };
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () =>
      reject(tx.error ?? new DOMException("Transaction aborted", "AbortError"));
  });
}

function openDatabase(name: string): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new StorageUnavailableError());
  }
  return new Promise((resolve, reject) => {
    let open: IDBOpenDBRequest;
    try {
      open = indexedDB.open(name, DB_VERSION);
    } catch (error) {
      reject(new StorageUnavailableError(error));
      return;
    }
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(CARDS)) {
        db.createObjectStore(CARDS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(REVIEWS)) {
        const reviews = db.createObjectStore(REVIEWS, { keyPath: "id" });
        reviews.createIndex("cardId", "cardId");
        reviews.createIndex("reviewedAt", "reviewedAt");
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: "key" });
      }
    };
    open.onsuccess = () => {
      const db = open.result;
      // Let a newer version of the app upgrade the database in another tab.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    open.onerror = () => reject(new StorageUnavailableError(open.error));
  });
}

/** Keeps valid records and reports how many were unreadable. */
function keepValid<T>(
  records: unknown[],
  parse: (value: unknown) => { success: boolean; data?: T },
  label: string,
): T[] {
  const valid: T[] = [];
  for (const record of records) {
    const result = parse(record);
    if (result.success) valid.push(result.data as T);
  }
  if (valid.length < records.length) {
    console.warn(`Skipped ${records.length - valid.length} unreadable ${label} record(s).`);
  }
  return valid;
}

const parseCard = (value: unknown) => cardStateSchema.safeParse(value);
const parseReview = (value: unknown) => reviewEventSchema.safeParse(value);

function readPreferences(raw: unknown): UserPreferences {
  const stored = raw && typeof raw === "object" ? raw : {};
  const result = preferencesSchema.safeParse({ ...DEFAULT_PREFERENCES, ...stored });
  return result.success ? result.data : DEFAULT_PREFERENCES;
}

function byReviewedAt(a: ReviewEvent, b: ReviewEvent) {
  return a.reviewedAt < b.reviewedAt ? -1 : a.reviewedAt > b.reviewedAt ? 1 : 0;
}

/** Validates a record before it is written, so bad data never reaches storage. */
function assertValid<T>(schema: { parse(value: unknown): T }, value: unknown): T {
  return schema.parse(value);
}

export const DEFAULT_DB_NAME = "know-his-names";

export class IndexedDbProgressRepository implements ProgressRepository {
  private connection: Promise<IDBDatabase> | null = null;

  constructor(private readonly dbName: string = DEFAULT_DB_NAME) {}

  private db(): Promise<IDBDatabase> {
    this.connection ??= openDatabase(this.dbName).catch((error) => {
      this.connection = null;
      throw error;
    });
    return this.connection;
  }

  /** Runs `work` in one transaction; resolves only after the transaction commits. */
  private async run<T>(
    stores: string[],
    mode: IDBTransactionMode,
    work: (tx: IDBTransaction) => Promise<T>,
  ): Promise<T> {
    const db = await this.db();
    const tx = db.transaction(stores, mode);
    const committed = transactionDone(tx);
    committed.catch(() => {});
    try {
      const result = await work(tx);
      await committed;
      return result;
    } catch (error) {
      try {
        tx.abort();
      } catch {
        // Already finished or aborted.
      }
      throw error;
    }
  }

  async getCardState(cardId: string): Promise<CardState | null> {
    const raw = await this.run([CARDS], "readonly", (tx) =>
      request(tx.objectStore(CARDS).get(cardId)),
    );
    const result = parseCard(raw);
    return result.success ? result.data : null;
  }

  async getAllCardStates(): Promise<CardState[]> {
    const raw = await this.run([CARDS], "readonly", (tx) =>
      request(tx.objectStore(CARDS).getAll()),
    );
    return keepValid(raw, parseCard, "card");
  }

  async saveCardState(state: CardState): Promise<void> {
    const record = assertValid(cardStateSchema, state);
    await this.run([CARDS], "readwrite", async (tx) => {
      await request(tx.objectStore(CARDS).put(record));
    });
  }

  async saveReview(state: CardState, event: ReviewEvent): Promise<void> {
    const card = assertValid(cardStateSchema, state);
    const review = assertValid(reviewEventSchema, event);
    await this.run([CARDS, REVIEWS], "readwrite", async (tx) => {
      await request(tx.objectStore(CARDS).put(card));
      // add(), not put(): an event id can never be overwritten.
      await request(tx.objectStore(REVIEWS).add(review));
    });
  }

  async getReviewHistory(query: ReviewHistoryQuery = {}): Promise<ReviewEvent[]> {
    const raw = await this.run([REVIEWS], "readonly", (tx) => {
      const store = tx.objectStore(REVIEWS);
      if (query.cardId) return request(store.index("cardId").getAll(query.cardId));
      if (query.since) {
        return request(
          store.index("reviewedAt").getAll(IDBKeyRange.lowerBound(query.since.toISOString())),
        );
      }
      return request(store.getAll());
    });
    const since = query.since?.toISOString();
    return keepValid(raw, parseReview, "review")
      .filter((event) => !since || event.reviewedAt >= since)
      .sort(byReviewedAt);
  }

  async getPreferences(): Promise<UserPreferences> {
    const record = await this.run([META], "readonly", (tx) =>
      request(tx.objectStore(META).get(PREFERENCES_KEY)),
    );
    return readPreferences(record?.value);
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    const value = assertValid(preferencesSchema, preferences);
    await this.run([META], "readwrite", async (tx) => {
      await request(tx.objectStore(META).put({ key: PREFERENCES_KEY, value }));
    });
  }

  async exportSnapshot(): Promise<ProgressSnapshot> {
    return this.run([CARDS, REVIEWS, META], "readonly", async (tx) => {
      const [cards, reviews, prefs] = await Promise.all([
        request(tx.objectStore(CARDS).getAll()),
        request(tx.objectStore(REVIEWS).getAll()),
        request(tx.objectStore(META).get(PREFERENCES_KEY)),
      ]);
      return {
        cards: keepValid(cards, parseCard, "card"),
        reviews: keepValid(reviews, parseReview, "review").sort(byReviewedAt),
        preferences: readPreferences(prefs?.value),
      };
    });
  }

  async replaceAll(snapshot: ProgressSnapshot): Promise<void> {
    const cards = snapshot.cards.map((c) => assertValid(cardStateSchema, c));
    const reviews = snapshot.reviews.map((r) => assertValid(reviewEventSchema, r));
    const preferences = assertValid(preferencesSchema, snapshot.preferences);

    await this.run([CARDS, REVIEWS, META], "readwrite", async (tx) => {
      const cardStore = tx.objectStore(CARDS);
      const reviewStore = tx.objectStore(REVIEWS);
      const metaStore = tx.objectStore(META);
      const [currentCards, currentReviews, currentPrefs] = await Promise.all([
        request(cardStore.getAll()),
        request(reviewStore.getAll()),
        request(metaStore.get(PREFERENCES_KEY)),
      ]);
      const rollback: RollbackRecord = {
        key: ROLLBACK_KEY,
        savedAt: new Date().toISOString(),
        snapshot: {
          cards: currentCards,
          reviews: currentReviews,
          preferences: currentPrefs?.value ?? null,
        },
      };
      await request(metaStore.put(rollback));
      await writeAll(tx, { cards, reviews, preferences });
    });
  }

  async getRollbackSavedAt(): Promise<string | null> {
    const record = (await this.run([META], "readonly", (tx) =>
      request(tx.objectStore(META).get(ROLLBACK_KEY)),
    )) as RollbackRecord | undefined;
    return record?.savedAt ?? null;
  }

  async restoreRollback(): Promise<void> {
    await this.run([CARDS, REVIEWS, META], "readwrite", async (tx) => {
      const metaStore = tx.objectStore(META);
      const record = (await request(metaStore.get(ROLLBACK_KEY))) as
        | RollbackRecord
        | undefined;
      if (!record) throw new Error("There is no previous progress to restore.");
      await writeAll(tx, record.snapshot);
      await request(metaStore.delete(ROLLBACK_KEY));
    });
  }
}

async function writeAll(
  tx: IDBTransaction,
  data: { cards: unknown[]; reviews: unknown[]; preferences: unknown },
) {
  const cardStore = tx.objectStore(CARDS);
  const reviewStore = tx.objectStore(REVIEWS);
  const metaStore = tx.objectStore(META);
  await Promise.all([request(cardStore.clear()), request(reviewStore.clear())]);
  await Promise.all([
    ...data.cards.map((card) => request(cardStore.put(card))),
    ...data.reviews.map((review) => request(reviewStore.add(review))),
    data.preferences
      ? request(metaStore.put({ key: PREFERENCES_KEY, value: data.preferences }))
      : request(metaStore.delete(PREFERENCES_KEY)),
  ]);
}
