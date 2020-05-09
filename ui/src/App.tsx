import React from 'react'
import { useMutation, gql } from '@apollo/client'

const SIGN_IN = gql`
  SignIn($email: String!, $password: String!) {
    user(email: $email)
  }
`

const CREATE_USER = gql`
  mutation CreateUser() {
    createOneUser
  }
`

export default function App() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = (e.target as any).children[0].value
    const password = (e.target as any).children[1].value
    console.log({ email, password })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="email" type="email" />
        <input placeholder="password" type="password" />
        <button type="submit">Log In</button>
      </form>
    </div>
  )
}
