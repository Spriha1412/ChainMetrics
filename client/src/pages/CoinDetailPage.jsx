import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { cryptoApi } from "../api/cryptoApi";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "../utils/formatters";
import { useAppState } from "../context/AppStateContext";
import PriceAlerts from "../components/PriceAlerts";
import { useScrollReveal, useScrollRevealChildren } from "../hooks/useScrollReveal";

const ranges = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
];

const stripHtml = (text) => (text ? text.replace(/<[^>]*>/g, "") : "No description available.");

// Simple SVG area chart — avoids recharts v3 incompatibilities entirely
function PriceChart({ data, range }) {
  if (!data || data.length < 2) {
    return (
      <div style={{
        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--muted)", fontSize: "0.9rem"
      }}>
        No chart data available
      </div>
    );
  }

  const width = 800;
  const height = 320;
  const pad = { top: 20, right: 20, bottom: 50, left: 70 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const prices = data.map((d) => d.price);
  const times = data.map((d) => d.time);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 1;
  const timeRange = times[times.length - 1] - times[0] || 1;

  const toX = (t) => ((t - times[0]) / timeRange) * innerW;
  const toY = (p) => innerH - ((p - minP) / priceRange) * innerH;

  const pathD = data.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${toX(d.time).toFixed(1)} ${toY(d.price).toFixed(1)}`
  ).join(" ");

  const areaD = `${pathD} L ${toX(times[times.length - 1]).toFixed(1)} ${innerH} L 0 ${innerH} Z`;

  const isPositive = prices[prices.length - 1] >= prices[0];
  const lineColor = isPositive ? "#06B6D4" : "#EF4444";
  const areaFill = isPositive ? "url(#areaGrad)" : "url(#areaGradRed)";

  // Y axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({ length: yTicks }, (_, i) => minP + (priceRange / (yTicks - 1)) * i);

  // X axis ticks
  const xTickCount = range === 1 ? 6 : range === 7 ? 7 : 6;
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((data.length - 1) * (i / (xTickCount - 1)))
  );

  const fmtTime = (t) => {
    const d = new Date(t);
    if (range === 1) return d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fmtPrice = (p) => {
    if (p >= 1000) return `$${(p / 1000).toFixed(1)}k`;
    if (p >= 1) return `$${p.toFixed(0)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%" }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="areaGradRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </linearGradient>
        <clipPath id="chartClip">
          <rect x="0" y="0" width={innerW} height={innerH} />
        </clipPath>
      </defs>

      <g transform={`translate(${pad.left}, ${pad.top})`}>
        {/* Grid lines */}
        {yTickVals.map((val) => (
          <line
            key={val}
            x1="0" y1={toY(val).toFixed(1)}
            x2={innerW} y2={toY(val).toFixed(1)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill={areaFill} clipPath="url(#chartClip)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" clipPath="url(#chartClip)" />

        {/* Y axis labels */}
        {yTickVals.map((val) => (
          <text
            key={val}
            x="-8" y={toY(val).toFixed(1)}
            textAnchor="end" dominantBaseline="middle"
            fill="var(--muted)" fontSize="11"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {fmtPrice(val)}
          </text>
        ))}

        {/* X axis labels */}
        {xTickIndices.map((idx) => (
          <text
            key={idx}
            x={toX(data[idx].time).toFixed(1)}
            y={innerH + 20}
            textAnchor="middle"
            fill="var(--muted)" fontSize="11"
          >
            {fmtTime(data[idx].time)}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default function CoinDetailPage() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [chartPoints, setChartPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);
  const [hoveredPrice, setHoveredPrice] = useState(null);

  const { watchlist, toggleWatchlist, saveCoinSnapshots } = useAppState();

  const headerRef = useScrollReveal();
  const chartRef = useScrollReveal();
  const statsRef = useScrollRevealChildren();
  const alertRef = useScrollReveal();
  const descRef = useScrollReveal();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [coinResponse, chartResponse] = await Promise.all([
          cryptoApi.getCoin(id),
          cryptoApi.getCoinChart(id, range),
        ]);
        const fetchedCoin = coinResponse.coin;
        setCoin(fetchedCoin);
        saveCoinSnapshots([
          {
            id: fetchedCoin.id,
            market_cap_rank: fetchedCoin.market_cap_rank,
            image: fetchedCoin.image?.small || fetchedCoin.image?.thumb || fetchedCoin.image?.large,
            name: fetchedCoin.name,
            symbol: fetchedCoin.symbol,
            current_price: fetchedCoin.market_data?.current_price?.usd,
            price_change_percentage_24h: fetchedCoin.market_data?.price_change_percentage_24h,
            market_cap: fetchedCoin.market_data?.market_cap?.usd,
            total_volume: fetchedCoin.market_data?.total_volume?.usd,
            sparkline_in_7d: { price: fetchedCoin.market_data?.sparkline_7d?.price || [] },
          },
        ]);
        setChartPoints(
          (chartResponse.chart?.prices || []).map(([time, price]) => ({ time, price }))
        );
      } catch (error) {
        console.error("Failed to load coin detail", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, range]);

  const stats = useMemo(() => {
    if (!coin?.market_data) return [];
    return [
      { label: "Market Cap", value: formatCompactCurrency(coin.market_data.market_cap?.usd) },
      { label: "24h Volume", value: formatCompactCurrency(coin.market_data.total_volume?.usd) },
      { label: "Circulating Supply", value: formatNumber(coin.market_data.circulating_supply) },
      { label: "Max Supply", value: formatNumber(coin.market_data.max_supply) },
      { label: "24h High", value: formatCurrency(coin.market_data.high_24h?.usd) },
      { label: "24h Low", value: formatCurrency(coin.market_data.low_24h?.usd) },
    ];
  }, [coin]);

  if (loading || !coin) {
    return (
      <section className="panel" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--brand)",
          animation: "spin 0.8s linear infinite", margin: "0 auto 1rem"
        }} />
        Loading…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    );
  }

  const isInWatchlist = watchlist.includes(coin.id);
  const isPositive = (coin.market_data?.price_change_percentage_24h || 0) >= 0;

  return (
    <>
      {/* Coin header */}
      <section className="panel coin-header reveal" ref={headerRef}>
        <div className="coin-title-wrap">
          <img src={coin.image?.large || coin.image?.small} alt={coin.name} />
          <div>
            <h1>{coin.name}</h1>
            <p>{coin.symbol?.toUpperCase()} · Rank #{coin.market_cap_rank}</p>
          </div>
        </div>
        <div className="coin-price-wrap">
          <strong>{formatCurrency(coin.market_data?.current_price?.usd)}</strong>
          <span className={`pct-badge ${isPositive ? "positive" : "negative"}`}>
            {formatPercent(coin.market_data?.price_change_percentage_24h || 0)}
          </span>
          <button
            type="button"
            className={`watch-btn ${isInWatchlist ? "active" : ""}`}
            onClick={() => toggleWatchlist(coin.id)}
          >
            {isInWatchlist ? "✦ Saved" : "Add to Watchlist"}
          </button>
        </div>
      </section>

      {/* Chart */}
      <section className="panel reveal-scale" ref={chartRef}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="panel-title" style={{ margin: 0 }}>Price Chart</h2>
          <div className="range-switcher" style={{ margin: 0 }}>
            {ranges.map((item) => (
              <button
                type="button"
                key={item.value}
                className={range === item.value ? "active" : ""}
                onClick={() => setRange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-wrap">
          <PriceChart data={chartPoints} range={range} />
        </div>
      </section>

      {/* Stats */}
      <section className="stats-grid details-grid reveal-stagger" ref={statsRef}>
        {stats.map((s) => (
          <article key={s.label} className="stat-card reveal">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </article>
        ))}
      </section>

      {/* Price Alerts */}
      <div className="reveal" ref={alertRef}>
        <PriceAlerts coin={coin} />
      </div>

      {/* About */}
      <section className="panel reveal" ref={descRef}>
        <h2 className="panel-title">About {coin.name}</h2>
        <p className="description-text">{stripHtml(coin.description?.en).slice(0, 900)}</p>
      </section>
    </>
  );
}
