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
import { EditIcon, SmallCloseIcon, ChatIcon, InfoOutlineIcon, ArrowRightIcon, DeleteIcon, TimeIcon, CalendarIcon } from '@chakra-ui/icons'
import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, Flex, Textarea, ModalBody, ModalCloseButton, Button, Heading, Divider } from '@chakra-ui/react';
import EditEventForm from './EditEventForm';


export interface CalendarEvent {
    eventId: string;
    isOrganizer: boolean;
    organizer: {
        emailAddress: string;
    };
    attendees: Attendee[];
    onlineMeeting: string;
    bodyPreview: string;
    title: string;
    start: string;
    end: string;
}

interface Attendee {
    emailAddress: {
        name: string;
        address: string;
    };
    status: string;
}

interface OutlookCalendarProps {
    accessToken: string;
}

const OutlookCalendar: React.FC<OutlookCalendarProps> = ({ accessToken }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [clickedEventInfo, setClickedEventInfo] = useState<any>(null);
    const [cancellationNote, setCancellationNote] = useState('');
    const [cancelMode, setCancelMode] = useState(false)
    const [openEditForm, setOpenEditForm] = useState(false)


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
                    const parsedEvents: CalendarEvent[] = data.value.map((event: any) => {
                        return {
                            eventId: event.id,
                            isOrganizer: event.isOrganizer,
                            organizer: {
                                emailAddress: event.organizer.emailAddress,
                            },
                            attendees: event.attendees,
                            bodyPreview: event.bodyPreview,
                            onlineMeeting: event.onlineMeeting,
                            title: event.subject,
                            start: moment.utc(event.start.dateTime).tz('Asia/Karachi').format(),
                            end: moment.utc(event.end.dateTime).tz('Asia/Karachi').format(),
                        };
                    });
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

    // Function to handle opening the modal and setting clicked event info
    const handleEventClick = (clickInfo: any) => {
        setClickedEventInfo(clickInfo);
        console.log(clickInfo.event._def.extendedProps.attendees)
        setIsModalOpen(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setClickedEventInfo(null);
    };

    function cancelEvent() {
        setCancelMode(true)
    }

    const updateCalendarEvents = (updatedEvent: CalendarEvent) => {
        // Find and update the specific event in the events array
        const updatedEvents = events.map((event) =>
            event.eventId === updatedEvent.eventId ? updatedEvent : event
        );
        setEvents(updatedEvents);
    };


    async function cancelEventButton(id: string) {
        const eventId = id;
        const url = `https://graph.microsoft.com/v1.0/me/events/${eventId}/cancel`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment: cancellationNote }),
            });
            if (response.ok) {
                console.log('Event cancellation successful!');
                const updatedEvents = events.filter((event) => event.eventId !== eventId);
                setEvents(updatedEvents); // Update the state or refetch events
                // Close the modal or perform any other action upon cancellation success
                setIsModalOpen(false);
                setCancellationNote(''); // Reset the cancellation note
            } else {
                console.error('Event cancellation failed:', response.statusText);
                // Handle failure, show error message, etc.
            }
        } catch (error) {
            console.error('Error occurred during cancellation:', error);
            // Handle any other errors
        }
    }

    function joinMeeting(url: string) {
        window.open(url, '_blank');
    }

    function formatDateTime(start: any, end: any) {
        const startUTCDate = start.toLocaleDateString('en-US', {
            timeZone: 'UTC',
            weekday: 'short',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
        const startUTCTime = start.toLocaleTimeString('en-US', {
            timeZone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        const endUTCTime = end.toLocaleTimeString('en-US', {
            timeZone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        return `${startUTCDate} ${startUTCTime} - ${endUTCTime}`;
    }

    const extractBodyContent = (bodyPreview: string) => {
        // Split by '___' delimiter
        const parts = bodyPreview.split('___');

        // Check if there's a valid content before the URL
        if (parts.length > 1) {
            return parts[0]; // Return content before the URL
        }

        return bodyPreview; // Return the original preview if '___' is not found
    };

    const EventAttendees = (attendees: string[]) => {
        const attendeesStatus = attendees.map((attendee: any) => {
            const status = attendee.status.response === 'accepted' ? 'accepted' : "didn't respond";
            return `${attendee.emailAddress.name} ${status}`;
        }).join(', ');

        return attendeesStatus;
    }


    const calculateAttendeeStatus = (attendees: string[]) => {
        const acceptedAttendees = attendees.filter((attendee: any) => attendee.status.response === 'accepted');
        const respondedAttendees = acceptedAttendees.length;
        const totalAttendees = attendees.length;

        if (respondedAttendees === totalAttendees) {
            return `Accepted ${respondedAttendees}`;
        } else {
            const didntRespond = totalAttendees - respondedAttendees;
            return `Accepted ${respondedAttendees}, didn't respond ${didntRespond}`;
        }
    };


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
                eventColor="#61a1fe"
            />


            {/* Modal */}
            {clickedEventInfo && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{clickedEventInfo.event._def.extendedProps.title}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {
                                clickedEventInfo.event._def.extendedProps.isOrganizer ? (
                                    <>
                                        <Heading as='h5' size='lg' textAlign='center' >{clickedEventInfo.event._def.title}</Heading>
                                        <Divider />
                                        <Text> <TimeIcon mr={4} /> {formatDateTime(clickedEventInfo.event._instance.range.start, clickedEventInfo.event._instance.range.end)}</Text>
                                        {clickedEventInfo?.event?._def?.extendedProps?.onlineMeeting?.joinUrl &&
                                            <>
                                                <Divider />
                                                <Text fontSize='lg'><CalendarIcon mr={4} /> Microsoft Teams Meeting</Text>
                                                <Button ml={8} p={5} colorScheme="blue" color="black" leftIcon={<CalendarIcon />} onClick={() => joinMeeting(clickedEventInfo?.event?._def?.extendedProps?.onlineMeeting?.joinUrl)}>
                                                    Join
                                                </Button>
                                            </>
                                        }
                                        <Divider />
                                        <Text mb={0}><InfoOutlineIcon mr={4} />You&rsquo;re the organizer.</Text>
                                        <Text ml={9} fontSize='sm'>{EventAttendees(clickedEventInfo?.event?._def?.extendedProps?.attendees)}</Text>
                                        <Divider />
                                        {clickedEventInfo.event._def.extendedProps.bodyPreview && (
                                            (() => {
                                                const extractedContent = extractBodyContent(clickedEventInfo.event._def.extendedProps.bodyPreview);
                                                if (extractedContent) {
                                                    return (
                                                        <>
                                                            <Flex align="start">
                                                                <ChatIcon mr={4} mt={2} />
                                                                <Text flex={1} overflow='auto'>
                                                                    {extractedContent}
                                                                </Text>
                                                            </Flex>
                                                            <Divider />
                                                        </>
                                                    );
                                                }
                                                return null;
                                            })()
                                        )}

                                        <Button ml={4} leftIcon={<EditIcon color='blue' />} mb={4} colorScheme='black' mr={4} variant='outline' onClick={() => setOpenEditForm(true)}>
                                            Edit Event
                                        </Button>
                                        <Button leftIcon={<SmallCloseIcon color='red' />} mb={4} colorScheme='black' variant='outline' onClick={() => cancelEvent()}>
                                            Cancel Event
                                        </Button>
                                        {cancelMode && (
                                            <>
                                                <Textarea
                                                    value={cancellationNote}
                                                    onChange={(e) => setCancellationNote(e.target.value)}
                                                    placeholder="Enter cancellation note..."
                                                    mb={4}
                                                />
                                                <Button
                                                    colorScheme="blue"
                                                    color="black"
                                                    mr={3}
                                                    leftIcon={<ArrowRightIcon />}
                                                    onClick={() => {
                                                        cancelEventButton(clickedEventInfo.event._def.extendedProps.eventId);
                                                        setIsModalOpen(false);
                                                        setCancelMode(false);
                                                    }}
                                                >
                                                    Send
                                                </Button>
                                                <Button variant="outline" color="black" leftIcon={<DeleteIcon />} onClick={() => setCancelMode(false)}>Discard</Button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Heading as='h5' size='lg' textAlign='center' >{clickedEventInfo.event._def.title}</Heading>
                                        <Divider />
                                        <Text> <TimeIcon mr={4} /> {formatDateTime(clickedEventInfo.event._instance.range.start, clickedEventInfo.event._instance.range.end)}</Text>
                                        {clickedEventInfo?.event?._def?.extendedProps?.onlineMeeting?.joinUrl &&
                                            <>
                                                <Divider />
                                                <Text fontSize='lg'><CalendarIcon mr={4} /> Microsoft Teams Meeting</Text>
                                                <Button ml={8} p={5} colorScheme="blue" color="black" leftIcon={<CalendarIcon />} onClick={() => joinMeeting(clickedEventInfo?.event?._def?.extendedProps?.onlineMeeting?.joinUrl)}>
                                                    Join
                                                </Button>
                                            </>
                                        }
                                        <Divider />

                                        {clickedEventInfo.event._def.extendedProps.bodyPreview && (
                                            (() => {
                                                const extractedContent = extractBodyContent(clickedEventInfo.event._def.extendedProps.bodyPreview);
                                                if (extractedContent) {
                                                    return (
                                                        <>
                                                            <Flex align="start" justifyContent='center'>
                                                                <ChatIcon mr={4} mt={2} />
                                                                <Text flex={1} overflow='auto'>
                                                                    {extractedContent}
                                                                </Text>
                                                            </Flex>
                                                            <Divider />
                                                        </>
                                                    );
                                                }
                                                return null;
                                            })()
                                        )}
                                        <Text mb={0}><InfoOutlineIcon mr={4} />{clickedEventInfo.event._def.extendedProps.organizer.emailAddress.name} invited you</Text>
                                        <Text ml={8} fontSize='sm' mb={4}>{calculateAttendeeStatus(clickedEventInfo?.event?._def?.extendedProps?.attendees)}</Text>
                                    </>
                                )
                            }

                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}

            {openEditForm && clickedEventInfo && (
                <EditEventForm
                    eventId={clickedEventInfo.event._def.extendedProps.eventId}
                    eventData={clickedEventInfo.event}
                    accessToken={accessToken}
                    setOpenEditForm={setOpenEditForm}
                    openEditForm={openEditForm}
                    setIsModalOpen={setIsModalOpen}
                    updateCalendar={updateCalendarEvents}
                />
            )}

        </div>
    );
}
export default OutlookCalendar;