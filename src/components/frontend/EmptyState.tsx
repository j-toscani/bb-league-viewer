import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="border border-bb-border bg-bb-panel p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-bb-surface">
          <svg
            className="h-10 w-10 text-bb-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 13.125 10.875h-2.25A3.375 3.375 0 0 0 7.5 14.25v4.5m9-9V3.375c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125V9.75"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-bb-text">Keine Liga vorhanden</h2>
        <p className="mb-8 max-w-md text-bb-text-muted">
          Es wurde noch keine Liga erstellt. Erstelle eine neue Liga im Admin-Panel, um Spieltage
          und Ergebnisse hier anzuzeigen.
        </p>

        <Link
          href="/admin/collections/leagues/create"
          className="inline-flex items-center gap-2 bg-bb-red px-6 py-3 font-semibold text-white transition-colors hover:bg-bb-red-light"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Liga erstellen
        </Link>
      </div>
    </div>
  )
}
