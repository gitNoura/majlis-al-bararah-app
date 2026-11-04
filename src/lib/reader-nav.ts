// The Quran's other screens (search) send the reader to a page from here: the Quran page listens
// (src/app/quran.tsx), opens that page and lights the ayah a moment, as the website does after a search.
type Go = (page: number, ayah: { s: number; a: number } | null) => void;

let listener: Go | null = null;

export function onReaderGo(fn: Go) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function readerGo(page: number, ayah: { s: number; a: number } | null = null) {
  listener?.(page, ayah);
}
