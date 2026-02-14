import { Link, NavLink } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";

export default function Navbar() {
  const { themeMode, toggleTheme, watchlist } = useAppState();

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <span className="brand-dot" />
          CryptoTracker
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Market
          </NavLink>
          <NavLink to="/watchlist">Watchlist ({watchlist.length})</NavLink>
        </nav>

        <button type="button" onClick={toggleTheme} className="theme-toggle">
          {themeMode === "light" ? "Dark Beige" : "Light Beige"}
        </button>
      </div>
    </header>
  );
}
