import React from 'react'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  }),
})

export default function Providers({ children }: { children: any }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
