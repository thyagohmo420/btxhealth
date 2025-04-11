'use client'

import dynamic from 'next/dynamic'

const MedicalOffice = dynamic(() => import('@/pages/MedicalOffice'), {
  ssr: false,
})

export default function MedicalOfficePage() {
  return <MedicalOffice />
} 