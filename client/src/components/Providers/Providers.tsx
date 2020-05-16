import React from 'react'
import Apollo from './Apollo'
import User from './User'
import Auth from './Auth'

export default function Providers({ children }: { children: any }) {
  return (
    <User>
      <Apollo>
        <Auth>{children}</Auth>
      </Apollo>
    </User>
  )
}
