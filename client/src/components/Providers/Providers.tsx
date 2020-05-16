import React from 'react'
import Apollo from './Apollo'
import User from './User'

export default function Providers({ children }: { children: any }) {
  return (
    <User>
      <Apollo>{children}</Apollo>
    </User>
  )
}
