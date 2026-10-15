/* What the contact deck lists besides the contact buttons. */

/* A short note shown at the top of the deck, e.g. which month has project slots
   open. Left null until there is something true to say; set it per language and
   the deck picks it up. Change `id` when the text changes so a visitor who
   dismissed the old note sees the new one. */
export const announcement: { id: string; en: string; ms: string } | null = null;

export type Notice = { id: string; text: string; tone?: "info" | "error" };

/* A tiny store so any component can post a message to the deck without the deck
   importing it. Forms keep their own inline notices next to the fields they
   describe; this is for things that belong to no one field. */
let notices: Notice[] = [];
const listeners = new Set<(list: Notice[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(notices));
}

export function notify(notice: Notice) {
  notices = [notice, ...notices.filter((n) => n.id !== notice.id)].slice(0, 5);
  emit();
}

export function dismissNotice(id: string) {
  notices = notices.filter((n) => n.id !== id);
  emit();
}

export function subscribeNotices(listener: (list: Notice[]) => void) {
  listeners.add(listener);
  listener(notices);
  return () => {
    listeners.delete(listener);
  };
}
