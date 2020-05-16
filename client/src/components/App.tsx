import React from 'react'
import { Router } from '@reach/router'
import LandingScreen from 'screens/'
import HomeScreen from 'screens/home'
import LoginScreen from 'screens/login'
import SignupScreen from 'screens/signup'

export default function App() {
  return (
    <Router>
      <LandingScreen path="/" />
      <HomeScreen path="/home" />
      <LoginScreen path="/login" />
      <SignupScreen path="/signup" />
    </Router>
  )
}
