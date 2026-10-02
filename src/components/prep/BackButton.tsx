import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

/**
 * "← पछाडि" button: uses real browser history when available, otherwise
 * falls back to the explicit parent path (deep-linked / refreshed page).
 */
export function BackButton({ parentPath }: { parentPath: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  const noHistory = navigationType === "POP" || location.key === "default";

  return (
    <button
      type="button"
      onClick={() => {
        if (noHistory) {
          navigate(parentPath);
        } else {
          navigate(-1);
        }
      }}
      className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
    >
      ← पछाडि
    </button>
  );
}
