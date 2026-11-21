type BrewBus = {
  origin: string;
  price: number;
  roast: string;
  listeners: Set<() => void>;
};

function bus(): BrewBus {
  const host = window as Window & { __cfBrew?: BrewBus };
  if (!host.__cfBrew) {
    host.__cfBrew = { origin: "", price: 0, roast: "", listeners: new Set() };
  }
  return host.__cfBrew;
}

export function brewState(): Pick<BrewBus, "origin" | "price" | "roast"> {
  const current = bus();
  return { origin: current.origin, price: current.price, roast: current.roast };
}

/** Shared across section bundles through `window`, because each file inlines its own copy of this module. */
export function setBrew(partial: Partial<Pick<BrewBus, "origin" | "price" | "roast">>): void {
  const current = bus();
  const origin = partial.origin ?? current.origin;
  const price = partial.price ?? current.price;
  const roast = partial.roast ?? current.roast;
  if (origin === current.origin && price === current.price && roast === current.roast) return;
  current.origin = origin;
  current.price = price;
  current.roast = roast;
  current.listeners.forEach((fn) => fn());
}

export function watchBrew(fn: () => void): () => void {
  const current = bus();
  current.listeners.add(fn);
  return () => current.listeners.delete(fn);
}

export function roundToFive(value: number): number {
  return Math.round(value / 5) * 5;
}
