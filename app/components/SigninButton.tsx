'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'
import Image from 'next/image'
import Cookies from 'js-cookie';

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
        signIn('azure-ad', { redirect: true, callbackUrl: "http://localhost:3000/dashboard", prompt: 'consent' })
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
        <>
            <button onClick={handleGoogleSignIn} style={{ backgroundColor: 'orangered', color: 'white' }}>Sign In With Google</button>
            <br />
            <br />
            <button onClick={handleFacebookSignIn} style={{ backgroundColor: 'blue', color: 'white' }}>Sign In With Facebook</button>
            <br />
            <br />
            <button onClick={handleLinkedinSignIn} style={{ backgroundColor: 'yellowgreen', color: 'white' }}>Sign In With Linkedin</button>
            <br />
            <br />
            <button onClick={handleMicrosoftSignIn} style={{ backgroundColor: 'orange', color: 'white' }}>Sign In With Microsoft</button>
        </>
    )
}

export default SigninButton