import "./PetMenu.css";

export interface PetMenuItem {
  label: string;
  onSelect(): void;
  /** starts a new group: a line above it */
  divider?: boolean;
  /** destructive item: red, set apart by a divider */
  danger?: boolean;
}

export function PetMenu({ items, onClose }: { items: PetMenuItem[]; onClose(): void }) {
  return (
    <ul className="pet-menu" onMouseLeave={onClose}>
      {items.map((it) => (
        <li key={it.label} className={it.danger ? "danger" : it.divider ? "divider" : undefined}>
          <button
            onClick={() => {
              it.onSelect();
              onClose();
            }}
          >
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
