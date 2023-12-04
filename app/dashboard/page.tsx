"use client"
import React from 'react'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react';
import OutlookCalendar from '../components/OutlookCalender';
import { Button } from '@chakra-ui/react';

const Dashboard = () => {
    const { data: session } = useSession()

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: 'http://localhost:3000/' });
        localStorage.clear();
    }
    if (session && session.user) {
        console.log(session.user)
        console.log({ 'token': session.accessToken })
        return (
            <>
                <h1>Dashboard</h1>
                <p>Name:{session.user.name}</p>
                <p>Email:{session.user.email}</p>
                <p>Token: {session.accessToken}</p>
                {session.user.image && typeof session.user.image === 'string' && (
                    <Image src={session.user.image} width={100} height={100} alt='user image' />
                )}
                <Button onClick={handleSignOut} colorScheme='red' mb="4" mt="4" type="button" >
                    sign out
                </Button>
                <br />
                
                <a href="/calendar" style={{ textDecoration: 'none', color: 'black' }}>View your calendar</a>
                <br />
                <a href="/calenderEvent" style={{ textDecoration: 'none', color: 'black' }}>Create a calendar event</a>

            </>
        )
    }
}


export default Dashboard