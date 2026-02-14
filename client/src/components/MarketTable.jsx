import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import { formatCompactCurrency, formatCurrency, formatPercent } from "../utils/formatters";
import Sparkline from "./Sparkline";
import { TableSkeleton } from "./LoadingSkeleton";

export default function MarketTable({ coins, isLoading }) {
  const navigate = useNavigate();
  const { watchlist, toggleWatchlist } = useAppState();

  return (
    <section className="panel">
      <h2 className="panel-title">Market Overview</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Coin</th>
              <th>Price</th>
              <th>24h</th>
              <th>Market Cap</th>
              <th>Volume</th>
              <th>7D</th>
              <th>Watch</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={10} />
            ) : (
              coins.map((coin) => {
                const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
                const isSaved = watchlist.includes(coin.id);

                return (
                  <tr key={coin.id} onClick={() => navigate(`/coin/${coin.id}`)} className="clickable-row">
                    <td>{coin.market_cap_rank || "-"}</td>
                    <td>
                      <div className="coin-cell">
                        <img src={coin.image} alt={`${coin.name} logo`} loading="lazy" />
                        <div>
                          <strong>{coin.name}</strong>
                          <span>{coin.symbol.toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(coin.current_price)}</td>
                    <td className={isPositive ? "positive" : "negative"}>
                      {formatPercent(coin.price_change_percentage_24h || 0)}
                    </td>
                    <td>{formatCompactCurrency(coin.market_cap)}</td>
                    <td>{formatCompactCurrency(coin.total_volume)}</td>
                    <td>
                      <Sparkline data={coin.sparkline_in_7d?.price || []} positive={isPositive} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`watch-btn ${isSaved ? "active" : ""}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleWatchlist(coin.id);
                        }}
                      >
                        {isSaved ? "Saved" : "Add"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
