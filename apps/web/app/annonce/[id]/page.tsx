'use client'

import React from 'react'
import type { ReportForm } from '../../annonce/types'
import { AnnonceDetailView, AnnonceErrorView, AnnonceLoadingView, AnnonceNotFoundView } from './components'
import { useAnnonce } from './hooks'
import { sendAnnonceReport, sendSellerMessage } from './services'
import type { AnnoncePageProps } from './types'

export default function Page({ params }: Readonly<AnnoncePageProps>) {
  const id = params.id
  const { annonce, similar, loading, error } = useAnnonce(id)
  const [viewportWidth, setViewportWidth] = React.useState(1200)
  const isMobile = viewportWidth < 768

  React.useEffect(() => {
    if (globalThis.window === undefined) return
    const syncViewport = () => setViewportWidth(globalThis.window.innerWidth)
    syncViewport()
    globalThis.window.addEventListener('resize', syncViewport)
    return () => globalThis.window.removeEventListener('resize', syncViewport)
  }, [])

  const [messageSending, setMessageSending] = React.useState(false)
  const [messageSent, setMessageSent] = React.useState(false)
  const [reportOpen, setReportOpen] = React.useState(false)
  const [reportSent, setReportSent] = React.useState(false)
  const [reportLoading, setReportLoading] = React.useState(false)

  const handleMessage = async (content: string) => {
    if (!annonce) return
    setMessageSending(true)
    try {
      await sendSellerMessage(annonce.id, content)
      setMessageSent(true)
    } catch (e) {
      console.error(e)
    } finally {
      setMessageSending(false)
    }
  }

  const handleReport = async (form: ReportForm) => {
    if (!annonce) return
    setReportLoading(true)
    try {
      await sendAnnonceReport(annonce.id, form)
      setReportSent(true)
    } catch (e) {
      console.error(e)
    } finally {
      setReportLoading(false)
    }
  }

  if (loading) return <AnnonceLoadingView />
  if (error) return <AnnonceErrorView error={error} />
  if (!annonce) return <AnnonceNotFoundView />

  return (
    <AnnonceDetailView
      annonce={annonce}
      similar={similar}
      isMobile={isMobile}
      messageSent={messageSent}
      messageSending={messageSending}
      reportOpen={reportOpen}
      reportSent={reportSent}
      reportLoading={reportLoading}
      onMessage={handleMessage}
      onOpenReport={() => setReportOpen(true)}
      onCloseReport={() => setReportOpen(false)}
      onSubmitReport={handleReport}
    />
  )
}
