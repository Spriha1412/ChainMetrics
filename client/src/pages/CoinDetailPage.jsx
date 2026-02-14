import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cryptoApi } from "../api/cryptoApi";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "../utils/formatters";
import { useAppState } from "../context/AppStateContext";
import PriceAlerts from "../components/PriceAlerts";

const ranges = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
];

const stripHtml = (text) => (text ? text.replace(/<[^>]*>/g, "") : "No description available.");

export default function CoinDetailPage() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [chartPoints, setChartPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  const { watchlist, toggleWatchlist, saveCoinSnapshots } = useAppState();

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
          (chartResponse.chart?.prices || []).map(([time, price]) => ({
            time,
            price,
          }))
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
    return <section className="panel">Loading coin details...</section>;
  }

  const isInWatchlist = watchlist.includes(coin.id);

  return (
    <>
      <section className="panel coin-header">
        <div className="coin-title-wrap">
          <img src={coin.image?.large || coin.image?.small} alt={coin.name} />
          <div>
            <h1>{coin.name}</h1>
            <p>{coin.symbol?.toUpperCase()}</p>
          </div>
        </div>
        <div className="coin-price-wrap">
          <strong>{formatCurrency(coin.market_data?.current_price?.usd)}</strong>
          <span
            className={
              (coin.market_data?.price_change_percentage_24h || 0) >= 0 ? "positive" : "negative"
            }
          >
            {formatPercent(coin.market_data?.price_change_percentage_24h || 0)}
          </span>
          <button
            type="button"
            className={`watch-btn ${isInWatchlist ? "active" : ""}`}
            onClick={() => toggleWatchlist(coin.id)}
          >
            {isInWatchlist ? "Saved" : "Add to Watchlist"}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="range-switcher">
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

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 92, 70, 0.2)" />
              <XAxis
                dataKey="time"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: range === 1 ? "numeric" : undefined,
                  })
                }
              />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line type="monotone" dataKey="price" stroke="#7d4f35" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="stats-grid details-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <PriceAlerts coin={coin} />

      <section className="panel">
        <h2 className="panel-title">About {coin.name}</h2>
        <p className="description-text">{stripHtml(coin.description?.en).slice(0, 900)}</p>
      </section>
    </>
  );
}
