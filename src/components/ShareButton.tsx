import { useState } from 'react'

type ShareStatus = 'idle' | 'copied' | 'failed'

export default function ShareButton() {
  const [status, setStatus] = useState<ShareStatus>('idle')

  async function handleShare() {
    setStatus('idle')
    const shareData = {
      title: 'Daily Habit & Todo Tracker',
      text: 'Track your habits and todos with this daily tracker.',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="share-control">
      <button className="secondary-button share-button" type="button" onClick={handleShare} aria-label="Share this app">
        Share
      </button>
      {status !== 'idle' && (
        <span className={status === 'failed' ? 'share-feedback share-error' : 'share-feedback'} role="status" aria-live="polite">
          {status === 'copied' ? 'Link copied!' : 'Could not share or copy the link.'}
        </span>
      )}
    </div>
  )
}
