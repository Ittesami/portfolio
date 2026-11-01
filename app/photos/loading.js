// Shown instantly while the photography page loads.
export default function Loading() {
  return (
    <div className="wrap page-loading" role="status" aria-label="Loading photos">
      <span className="spinner big-spinner" />
    </div>
  );
}
