export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-wrap" htmlFor="coin-search">
      <span className="search-icon">⌕</span>
      <input
        id="coin-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by coin name or symbol"
      />
    </label>
  );
}
