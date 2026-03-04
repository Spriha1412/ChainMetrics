import { useNavigate } from "react-router-dom";
import { formatPercent } from "../utils/formatters";

function MoversList({ title, coins, isPositive }) {
  const navigate = useNavigate();

  return (
    <div className="movers-card">
      <h3>{title}</h3>
      <ul>
        {coins.map((coin) => (
          <li key={coin.id}>
            <button type="button" onClick={() => navigate(`/coin/${coin.id}`)}>
              <span style={{ fontWeight: 600 }}>{coin.symbol.toUpperCase()}</span>
              <span className={`pct-badge ${isPositive ? "positive" : "negative"}`}>
                {formatPercent(coin.price_change_percentage_24h || 0)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MoversSection({ gainers = [], losers = [] }) {
  return (
    <section className="movers-wrap">
      <MoversList title="Top Gainers" coins={gainers} isPositive={true} />
      <MoversList title="Top Losers" coins={losers} isPositive={false} />
    </section>
  );
}
