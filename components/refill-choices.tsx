"use client";

import { cartridgeFamilies } from "@/lib/cartridge-photos";

export type RefillChoice = {
  id: string;
  code: string;
  shade: string;
  family: string;
  color: string;
};

export function RefillChoices({
  options,
  selectedId,
  onSelect,
}: {
  options: RefillChoice[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = options.find((option) => option.id === selectedId);
  return (
    <div className="refill-choices">
      {cartridgeFamilies.map((family) => {
        const group = options.filter((option) => option.family === family);
        if (!group.length) return null;
        return (
          <section key={family} aria-label={family} className={selected?.family === family ? "is-on" : undefined}>
            <p>{family}</p>
            <div role="listbox" aria-label={`${family} cartridges`}>
              {group.map((option) => {
                const on = option.id === selectedId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    aria-label={`${option.code} ${option.shade}`}
                    className={on ? "is-on" : undefined}
                    onClick={() => onSelect(option.id)}
                  >
                    <span aria-hidden="true">
                      <i style={{ background: option.color }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      {selected ? <p className="trio-selected">{selected.code} — {selected.shade}</p> : null}
    </div>
  );
}
