import React from 'react'
import { Router } from '@reach/router'
import LoginScreen from 'screens/login'

export default function App() {
  return (
    <Router>
      <LoginScreen path="/login" />
    </Router>
  )
}
