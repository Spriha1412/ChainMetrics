export function TableSkeleton({ rows = 10 }) {
  return Array.from({ length: rows }).map((_, idx) => (
    <tr key={idx}>
      <td colSpan={9}>
        <div className="skeleton-row" />
      </td>
    </tr>
  ));
}

export function CardSkeleton() {
  return <div className="skeleton-card" />;
}
