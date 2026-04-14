import { useState, useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function ShareLinkCopier({ shareCode }) {
  const [copied, setCopied] = useState(false)
  const [qrCopied, setQrCopied] = useState(false)
  const qrRef = useRef(null)

  const url = `${window.location.origin}/publiek/ranking-the-values/${shareCode}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyQr = useCallback(async () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setQrCopied(true)
      setTimeout(() => setQrCopied(false), 2000)
    } catch {
      // Fallback: download als bestand
      const link = document.createElement('a')
      link.download = `qr-${shareCode}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }, [shareCode])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors whitespace-nowrap"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Gekopieerd!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
            </svg>
            Kopieer link
          </>
        )}
      </button>
      <button
        onClick={handleCopyQr}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors whitespace-nowrap"
      >
        {qrCopied ? (
          <>
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Gekopieerd!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h4.5v4.5h-4.5zm0 10.5h4.5v4.5h-4.5zm10.5-10.5h4.5v4.5h-4.5zM14.25 15h1.5v1.5h-1.5zm3 0h1.5v1.5h-1.5zm-3 3h1.5v1.5h-1.5zm3 3h1.5v1.5h-1.5zm0-3h1.5v1.5h-1.5z" />
            </svg>
            Kopieer QR
          </>
        )}
      </button>
      {/* Hidden QR canvas for copy */}
      <div ref={qrRef} className="hidden">
        <QRCodeCanvas value={url} size={400} level="M" marginSize={2} />
      </div>
    </div>
  )
}
