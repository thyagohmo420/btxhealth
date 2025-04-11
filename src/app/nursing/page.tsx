'use client'

import dynamic from 'next/dynamic'

const Nursing = dynamic(() => import('@/pages/Nursing'), {
  ssr: false,
})

export default function NursingPage() {
  return <Nursing />;
} 