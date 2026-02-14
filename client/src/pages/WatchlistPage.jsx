import { useEffect, useState } from "react";
import { cryptoApi } from "../api/cryptoApi";
import MarketTable from "../components/MarketTable";
import PortfolioTracker from "../components/PortfolioTracker";
import { useAppState } from "../context/AppStateContext";

export default function WatchlistPage() {
  const { watchlist, coinSnapshots, saveCoinSnapshots } = useAppState();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!watchlist.length) {
        setCoins([]);
        setLoading(false);
        return;
      }

      const snapshotCoins = watchlist.map((coinId) => coinSnapshots[coinId]).filter(Boolean);
      setCoins(snapshotCoins);

      setLoading(!snapshotCoins.length);
      try {
        const response = await cryptoApi.getCoins({ ids: watchlist.join(",") });
        setCoins(response.coins || []);
        saveCoinSnapshots(response.coins || []);
      } catch (error) {
        console.error("Failed to load watchlist coins", error);
      } finally {
        setLoading(false);
      }
    };

    load();

    const interval = setInterval(load, 45000);
    return () => clearInterval(interval);
  }, [watchlist]);

  if (!watchlist.length) {
    return (
      <section className="panel empty-state">
        <h1>Your watchlist is empty</h1>
        <p>Add coins from the market table to start tracking them here.</p>
      </section>
    );
  }

  return (
    <>
      <MarketTable coins={coins} isLoading={loading && !coins.length} />
      <PortfolioTracker coins={coins} />
    </>
  );
}
