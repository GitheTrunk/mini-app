import { useEffect, useState } from 'react'

interface FetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export default function useFetch<T>(url: string): FetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Request failed (HTTP ${response.status})`)
        const result = (await response.json()) as T

        if (!cancelled) setData(result)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}
