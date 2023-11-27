"use client"
import React from 'react'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react';


const Dashboard = () => {
    const { data: session } = useSession()

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: 'http://localhost:3000/' });
        localStorage.clear();
    }
    if (session && session.user) {
        console.log(session.user)
        console.log({'token':session.accessToken})
        return (
            <>
                <h1>Dashboard</h1>
                <p>Name:{session.user.name}</p>
                <p>Email:{session.user.email}</p>
                <p>Token: {session.accessToken}</p>
                {session.user.image && typeof session.user.image === 'string' && (
                    <Image src={session.user.image} width={100} height={100} alt='user image' />
                )}
                <br />
                <button onClick={handleSignOut} style={{ backgroundColor: 'crimson', color: 'white' }}>sign out</button>
                <br />
                <br />
                <a href="/calenderEvent" style={{ textDecoration:'none', color: 'skyblue' }}>Create a calender event</a>

            </>
        )
    }
}


export default Dashboard