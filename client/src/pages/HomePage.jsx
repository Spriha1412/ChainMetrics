import { useEffect, useMemo, useRef, useState } from "react";
import { cryptoApi } from "../api/cryptoApi";
import { useAppState } from "../context/AppStateContext";
import SearchBar from "../components/SearchBar";
import TrendingSection from "../components/TrendingSection";
import MoversSection from "../components/MoversSection";
import MarketTable from "../components/MarketTable";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { formatCompactCurrency } from "../utils/formatters";
import { useScrollReveal, useScrollRevealChildren } from "../hooks/useScrollReveal";

const REFRESH_MS = 45000;
const PER_PAGE = 25;

/** Number ticker: smoothly counts from 0 → target */
function AnimatedValue({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(value);
  const animRef = useRef(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current || 0;
    const to = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.\-]/g, "")) || 0;
    if (from === to || isNaN(to)) { setDisplay(value); prevRef.current = to; return; }

    const duration = 800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;

      if (to >= 1e9) setDisplay(`$${(current / 1e9).toFixed(2)}B`);
      else if (to >= 1e6) setDisplay(`$${(current / 1e6).toFixed(2)}M`);
      else if (to >= 1e3) setDisplay(`$${(current / 1e3).toFixed(2)}T`);
      else setDisplay(current.toFixed(2));

      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    prevRef.current = to;
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  return <>{typeof display === "string" ? display : `${prefix}${display}${suffix}`}</>;
}

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

  const heroRef = useScrollReveal();
  const statsRef = useScrollRevealChildren();
  const topGridRef = useScrollReveal();
  const tableRef = useScrollReveal();
  const paginationRef = useScrollReveal();

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
      const data = await cryptoApi.getCoins({ page, perPage: PER_PAGE, search: debouncedSearch });
      setCoins(data.coins || []);
      saveCoinSnapshots(data.coins || []);
      const triggered = evaluateAlerts(data.coins || []);
      if (triggered.length) setAlertHits((prev) => [...triggered, ...prev].slice(0, 3));
    } catch (error) { console.error("Failed to load coins", error); }
    finally { setIsLoading(false); }
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
    } catch (error) { console.error("Failed to load meta", error); }
    finally { setIsMetaLoading(false); }
  };

  useEffect(() => { loadCoins(); }, [page, debouncedSearch]);
  useEffect(() => { loadMeta(); }, []);
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
      { label: "Crypto Market Cap", value: formatCompactCurrency(global.total_market_cap?.usd), change: `${(global.market_cap_change_percentage_24h_usd || 0) >= 0 ? "+" : ""}${(global.market_cap_change_percentage_24h_usd || 0).toFixed(2)}%` },
      { label: "24h Volume", value: formatCompactCurrency(global.total_volume?.usd) },
      { label: "BTC Dominance", value: `${(global.market_cap_percentage?.btc || 0).toFixed(2)}%` },
    ];
  }, [global]);

  return (
    <>
      {/* Dashboard Top Header */}
      <section className="dashboard-header reveal" ref={heroRef}>
        <div className="header-title-area">
          <div className="header-title-row">
            <h1>Track Crypto Markets</h1>
            <span className="live-badge">
              <span className="live-dot" />
              Live
            </span>
          </div>
          <p>Real-time updates, premium visuals, and an advanced dashboard interface.</p>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </section>

      {/* Alert hits */}
      {!!alertHits.length && (
        <section className="alerts-banner">
          {alertHits.map((hit) => (
            <div key={hit.id}>
              🔔 <strong>{hit.coinName}</strong> is now ${hit.currentPrice.toFixed(2)} ({hit.direction} ${hit.target})
            </div>
          ))}
        </section>
      )}

      {/* Stats — animated numbers: MOVED FULL WIDTH ABOVE DASHBOARD */}
      <section className="stats-grid reveal-stagger" ref={statsRef}>
        {isMetaLoading
          ? [1, 2, 3].map((v) => <CardSkeleton key={v} />)
          : marketStats.map((stat) => (
            <article key={stat.label} className="stat-card reveal">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              {stat.change && (
                <span className={parseFloat(stat.change) >= 0 ? "positive" : "negative"} style={{ fontSize: "0.82rem" }}>
                  {stat.change}
                </span>
              )}
            </article>
          ))}
      </section>

      {/* Dashboard Layout wrapper */}
      <div className="dashboard-layout">

        {/* SIDEBAR: Trending & Movers */}
        <aside className="dashboard-sidebar reveal" ref={topGridRef}>
          {isMetaLoading ? (
            <><CardSkeleton /><CardSkeleton /></>
          ) : (
            <>
              <TrendingSection coins={trending} />
              <MoversSection gainers={gainers} losers={losers} />
            </>
          )}
        </aside>

        {/* MAIN: Stats & Table */}
        <main className="dashboard-main">

          {/* Market Table — scale on view */}
          <div className="reveal-scale" ref={tableRef}>
            <MarketTable coins={coins} isLoading={isLoading} />
          </div>

          {/* Pagination */}
          <section className="pagination reveal" ref={paginationRef}>
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ← Previous
            </button>
            <span>Page {page}</span>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={coins.length < PER_PAGE}>
              Next →
            </button>
          </section>
        </main>
      </div>
    </>
  );
}
