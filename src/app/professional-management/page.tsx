'use client'

import dynamic from 'next/dynamic'

const ProfessionalManagement = dynamic(() => import('@/pages/ProfessionalManagement'), {
  ssr: false,
})

export default function ProfessionalManagementPage() {
  return <ProfessionalManagement />
} 