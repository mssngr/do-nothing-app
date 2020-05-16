import React from 'react'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
  ServerError,
  ServerParseError,
} from '@apollo/client'
import { onError } from '@apollo/link-error'
import { navigate } from '@reach/router'
import { UserContext } from './User'

const graphQLEndpoint =
  process.env.REACT_APP_API_URL || 'http://localhost:4000/graphql'

export default function Apollo({ children }: { children: any }) {
  const [user, setUser] = React.useContext(UserContext)
  const httpLink = new HttpLink({
    uri: graphQLEndpoint,
  })
  const reAuthLink = onError(({ networkError }) => {
    if ((networkError as ServerError | ServerParseError)?.statusCode === 401) {
      reAuth(user, setUser)
    }
  })
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink.concat(reAuthLink),
    headers: { Authorization: user.accessToken },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

async function reAuth(
  { id }: { id: number | null },
  setUser: React.Dispatch<
    React.SetStateAction<{
      id: number | null
      accessToken: string
    }>
  >
) {
  const refreshToken = localStorage.getItem('refreshToken')
  try {
    const response = await fetch(graphQLEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        query: `mutation { refresh(token: "${refreshToken}") }`,
      }),
    })
    if (response.status === 401) {
      localStorage.removeItem('refreshToken')
      setUser({ id: null, accessToken: '' })
      navigate('/login')
    }
    const data = await response.json()
    setUser({ id, accessToken: data?.refresh })
  } catch (error) {
    console.error(error)
    localStorage.removeItem('refreshToken')
    setUser({ id: null, accessToken: '' })
    navigate('/login')
  }
}
