'use client'
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
const Chakra = ({children,}: {children: React.ReactNode}) => {
  return (
   <ChakraProvider>
    {children}
   </ChakraProvider>
  )
}

export default Chakra