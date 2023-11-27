'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'
import { FaLinkedin, FaGoogle, FaFacebook, FaMicrosoft } from 'react-icons/fa';
import {
    Button,
    VStack,
    HStack,
    Input,
    Heading,
    FormControl,
    FormLabel,
    Box
} from '@chakra-ui/react';



const SigninButton = () => {
    const { data: session } = useSession()


    function handleGoogleSignIn() {
        signIn('google', { redirect: true, callbackUrl: "http://localhost:3000/dashboard", prompt: 'consent' })
    }
    function handleFacebookSignIn() {
        signIn('facebook', { redirect: true, callbackUrl: "http://localhost:3000/dashboard", prompt: 'consent' })
    }
    function handleLinkedinSignIn() {
        signIn('linkedin', { redirect: true, callbackUrl: "http://localhost:3000/dashboard", prompt: 'consent' })
    }
    function handleMicrosoftSignIn() {
        signIn('azure-ad', { redirect: true, callbackUrl: "http://localhost:3000/dashboard", prompt: 'login' })
    }


    // if (session && session.user) {
    //     console.log(session.user)
    //     return (
    //         <>
    //             <p>Name:{session.user.name}</p>
    //             <p>Email:{session.user.email}</p>
    //             {session.user.image && typeof session.user.image === 'string' && (
    //                 <Image src={session.user.image} width={100} height={100} alt='user image' />
    //             )}
    //             <button onClick={handleSignOut} style={{ backgroundColor: 'crimson', color: 'white' }}>sign out</button>
    //         </>
    //     )
    // }
    return (
        <VStack spacing={8} align="center" my='10'>
            <Heading as="h2" size="xl">
                Sign In
            </Heading>
            <VStack spacing={4}>
                <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input type="text" placeholder="Enter username" />
                </FormControl>
                <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" placeholder="Enter password" />
                </FormControl>
                <Box width="100%">
                    <Button
                        colorScheme="blue"
                        variant="solid"
                        width="100%"
                    >
                    Sign In
                    </Button>
                </Box>
            </VStack>
            <HStack spacing={4}>
                <Button
                    onClick={handleGoogleSignIn}
                    colorScheme="red"
                    variant="solid"
                    justifyContent="center"
                ><FaGoogle /></Button>
                <Button
                    onClick={handleFacebookSignIn}
                    colorScheme="blue"
                    variant="solid"
                    justifyContent="center"
                ><FaFacebook /></Button>
                <Button
                    onClick={handleLinkedinSignIn}
                    colorScheme="green"
                    variant="solid"
                    justifyContent="center"
                ><FaLinkedin /></Button>
                <Button
                    onClick={handleMicrosoftSignIn}
                    colorScheme="orange"
                    variant="solid"
                    justifyContent="center"
                ><FaMicrosoft /></Button>
            </HStack>
        </VStack>
    )
}

export default SigninButton