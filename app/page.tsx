import SigninButton from './components/SigninButton'
import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'

export default function Home({ Component, pageProps }: AppProps) {
  return (
    <div>
      <SigninButton/>
    </div>
  )
}
