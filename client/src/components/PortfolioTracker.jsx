import { useMemo, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { formatCurrency } from "../utils/formatters";

export default function PortfolioTracker({ coins = [] }) {
  const { portfolio, addPortfolioItem, removePortfolioItem } = useAppState();
  const [coinId, setCoinId] = useState(coins[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  const coinMap = useMemo(() => new Map(coins.map((coin) => [coin.id, coin])), [coins]);

  const totalValue = portfolio.reduce((sum, entry) => {
    const livePrice = coinMap.get(entry.id)?.current_price || 0;
    return sum + livePrice * Number(entry.amount);
  }, 0);

  return (
    <section className="panel">
      <h2 className="panel-title">Portfolio Tracker</h2>

      <form
        className="portfolio-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!coinId || Number(amount) <= 0 || Number(avgPrice) <= 0) return;

          addPortfolioItem({ id: coinId, amount: Number(amount), avgPrice: Number(avgPrice) });
          setAmount("");
          setAvgPrice("");
        }}
      >
        <select value={coinId} onChange={(event) => setCoinId(event.target.value)}>
          <option value="">Select coin</option>
          {coins.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
          type="number"
          min="0"
          step="0.0001"
        />
        <input
          value={avgPrice}
          onChange={(event) => setAvgPrice(event.target.value)}
          placeholder="Avg buy price"
          type="number"
          min="0"
          step="0.01"
        />
        <button type="submit">Add</button>
      </form>

      <p className="portfolio-total">Current Value: {formatCurrency(totalValue)}</p>

      <ul className="portfolio-list">
        {portfolio.map((entry) => {
          const coin = coinMap.get(entry.id);
          if (!coin) return null;

          const currentValue = coin.current_price * Number(entry.amount);
          const invested = Number(entry.avgPrice) * Number(entry.amount);
          const pnl = ((currentValue - invested) / invested) * 100;

          return (
            <li key={entry.id}>
              <div>
                <strong>{coin.name}</strong>
                <span>
                  {entry.amount} @ {formatCurrency(entry.avgPrice)}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(currentValue)}</strong>
                <span className={pnl >= 0 ? "positive" : "negative"}>{pnl.toFixed(2)}%</span>
              </div>
              <button type="button" onClick={() => removePortfolioItem(entry.id)}>
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
