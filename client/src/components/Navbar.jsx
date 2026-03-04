import { Link, NavLink } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import { useScrolledNavbar } from "../hooks/useScrollReveal";

export default function Navbar() {
  const { themeMode, toggleTheme, watchlist } = useAppState();
  const navRef = useScrolledNavbar(30);

  return (
    <header className="navbar" ref={navRef}>
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <span className="brand-dot" />
          ChainMetrics
        </Link>

        <nav className="nav-links">
          <NavLink to="/dashboard" end>Market</NavLink>
          <NavLink to="/watchlist">
            Watchlist{watchlist.length > 0 && ` (${watchlist.length})`}
          </NavLink>
        </nav>

        <button type="button" onClick={toggleTheme} className="theme-toggle">
          {themeMode === "light" ? "☾ Dark Mode" : "✦ Light Mode"}
        </button>
      </div>
    </header>
  );
}
