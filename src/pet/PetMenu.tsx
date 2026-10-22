import { useRef, useState } from "react";
import "./PetMenu.css";

export interface PetMenuItem {
  label: string;
  /** set for a group: its items open beside the menu */
  children?: PetMenuItem[];
  onSelect?(): void;
  /** starts a new group: a line above it */
  divider?: boolean;
  /** destructive item: red, set apart by a divider */
  danger?: boolean;
}

/** how long a flyout survives the cursor brushing another row on its way over, diagonally */
const CLOSE_DELAY_MS = 300;

/**
 * `side` is where a group's items open: toward the middle of the screen, so they are never cut off at a screen edge.
 * The flyout is a child of its row (and bridges the gap to it), so moving the mouse into it never counts as leaving the menu.
 */
export function PetMenu({ items, side, onClose }: { items: PetMenuItem[]; side: "left" | "right"; onClose(): void }) {
  const [open, setOpen] = useState<string>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const arrow = side === "left" ? "‹" : "›";

  // only the outer rows decide which flyout is open; rows inside a flyout leave it alone
  const enterOuterRow = (it: PetMenuItem) => {
    clearTimeout(closeTimer.current);
    if (it.children) setOpen(it.label);
    else closeTimer.current = setTimeout(() => setOpen(undefined), CLOSE_DELAY_MS);
  };

  const row = (it: PetMenuItem, outer: boolean) => (
    <li
      key={it.label}
      className={it.danger ? "danger" : it.divider ? "divider" : undefined}
      onMouseEnter={outer ? () => enterOuterRow(it) : undefined}
    >
      <button
        className={it.children && side === "left" ? "has-sub left" : undefined}
        aria-haspopup={it.children ? "menu" : undefined}
        aria-expanded={it.children ? open === it.label : undefined}
        onClick={() => {
          if (it.children) return setOpen(open === it.label ? undefined : it.label);
          it.onSelect?.();
          onClose();
        }}
      >
        <span>{it.label}</span>
        {it.children && (
          <span className="chev" aria-hidden>
            {arrow}
          </span>
        )}
      </button>
      {it.children && open === it.label && (
        <ul className={`pet-menu flyout ${side}`} onMouseEnter={() => clearTimeout(closeTimer.current)}>
          {it.children.map((c) => row(c, false))}
        </ul>
      )}
    </li>
  );

  return (
    <ul className="pet-menu" onMouseLeave={onClose}>
      {items.map((it) => row(it, true))}
    </ul>
  );
}
