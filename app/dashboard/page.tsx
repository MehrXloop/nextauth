"use client"
import React from 'react'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react';


const Dashboard = () => {
    const { data: session } = useSession()

    function handleSignOut() {
        signOut({ callbackUrl: "http://localhost:3000/" });
    }
    if (session && session.user) {
        console.log(session.user)
        return (
            <>
                <h1>Dashboard</h1>
                <p>Name:{session.user.name}</p>
                <p>Email:{session.user.email}</p>
                {session.user.image && typeof session.user.image === 'string' && (
                    <Image src={session.user.image} width={100} height={100} alt='user image' />
                )}
                <br />
                <button onClick={handleSignOut} style={{ backgroundColor: 'crimson', color: 'white' }}>sign out</button>

            </>
        )
    }
}

export default Dashboard