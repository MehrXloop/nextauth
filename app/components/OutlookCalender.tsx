import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import 'moment-timezone'; 

interface CalendarEvent {
    title: string;
    start: string;
    end: string;
}

interface OutlookCalendarProps {
    accessToken: string;
}

const OutlookCalendar: React.FC<OutlookCalendarProps> = ({ accessToken }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const fetchEventsForMonth = async (start: Date, end: Date) => {
        try {
            let allEvents: CalendarEvent[] = [];
            let url = `https://graph.microsoft.com/v1.0/me/calendarview` +
                `?startDateTime=${start.toISOString()}` +
                `&endDateTime=${end.toISOString()}`;

            while (url) {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const parsedEvents: CalendarEvent[] = data.value.map((event: any) => ({
                        title: event.subject,
                        start: moment.utc(event.start.dateTime).tz('Asia/Karachi').format(),
                        end: moment.utc(event.end.dateTime).tz('Asia/Karachi').format(),
                    }));
                    allEvents = allEvents.concat(parsedEvents);

                    if (!data["@odata.nextLink"]) {
                        break; // No more pages, exit loop
                    } else {
                        url = data["@odata.nextLink"]; // Get the next page URL
                    }
                } else {
                    console.error('Failed to fetch calendar events:', response.statusText);
                    break;
                }
            }

            setEvents(allEvents);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
    };

    const handleDatesSet = (info: any) => {
        const startOfMonth = moment(info.startStr).startOf('month').toDate();
        const endOfMonth = moment(info.endStr).endOf('month').toDate();
        fetchEventsForMonth(startOfMonth, endOfMonth);
    };

    useEffect(() => {
        if (accessToken) {
            const today = new Date();
            const startOfMonth = moment(today).startOf('month').toDate();
            const endOfMonth = moment(today).endOf('month').toDate();
            fetchEventsForMonth(startOfMonth, endOfMonth);
        }
    }, [accessToken]);

    return (
        <div style={{ width: '90vw', margin: 'auto' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                height={"90vh"}
                headerToolbar={{
                    start: "today prev,next",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                initialDate="2023-11-01"
                timeZone="Asia/Karachi"
                initialView='dayGridMonth'
                datesSet={(info: any) => handleDatesSet(info)}
                nowIndicator={true}
                events={events}
            // eventBackgroundColor="#b1f1d2"
            />
        </div>
    );
};

export default OutlookCalendar;
