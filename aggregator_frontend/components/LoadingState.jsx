export default function LoadingState() {
  return (
    <div className="loading-shell" role="status" aria-live="polite" aria-busy="true" aria-label="Loading customer report">
      <span className="sr-only">Loading customer report...</span>
      <div className="loading-metrics" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton skeleton--metric" key={index} />
        ))}
      </div>
      <div className="skeleton skeleton--table" aria-hidden="true" />
    </div>
  );
}
