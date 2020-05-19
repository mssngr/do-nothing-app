import React from 'react'
import Apollo from './Apollo'
import User from './User'

const Providers: React.FC = ({ children }) => (
  <User>
    <Apollo>{children}</Apollo>
  </User>
)

export default Providers
