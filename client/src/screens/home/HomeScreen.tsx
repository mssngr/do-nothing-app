import React from 'react'
import { RouteComponentProps, Link } from '@reach/router'

export default function HomeScreen(props: RouteComponentProps) {
  return (
    <div>
      <h1>This is the home page.</h1>
      <Link to="/logout">Logout</Link>
    </div>
  )
}
