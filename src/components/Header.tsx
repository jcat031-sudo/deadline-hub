import { BackIcon, SettingsIcon } from "./icons";

export default function Header({
  title,
  onBack,
  onSettings,
}: {
  title: string;
  onBack?: () => void;
  onSettings?: () => void;
}) {
  return (
    <header className="app-header">
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
            <SettingsIcon size={22} />
          </button>
        )}
      </div>
    </header>
  );
}
