'use client'

type ResultPopupProps = {
  imageUrl: string
  onClose: () => void
  /** True per utenti free: l'immagine ha già watermark dal backend; mostriamo un'etichetta opzionale */
  isFree?: boolean
}

export function ResultPopup({ imageUrl, onClose, isFree }: ResultPopupProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow transition hover:bg-white hover:text-primary"
          aria-label="Chiudi"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-14">
          <h2 id="result-title" className="mb-4 text-center text-lg font-semibold text-primary">
            Immagine generata
          </h2>
          {isFree && (
            <p className="mb-3 text-center text-[13px] text-secondary">
              Versione sample con watermark. Registrati per immagini senza watermark.
            </p>
          )}
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Immagine generata"
              className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain"
            />
          </div>
          <div className="mt-6 flex justify-center">
            <a
              href={imageUrl}
              download
              className="inline-flex items-center gap-2 rounded-full border-2 border-anthracite bg-anthracite px-6 py-2.5 text-[14px] font-semibold text-white transition-smooth hover:bg-anthracite/90 hover:shadow-soft-hover"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Scarica immagine
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
