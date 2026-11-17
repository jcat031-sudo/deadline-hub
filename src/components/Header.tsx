import { BackIcon, SettingsIcon } from "./icons";

export default function Header({
  title,
  scrolled,
  onBack,
  onSettings,
}: {
  title: string;
  scrolled: boolean;
  onBack?: () => void;
  onSettings?: () => void;
}) {
  return (
    <header className={`app-header${scrolled ? " app-header--scrolled" : ""}`}>
      <div className="app-header__side">
        {onBack && (
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
        )}
      </div>
      <h1 className="app-header__title">{title}</h1>
      <div className="app-header__side app-header__side--right">
        {onSettings && (
          <button className="icon-btn" onClick={onSettings} aria-label="Settings">
            <SettingsIcon size={21} />
          </button>
        )}
      </div>
    </header>
  );
}
