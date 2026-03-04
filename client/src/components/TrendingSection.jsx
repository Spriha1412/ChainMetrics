import { useNavigate } from "react-router-dom";

export default function TrendingSection({ coins = [] }) {
  const navigate = useNavigate();

  return (
    <section className="panel">
      <h2 className="panel-title">Trending Coins</h2>
      <div className="trending-grid">
        {coins.slice(0, 6).map((coin) => (
          <button
            key={coin.id}
            type="button"
            className="trending-card"
            onClick={() => navigate(`/coin/${coin.id}`)}
          >
            <img src={coin.small} alt={coin.name} loading="lazy" />
            <div>
              <strong>{coin.name}</strong>
              <span>{coin.symbol}</span>
            </div>
            <span className="rank-pill">#{coin.market_cap_rank || "—"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
