import React from 'react'

const LoadingOrError: React.FC<{
  loading?: boolean
  error?: string | object
}> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    console.error(error)
    return (
      <div>
        <p>Error...</p>
      </div>
    )
  }

  return <>{children}</>
}

export default LoadingOrError
