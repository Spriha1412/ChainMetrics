import { useState } from "react";
import { useAppState } from "../context/AppStateContext";

export default function PriceAlerts({ coin }) {
  const { alerts, addAlert, deleteAlert } = useAppState();
  const [direction, setDirection] = useState("above");
  const [target, setTarget] = useState(coin?.market_data?.current_price?.usd || "");

  const coinAlerts = alerts.filter((alert) => alert.coinId === coin.id);

  return (
    <section className="panel">
      <h2 className="panel-title">Price Alerts</h2>
      <form
        className="alert-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!target || Number(target) <= 0) return;

          addAlert({
            id: `${coin.id}-${Date.now()}`,
            coinId: coin.id,
            coinName: coin.name,
            direction,
            target: Number(target),
          });
          setTarget(coin?.market_data?.current_price?.usd || "");
        }}
      >
        <select value={direction} onChange={(event) => setDirection(event.target.value)}>
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          type="number"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          min="0"
          step="0.01"
          placeholder="Target price"
        />
        <button type="submit">Create</button>
      </form>

      <ul className="alerts-list">
        {coinAlerts.map((alert) => (
          <li key={alert.id}>
            <span>
              {alert.direction} ${alert.target}
            </span>
            <button type="button" onClick={() => deleteAlert(alert.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
