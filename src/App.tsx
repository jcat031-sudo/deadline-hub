import { useState } from "react";
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

  return (
    <div className="app-shell">
      <Header
        title={settingsOpen ? "Settings" : TAB_TITLES[tab]}
        onBack={settingsOpen ? () => setSettingsOpen(false) : undefined}
        onSettings={settingsOpen ? undefined : () => setSettingsOpen(true)}
      />
      <main className="app-content">
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
