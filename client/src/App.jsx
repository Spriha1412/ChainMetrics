import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAppState } from "./context/AppStateContext";
import HomePage from "./pages/HomePage";
import CoinDetailPage from "./pages/CoinDetailPage";
import WatchlistPage from "./pages/WatchlistPage";
import "./styles.css";

function AppShell() {
  const { themeMode } = useAppState();

  useEffect(() => {
    document.body.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coin/:id" element={<CoinDetailPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
