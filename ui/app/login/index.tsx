import { Button, Text, TextInput, View } from 'react-native'

export default function Login() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Login below.</Text>
      <TextInput placeholder="Email" />
      <TextInput placeholder="Password" />
      <Button title="Login" />
    </View>
  )
}
