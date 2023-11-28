'use client'
import React from 'react'
import { Heading } from '@chakra-ui/react'
import OutlookCalendar from '../components/OutlookCalender'

import { useSession } from 'next-auth/react';
const Calendar = () => {
    const { data: session } = useSession()
    if (session) {
        return (
            <div>
                <Heading as="h1" size="xl" textAlign={'center'} mt={4} mb={4}>
                  Your Outlook Calendar
                </Heading>
                <OutlookCalendar accessToken={session.accessToken} />
            </div>
        )
    }
   
}
export default Calendar