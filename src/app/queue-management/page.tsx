'use client'

import dynamic from 'next/dynamic'

const QueueManagement = dynamic(() => import('@/pages/QueueManagement'), {
  ssr: false,
})

export default function QueueManagementPage() {
  return <QueueManagement />
} 