import { useEffect, useRef, useState } from "react";
import "./App.css";
import BottomNav, { type TabKey } from "./components/BottomNav";
import Header from "./components/Header";
import Home from "./pages/Home";
import School from "./pages/School";
import Finance from "./pages/Finance";
import Gym from "./pages/Gym";
import ScrollTime from "./pages/ScrollTime";
import Settings from "./pages/Settings";

const TAB_TITLES: Record<TabKey, string> = {
  home: "Deadline Hub",
  school: "School",
  finance: "Finance",
  gym: "Gym",
  scroll: "Scroll Time",
};

export default function App() {
  const [tab, setTab] = useState<TabKey>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = 0;
    setScrolled(false);
  }, [tab, settingsOpen]);

  function handleScroll(e: React.UIEvent<HTMLElement>) {
    setScrolled(e.currentTarget.scrollTop > 8);
  }

  const title = settingsOpen ? "Settings" : TAB_TITLES[tab];

  return (
    <div className="app-shell">
      <Header
        title={title}
        scrolled={scrolled}
        onBack={settingsOpen ? () => setSettingsOpen(false) : undefined}
        onSettings={settingsOpen ? undefined : () => setSettingsOpen(true)}
      />
      <main className="app-content" ref={contentRef} onScroll={handleScroll}>
        {(settingsOpen || tab !== "home") && <h1 className="large-title">{title}</h1>}
        {settingsOpen ? (
          <Settings />
        ) : (
          <>
            {tab === "home" && <Home onNavigate={setTab} />}
            {tab === "school" && <School />}
            {tab === "finance" && <Finance />}
            {tab === "gym" && <Gym />}
            {tab === "scroll" && <ScrollTime />}
          </>
        )}
      </main>
      {!settingsOpen && <BottomNav active={tab} onChange={setTab} />}
    </div>
  );
}
