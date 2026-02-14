import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [watchlist, setWatchlist] = useLocalStorage("ct_watchlist", []);
  const [portfolio, setPortfolio] = useLocalStorage("ct_portfolio", []);
  const [alerts, setAlerts] = useLocalStorage("ct_alerts", []);
  const [themeMode, setThemeMode] = useLocalStorage("ct_theme", "light");
  const [coinSnapshots, setCoinSnapshots] = useLocalStorage("ct_coin_snapshots", {});

  const toggleWatchlist = (coinId) => {
    setWatchlist((prev) =>
      prev.includes(coinId) ? prev.filter((id) => id !== coinId) : [...prev, coinId]
    );
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const addPortfolioItem = (item) => {
    setPortfolio((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);

      if (!existing) {
        return [...prev, item];
      }

      const mergedAmount = Number(existing.amount) + Number(item.amount);
      const mergedValue =
        Number(existing.amount) * Number(existing.avgPrice) +
        Number(item.amount) * Number(item.avgPrice);

      return prev.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              amount: mergedAmount,
              avgPrice: mergedValue / mergedAmount,
            }
          : entry
      );
    });
  };

  const removePortfolioItem = (coinId) => {
    setPortfolio((prev) => prev.filter((entry) => entry.id !== coinId));
  };

  const addAlert = (alert) => {
    setAlerts((prev) => [...prev, alert]);
  };

  const deleteAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const saveCoinSnapshots = (coins = []) => {
    if (!coins.length) return;

    setCoinSnapshots((prev) => {
      const next = { ...prev };

      coins.forEach((coin) => {
        if (coin?.id) {
          next[coin.id] = coin;
        }
      });

      return next;
    });
  };

  // Checks alert triggers against latest market prices.
  const evaluateAlerts = (coins) => {
    if (!coins?.length || !alerts.length) return [];

    const coinById = new Map(coins.map((coin) => [coin.id, coin]));
    const triggered = [];

    const remainingAlerts = alerts.filter((alert) => {
      const coin = coinById.get(alert.coinId);
      if (!coin) return true;

      const hitAbove = alert.direction === "above" && coin.current_price >= alert.target;
      const hitBelow = alert.direction === "below" && coin.current_price <= alert.target;

      if (hitAbove || hitBelow) {
        triggered.push({
          ...alert,
          currentPrice: coin.current_price,
          coinName: coin.name,
        });
        return false;
      }

      return true;
    });

    if (triggered.length) {
      setAlerts(remainingAlerts);
    }

    return triggered;
  };

  const value = useMemo(
    () => ({
      watchlist,
      toggleWatchlist,
      portfolio,
      addPortfolioItem,
      removePortfolioItem,
      alerts,
      addAlert,
      deleteAlert,
      evaluateAlerts,
      coinSnapshots,
      saveCoinSnapshots,
      themeMode,
      toggleTheme,
    }),
    [watchlist, portfolio, alerts, coinSnapshots, themeMode]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
