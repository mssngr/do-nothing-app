import React from 'react'
import { Router, RouteComponentProps, Redirect, Link } from '@reach/router'
import { UserContext } from 'components/Providers/User'
import Auth from 'components/Auth'
import HomeScreen from 'screens/home'
import SignupScreen from 'screens/signup'
import ActivationScreen from 'screens/activation'
import ActivationTokenScreen from 'screens/activation/token'
import LoginScreen from 'screens/login'
import LogoutScreen from 'screens/logout'
import ResetScreen from 'screens/reset'
import ResetTokenScreen from 'screens/reset/token'
import NotFoundScreen from 'screens/404'

export default function Screens() {
  return (
    <Router>
      <Auth path="/">
        <LandingScreen path="/" />
        <HomeScreen path="/home" />
        <SignupScreen path="/signup" />
        <ActivationScreen path="/activation/" />
        <ActivationTokenScreen path="/activation/:activationToken" />
        <LoginScreen path="/login" />
        <LogoutScreen path="/logout" />
        <ResetScreen path="/reset" />
        <ResetTokenScreen path="/reset/:resetToken" />
        <NotFoundScreen default />
      </Auth>
    </Router>
  )
}

function LandingScreen(props: RouteComponentProps) {
  const [user] = React.useContext(UserContext)

  if (user.isAuthenticated) {
    return <Redirect to="/home" noThrow />
  }

  return (
    <div>
      <h1>This is the landing page.</h1>
      <Link to="/login">Login</Link>
      <br />
      <Link to="/signup">Sign Up</Link>
    </div>
  )
}
