import React from 'react'
import { Router, RouteComponentProps, Redirect, Link } from '@reach/router'
import { UserContext } from 'components/Providers/User'
import Auth from 'components/Auth'
import HomeScreen from 'screens/home'
import LoginScreen from 'screens/login'
import LogoutScreen from 'screens/logout'
import SignupScreen from 'screens/signup'
import ResetScreen from 'screens/reset'
import ResetTokenScreen from 'screens/reset/token'
import NotFoundScreen from 'screens/404'

export default function Screens() {
  return (
    <Router>
      <Auth path="/">
        <LandingScreen path="/" />
        <HomeScreen path="/home" />
        <LoginScreen path="/login" />
        <LogoutScreen path="/logout" />
        <SignupScreen path="/signup" />
        <ResetScreen path="/reset" />
        <ResetTokenScreen path="/reset/:activationToken" />
      </Auth>
      <NotFoundScreen default />
    </Router>
  )
}

function LandingScreen(props: RouteComponentProps) {
  const [user] = React.useContext(UserContext)

  if (user.isActive) {
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
