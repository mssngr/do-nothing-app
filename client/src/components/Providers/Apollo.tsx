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
  const [user, updateUser] = React.useContext(UserContext)
  const httpLink = new HttpLink({
    uri: graphQLEndpoint,
    headers: user.accessToken && {
      Authorization: `Bearer ${user.accessToken}`,
    },
  })
  const reAuthLink = onError(({ networkError }) => {
    if ((networkError as ServerError | ServerParseError)?.statusCode === 401) {
      reAuth(user, updateUser)
    }
  })
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: reAuthLink.concat(httpLink),
    defaultOptions: {
      query: { errorPolicy: 'all' },
      watchQuery: { errorPolicy: 'all' },
      mutate: { errorPolicy: 'all' },
    },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

async function reAuth(
  { refreshToken }: { refreshToken: string },
  updateUser: (updates: {
    id?: string
    accessToken?: string
    refreshToken?: string
    isAuthenticated?: boolean
  }) => void
) {
  try {
    const response = await fetch(graphQLEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        query: `mutation { refresh(refreshToken: "${refreshToken}") }`,
      }),
    })
    const data = await response.json()
    const accessToken = data?.refresh
    if (response.status !== 401 && accessToken) {
      updateUser({ accessToken })
    } else {
      throw new Error('User not successfuly re-verified')
    }
  } catch (error) {
    console.error(error)
    navigate('/logout')
  }
}
