import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import 'moment-timezone';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Popover, PopoverTrigger, PopoverContent, PopoverBody, Button } from '@chakra-ui/react';



interface CalendarEvent {
    eventId: string;
    isOrganizer: boolean;
    organizer: {
        emailAddress: string;
    };
    onlineMeeting: string;
    bodyPreview: string;
    title: string;
    start: string;
    end: string;
}

interface OutlookCalendarProps {
    accessToken: string;
}

const OutlookCalendar: React.FC<OutlookCalendarProps> = ({ accessToken }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [clickedEvent, setClickedEvent] = useState<CalendarEvent | null>(null);
    const [clickedEventInfo, setClickedEventInfo] = useState<any>(null);


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
                    // console.log(data)
                    // if (data && data.value) {
                    //     data.value.forEach((event: EventFromGraphAPI) => {
                    //         if (event && event.id) {
                    //             console.log('Event ID:', event.id);
                    //         }
                    //     });

                    const parsedEvents: CalendarEvent[] = data.value.map((event: any) => ({
                        eventId: event.id,
                        isOrganizer: event.isOrganizer,
                        organizer: {
                            emailAddress: event.organizer.emailAddress,
                        },
                        bodyPreview: event.bodyPreview,
                        onlineMeeting: event.onlineMeeting,
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
    }, []);

    // const handleEventClick = (clickInfo: any) => {
    //     // const eventId = clickInfo.event._def.extendedProps.eventId;
    //     // const organizer = clickInfo.event._def.extendedProps.isOrganizer

    //     const event = clickInfo.event._def.extendedProps;
    //     setClickedEvent(event);
    //     // const confirmCancellation = window.confirm("Do you want to cancel the event?");

    //     // if (confirmCancellation) {
    //     //     // Prompt for cancellation message
    //     //     const cancelMessage = window.prompt("Please provide a cancellation message:");

    //     //     // Check if cancelMessage is not null (user didn't cancel prompt)
    //     //     if (cancelMessage !== null) {
    //     //         // Make API call to cancel event
    //     //         const url = `https://graph.microsoft.com/v1.0/me/events/${eventId}/cancel`;
    //     //         const cancelAccessToken = accessToken; // Use a different variable name


    //     //         fetch(url, {
    //     //             method: 'POST',
    //     //             headers: {
    //     //                 'Authorization': `Bearer ${cancelAccessToken}`,
    //     //                 'Content-Type': 'application/json'
    //     //             },
    //     //             body: JSON.stringify({ comment: cancelMessage })
    //     //         })
    //     //             .then(response => {
    //     //                 if (response.ok) {
    //     //                     console.log("Event cancellation successful!");
    //     //                     const updatedEvents = events.filter(event => event.eventId !== eventId);
    //     //                     setEvents(updatedEvents); // Update the state
    //     //                 } else {
    //     //                     console.error("Event cancellation failed:", response.statusText);
    //     //                     // Handle failure, show error message, etc.
    //     //                 }
    //     //             })
    //     //             .catch(error => {
    //     //                 console.error("Error occurred during cancellation:", error);
    //     //                 // Handle any other errors
    //     //             });
    //     //     }
    //     // }
    // };


    const handleEventClick = (clickInfo: any) => {
        setClickedEventInfo(clickInfo);
        console.log(clickedEventInfo)
    };

    const closePopover = () => {
        setClickedEventInfo(null);
    };

    function cancelEvent(id: string) {
        console.log('cancel button clicked', id)
    }
    function joinMeeting(id: string) {
        console.log('join button clicked', id)
    }
    return (
        <div style={{ width: '90vw', margin: 'auto' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                height={"90vh"}
                headerToolbar={{
                    start: "today prev,next",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                timeZone="Asia/Karachi"
                initialView='dayGridMonth'
                datesSet={(info: any) => handleDatesSet(info)}
                nowIndicator={true}
                events={events}
                dayMaxEvents={2}
                eventClick={handleEventClick}
                themeSystem='bootstrap5'
                eventColor="#b1f1d2"
            />


            {clickedEventInfo && (
                <Popover isOpen={!!clickedEventInfo} onClose={closePopover}>
                    <PopoverTrigger>
                        <div>
                            {/* This could be your clicked event */}
                            <h5>{clickedEventInfo.event._def.extendedProps.title}</h5>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverBody>
                            <h5>{clickedEventInfo.event._def.title}</h5>
                            <p>Start Date: {(clickedEventInfo.range)}</p>
                            <Button colorScheme="blue" onClick={() => joinMeeting(clickedEventInfo.event._def.extendedProps.eventId)}>
                                Join Meeting
                            </Button>
                            {clickedEventInfo.event._def.extendedProps.isOrganizer && (
                                <Button colorScheme="red" onClick={() => cancelEvent(clickedEventInfo.event._def.extendedProps.eventId)}>
                                    Cancel Event
                                </Button>
                            )}
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            )}

        </div>
    );
};

export default OutlookCalendar;