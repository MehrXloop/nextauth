'use client'
import { useState, useEffect } from 'react';
import { DeleteIcon } from '@chakra-ui/icons';
import { CalendarEvent } from './OutlookCalender';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Heading,
    Button,
    IconButton,
    Box
} from '@chakra-ui/react';


interface EditEventFormProps {
    eventId: string;
    eventData: any;
    accessToken: string;
    setOpenEditForm: React.Dispatch<React.SetStateAction<boolean>>;
    openEditForm: boolean;
    setIsModalOpen:React.Dispatch<React.SetStateAction<boolean>>;
    updateCalendar:any
}
enum AttendeeType {
    REQUIRED = 'required',
    OPTIONAL = 'optional',
}

interface Attendee {
    name: string;
    email: string;
    type: AttendeeType;
}

const EditEventForm: React.FC<EditEventFormProps> = ({ eventId, eventData, accessToken, setOpenEditForm, openEditForm,setIsModalOpen,updateCalendar }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [subject, setSubject] = useState(eventData._def.title);
    const [date, setDate] = useState(new Date(eventData._instance.range.start).toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(new Date(eventData._instance.range.start).toISOString().split('T')[1].split(':')[0] + ':' + new Date(eventData._instance.range.start).toISOString().split('T')[1].split(':')[1]);
    const [endTime, setEndTime] = useState(new Date(eventData._instance.range.end).toISOString().split('T')[1].split(':')[0] + ':' + new Date(eventData._instance.range.end).toISOString().split('T')[1].split(':')[1]);
    const [content, setContent] = useState(eventData._def.extendedProps.bodyPreview);
    const [onlineMeeting, setOnlineMeeting] = useState<boolean>(eventData._def.extendedProps.onlineMeeting ===null? false : true); // Initially set as online meeting
    const [meetingAddress, setMeetingAddress] = useState('');
    const initialAttendees = eventData._def.extendedProps.attendees.map((attendee: any) => {
        return {
            name: attendee.emailAddress.name,
            email: attendee.emailAddress.address,
            type: attendee.type,
        };
    });
    console.log(eventData._def.extendedProps.onlineMeeting)
    console.log(onlineMeeting)


    const [additionalAttendees, setAdditionalAttendees] = useState<Attendee[]>(initialAttendees);
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        switch (name) {
            case 'subject':
                setSubject(value);
                break;
            case 'date':
                setDate(value);
                break;
            case 'startTime':
                setStartTime(value);
                break;
            case 'endTime':
                setEndTime(value);
                break;
            case 'content':
                setContent(value);
                break;
            case 'meetingAddress':
                setMeetingAddress(value);
                break;
            default:
                break;
        }
    };

    const handleAttendeeChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const updatedAttendees = [...additionalAttendees];
        updatedAttendees[index] = { ...updatedAttendees[index], [name]: value };
        setAdditionalAttendees(updatedAttendees);
    };

    const handleAddAttendee = () => {
        setAdditionalAttendees([
            ...additionalAttendees,
            { name: '', email: '', type: AttendeeType.REQUIRED },
        ]);
    };

    const handleMeetingTypeChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (e.target.value === 'online') {
            setOnlineMeeting(true);
            setMeetingAddress('');
        } else {
            setOnlineMeeting(false);
        }
    };

    async function handleEditEvent(e: React.FormEvent) {

        e.preventDefault()
        setIsLoading(true);
        // Create ISO format date-time strings from date, startTime, and endTime
        const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
        const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

        const updatedEventData = {
            subject,
            start: {
                dateTime: startDateTime,
                timeZone: 'Asia/Karachi',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'Asia/Karachi',
            },
            isOnlineMeeting: onlineMeeting,
            attendees: additionalAttendees.map((attendee) => ({
                emailAddress: {
                    address: attendee.email,
                    name: attendee.name,
                },
                type: attendee.type,
            })),
            body: {
                contentType: 'HTML',
                content: content + (onlineMeeting ? '' : `<br>Meeting Address: ${meetingAddress}`),
            },
        };
        const url = `https://graph.microsoft.com/v1.0/me/events/${eventId}`;

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEventData),
            });

            if (response.ok) {
                console.log('Event updated successfully!');
                setOpenEditForm(false)
                setIsModalOpen(false)
                
            } else {
                console.error('Event update failed:', response.statusText);
                // Handle failure, show error message, etc.
            }
        } catch (error) {
            console.error('Error occurred during event update:', error);
            // Handle any other errors
        } finally {
            setIsLoading(false);
            updateCalendar(updatedEventData);
        }
    }

    const handleDeleteAttendee = (index: number) => {
        const updatedAttendees = [...additionalAttendees];
        updatedAttendees.splice(index, 1);
        setAdditionalAttendees(updatedAttendees);
    };

    const handleCloseModal = () => {
        setOpenEditForm(false)
    }

    return (
        <Modal isOpen={openEditForm} onClose={handleCloseModal} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Event</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleEditEvent}>
                        <FormControl mb="4">
                            <FormLabel>Subject</FormLabel>
                            <Input
                                type="text"
                                name="subject"
                                value={subject}
                                onChange={handleChange}
                                required
                            />
                        </FormControl>
                        <FormControl mb="4">
                            <FormLabel>Date</FormLabel>
                            <Input
                                type="date"
                                name="date"
                                value={date}
                                onChange={handleChange}
                                required
                            />
                        </FormControl>
                        <FormControl mb="4">
                            <FormLabel>Start Time</FormLabel>
                            <Input
                                type="time"
                                name="startTime"
                                value={startTime}
                                onChange={handleChange}
                                required
                            />
                        </FormControl>
                        <FormControl mb="4">
                            <FormLabel>End Time</FormLabel>
                            <Input
                                type="time"
                                name="endTime"
                                value={endTime}
                                onChange={handleChange}
                                required
                            />
                        </FormControl>
                        <FormControl mb="4">
                            <FormLabel>Body Content</FormLabel>
                            <Textarea
                                name="content"
                                value={content}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <FormControl mb="4">
                            <FormLabel>Meeting Type</FormLabel>
                            <Select
                                name="meetingType"
                                onChange={handleMeetingTypeChange}
                                defaultValue={onlineMeeting ? "online" : "onPremise"}
                            >
                                <option value="online">Online</option>
                                <option value="onPremise">On Premise</option>
                            </Select>
                        </FormControl>
                        {!onlineMeeting && (
                            <FormControl mb="4">
                                <FormLabel>Meeting Address</FormLabel>
                                <Input
                                    type="text"
                                    name="meetingAddress"
                                    value={meetingAddress}
                                    onChange={handleChange}
                                    required
                                />
                            </FormControl>
                        )}
                        <Heading as='h5' size='md' mt='10'>
                            Attendees:
                        </Heading>
                        <Table variant='simple' mb="4" width={100}>
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Email</Th>
                                    <Th>Type</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {additionalAttendees.map((attendee, index) => (
                                    <Tr key={index}>
                                        <Td>
                                            <Input
                                                type="text"
                                                name="name"
                                                value={attendee.name}
                                                onChange={(e) => handleAttendeeChange(index, e)}
                                            />
                                        </Td>
                                        <Td>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={attendee.email}
                                                onChange={(e) => handleAttendeeChange(index, e)}
                                                required
                                            />
                                        </Td>
                                        <Td>
                                            <Select
                                                width={120}
                                                name="type"
                                                value={attendee.type}
                                                onChange={(e) => handleAttendeeChange(index, e)}
                                            >
                                                <option value={AttendeeType.REQUIRED}>Required</option>
                                                <option value={AttendeeType.OPTIONAL}>Optional</option>
                                            </Select>
                                        </Td>
                                        <Td>
                                            {index !== 0 && (
                                                <IconButton
                                                    aria-label="Delete Attendee"
                                                    icon={<DeleteIcon />}
                                                    onClick={() => handleDeleteAttendee(index)}
                                                />
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Button colorScheme='blue' mb="4" type="button" onClick={handleAddAttendee}>
                            + Add Attendee
                        </Button>
                        <Box>
                            <Button colorScheme='blue' type="submit" isLoading={isLoading}>Update Event</Button>
                        </Box>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>

    )
}

export default EditEventForm