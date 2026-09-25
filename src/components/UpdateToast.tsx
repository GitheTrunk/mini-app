import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) {
    return null
  }

  return (
    <aside className="update-toast" role="status" aria-live="polite" aria-label="Application update">
      <span>New version available</span>
      <div className="toast-actions">
        <button type="button" onClick={() => void updateServiceWorker(true)}>Refresh</button>
        <button type="button" className="toast-dismiss" onClick={() => setNeedRefresh(false)} aria-label="Dismiss update notification">
          Not now
        </button>
      </div>
    </aside>
  )
}
