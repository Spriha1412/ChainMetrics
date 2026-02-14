import { useEffect, useMemo, useState } from "react";
import { cryptoApi } from "../api/cryptoApi";
import { useAppState } from "../context/AppStateContext";
import SearchBar from "../components/SearchBar";
import TrendingSection from "../components/TrendingSection";
import MoversSection from "../components/MoversSection";
import MarketTable from "../components/MarketTable";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { formatCompactCurrency } from "../utils/formatters";

const REFRESH_MS = 45000;
const PER_PAGE = 25;

export default function HomePage() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [trending, setTrending] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [global, setGlobal] = useState(null);
  const [alertHits, setAlertHits] = useState([]);

  const { evaluateAlerts, saveCoinSnapshots } = useAppState();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadCoins = async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);

    try {
      const data = await cryptoApi.getCoins({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
      });

      setCoins(data.coins || []);
      saveCoinSnapshots(data.coins || []);
      const triggered = evaluateAlerts(data.coins || []);

      if (triggered.length) {
        setAlertHits((prev) => [...triggered, ...prev].slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load coins", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeta = async () => {
    setIsMetaLoading(true);
    try {
      const [trendingData, marketsData] = await Promise.all([
        cryptoApi.getTrending(),
        cryptoApi.getMarkets(),
      ]);
      setTrending(trendingData.coins || []);
      setGainers(marketsData.topGainers || []);
      setLosers(marketsData.topLosers || []);
      setGlobal(marketsData.global || null);
    } catch (error) {
      console.error("Failed to load market meta", error);
    } finally {
      setIsMetaLoading(false);
    }
  };

  useEffect(() => {
    loadCoins();
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadCoins({ silent: true });
      loadMeta();
    }, REFRESH_MS);

    return () => clearInterval(interval);
  }, [page, debouncedSearch]);

  const marketStats = useMemo(() => {
    if (!global) return [];

    return [
      { label: "Crypto Market Cap", value: formatCompactCurrency(global.total_market_cap?.usd) },
      {
        label: "24h Volume",
        value: formatCompactCurrency(global.total_volume?.usd),
      },
      {
        label: "BTC Dominance",
        value: `${(global.market_cap_percentage?.btc || 0).toFixed(2)}%`,
      },
    ];
  }, [global]);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Track Crypto Markets in Real Time</h1>
          <p>Fast updates, premium visuals, and cleaner architecture than legacy market dashboards.</p>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </section>

      {!!alertHits.length && (
        <section className="alerts-banner">
          {alertHits.map((hit) => (
            <div key={hit.id}>
              Alert hit: {hit.coinName} is now ${hit.currentPrice.toFixed(2)} ({hit.direction} ${hit.target})
            </div>
          ))}
        </section>
      )}

      <section className="stats-grid">
        {isMetaLoading
          ? [1, 2, 3].map((value) => <CardSkeleton key={value} />)
          : marketStats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
      </section>

      <section className="top-grid">
        {isMetaLoading ? <CardSkeleton /> : <TrendingSection coins={trending} />}
        {isMetaLoading ? <CardSkeleton /> : <MoversSection gainers={gainers} losers={losers} />}
      </section>

      <MarketTable coins={coins} isLoading={isLoading} />

      <section className="pagination">
        <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={coins.length < PER_PAGE}
        >
          Next
        </button>
      </section>
    </>
  );
}
