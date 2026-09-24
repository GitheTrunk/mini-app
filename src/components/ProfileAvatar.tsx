import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const MAX_FILE_SIZE = 1024 * 1024
const PUBLIC_AVATAR_PATH_MARKER = '/storage/v1/object/public/avatars/'

function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Choose an image file.'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Choose an image smaller than 1 MB.'
  }

  return null
}

function getFileExtension(file: File) {
  const nameExtension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  const mimeExtension = file.type.split('/')[1]?.split('+')[0].toLowerCase().replace(/[^a-z0-9]/g, '')

  return nameExtension || mimeExtension || 'image'
}

function getStoredAvatarPath(publicUrl: string) {
  const markerIndex = publicUrl.indexOf(PUBLIC_AVATAR_PATH_MARKER)

  if (markerIndex === -1) {
    return null
  }

  const encodedPath = publicUrl.slice(markerIndex + PUBLIC_AVATAR_PATH_MARKER.length).split('?')[0]

  try {
    return decodeURIComponent(encodedPath)
  } catch {
    return null
  }
}

export default function ProfileAvatar() {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadAvatar() {
      if (!user) {
        setAvatarUrl(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (ignore) {
        return
      }

      if (error) {
        setErrorMessage(`Unable to load avatar: ${error.message}`)
        setAvatarUrl(null)
      } else {
        setAvatarUrl(typeof data?.avatar_url === 'string' ? data.avatar_url : null)
      }

      setLoading(false)
    }

    void loadAvatar()

    return () => {
      ignore = true
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    const validationError = validateAvatarFile(file)

    if (validationError) {
      setErrorMessage(validationError)
      event.currentTarget.value = ''
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUpload() {
    if (!user || !selectedFile) {
      return
    }

    setUploading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const extension = getFileExtension(selectedFile)
    const path = `${user.id}/avatar.${extension}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, selectedFile, {
          cacheControl: '0',
          contentType: selectedFile.type,
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const publicUrl = publicUrlData.publicUrl
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            avatar_url: publicUrl,
          },
          {
            onConflict: 'id',
          },
        )

      if (profileError) {
        throw profileError
      }

      const previousPath = avatarUrl ? getStoredAvatarPath(avatarUrl) : null

      if (previousPath && previousPath !== path && previousPath.startsWith(`${user.id}/avatar.`)) {
        const { error: cleanupError } = await supabase.storage
          .from('avatars')
          .remove([previousPath])

        if (cleanupError) {
          console.error('Unable to remove the previous avatar:', cleanupError.message)
        }
      }

      setAvatarUrl(publicUrl)
      setAvatarVersion(Date.now())
      setSelectedFile(null)
      setPreviewUrl(null)
      setSuccessMessage('Avatar updated.')

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to upload avatar. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const persistedAvatarSrc = avatarUrl
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${avatarVersion}`
    : null
  const displayedAvatarSrc = previewUrl ?? persistedAvatarSrc

  if (!user) {
    return null
  }

  return (
    <section className="profile-avatar" aria-labelledby="avatar-heading">
      <div className="avatar-image" aria-busy={loading}>
        {displayedAvatarSrc ? (
          <img src={displayedAvatarSrc} alt="Your profile avatar" />
        ) : (
          <span aria-label="No avatar uploaded">{user.email?.charAt(0).toUpperCase() || '?'}</span>
        )}
      </div>

      <div className="avatar-controls">
        <span id="avatar-heading" className="sr-only">Profile avatar</span>
        <label className="avatar-file-label" htmlFor="avatar-file">Choose avatar</label>
        <input
          ref={inputRef}
          id="avatar-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading || uploading}
        />
        {selectedFile && (
          <button className="secondary-button avatar-upload-button" type="button" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        )}
      </div>

      {errorMessage && <p className="avatar-message field-error" role="alert">{errorMessage}</p>}
      {successMessage && <p className="avatar-message avatar-success" role="status">{successMessage}</p>}
    </section>
  )
}
