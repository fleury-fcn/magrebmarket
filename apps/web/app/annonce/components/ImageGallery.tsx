import React from 'react'
import Image from 'next/image'
import { LBC } from '../../search/data'

type AnnonceImage = {
  id: string | number
  url: string
  alt?: string
}

interface ImageGalleryProps {
  images: AnnonceImage[]
  title: string
  isUrgent?: boolean
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, isUrgent }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)

  const openLightbox = React.useCallback((index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }, [])
  const closeLightbox = React.useCallback(() => setLightboxOpen(false), [])
  const next = React.useCallback(() => setCurrentIndex(i => (i + 1) % images.length), [images.length])
  const prev = React.useCallback(() => setCurrentIndex(i => (i - 1 + images.length) % images.length), [images.length])

  React.useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [lightboxOpen, next, prev, closeLightbox])

  if (!images || images.length === 0) {
    return (
      <div style={{ background: LBC.gray50, borderRadius: 12, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 56 }}>📷</span>
      </div>
    )
  }

  return (
    <div>
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderRadius: 12, background: LBC.gray100 }}>
        <button aria-label="Voir l'image" onClick={() => openLightbox(currentIndex)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
          <Image src={images[currentIndex].url} alt={images[currentIndex].alt || title} fill sizes="(max-width:768px) 100vw, 800px" style={{ objectFit: 'cover' }} />
        </button>
        {isUrgent && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: LBC.urgent, color: LBC.white, padding: '4px 10px', borderRadius: 6, fontWeight: 800 }}>Urgent</span>
        )}
        {images.length > 1 && (
          <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: LBC.white, padding: '4px 8px', borderRadius: 20 }}>{currentIndex + 1}/{images.length}</span>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto' }}>
          {images.map((img, idx) => (
            <button key={img.id} onClick={() => setCurrentIndex(idx)} style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}>
              <div style={{ width: 96, height: 72, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0' }}>
                <Image src={img.url} alt={img.alt || title} width={160} height={120} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <dialog open aria-modal="true" aria-label="Visualiseur d'images" style={{ padding: 0, border: 'none', background: 'transparent' }}>
          <div style={{ maxWidth: '90vw', maxHeight: '80vh', position: 'relative', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <button onClick={closeLightbox} aria-label="Fermer" style={{ position: 'absolute', right: -8, top: -8, background: LBC.white, borderRadius: '50%', width: 36, height: 36, border: 'none', cursor: 'pointer' }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={prev} aria-label="Précédent" style={{ background: 'transparent', border: 'none', color: LBC.white, cursor: 'pointer' }}>◀</button>
              <Image src={images[currentIndex].url} alt={images[currentIndex].alt || title} width={1200} height={900} style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain' }} />
              <button onClick={next} aria-label="Suivant" style={{ background: 'transparent', border: 'none', color: LBC.white, cursor: 'pointer' }}>▶</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
