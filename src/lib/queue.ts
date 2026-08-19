import { cards } from "../data/cards";
import { dueCardIds, type AppState } from "./store";

/** How many cards one review session hands out at most. */
export const SESSION_CAP = 30;

/**
 * Flashcards unlock as lessons get read. Handing a brand new learner all 129
 * cards on day one is the fastest way to make them close the tab; a card only
 * enters the rotation once its lesson has been marked read (or once it has
 * already been seen via "ôn trước").
 */
export function activeCardIds(state: AppState): string[] {
  return cards
    .filter((c) => state.progress[c.sectionId]?.read || state.srs[c.id]?.introduced)
    .map((c) => c.id);
}

/** Cards actually due today, capped to a session that finishes in one sitting. */
export function dueQueue(state: AppState): string[] {
  return dueCardIds(activeCardIds(state));
}
