import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAppState } from "./context/AppStateContext";
import HomePage from "./pages/HomePage";
import CoinDetailPage from "./pages/CoinDetailPage";
import WatchlistPage from "./pages/WatchlistPage";
import FlowingCoins from "./components/FlowingCoins";
import LandingPage from "./pages/LandingPage";
import "./styles.css";

function AppShell() {
  const { themeMode } = useAppState();

  useEffect(() => {
    document.body.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <div className="app-shell">
      {/* Animated background layers */}
      <div className="bg-orbs" aria-hidden="true">
        {/* Glowing orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-orb bg-orb-4" />

        {/* Geometric mesh grid */}
        <div className="bg-mesh" />

        {/* Scan sweep line */}
        <div className="bg-scan" />

        {/* Light ray streaks */}
        <div className="bg-rays">
          <div className="bg-ray bg-ray-1" />
          <div className="bg-ray bg-ray-2" />
          <div className="bg-ray bg-ray-3" />
          <div className="bg-ray bg-ray-4" />
          <div className="bg-ray bg-ray-5" />
        </div>

        {/* Twinkling star particles */}
        <div className="bg-star" />
        <div className="bg-star" />
        <div className="bg-star" />
        <div className="bg-star" />
        <div className="bg-star" />
        <div className="bg-star" />
        <div className="bg-star" />
        <div className="bg-star" />

        {/* Noise overlay */}
        <div className="bg-noise" />

        {/* 3D Flowing crypto coins */}
        <FlowingCoins />
      </div>

      <Navbar />
      <main className="container main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/coin/:id" element={<CoinDetailPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showLanding) {
    return <LandingPage />;
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
