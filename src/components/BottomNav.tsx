import { FinanceIcon, GymIcon, HomeIcon, SchoolIcon, ScrollIcon } from "./icons";

export type TabKey = "home" | "school" | "finance" | "fitness" | "scroll";

const TABS: { key: TabKey; label: string; Icon: typeof HomeIcon }[] = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "school", label: "School", Icon: SchoolIcon },
  { key: "finance", label: "Finance", Icon: FinanceIcon },
  { key: "fitness", label: "Fitness", Icon: GymIcon },
  { key: "scroll", label: "Scroll", Icon: ScrollIcon },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`bottom-nav__item${active === key ? " bottom-nav__item--active" : ""}`}
          onClick={() => onChange(key)}
          aria-label={label}
        >
          <Icon size={23} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
