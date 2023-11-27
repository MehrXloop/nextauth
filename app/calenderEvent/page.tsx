'use client'
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Heading,
  Input,
  Textarea,
  Select,
  Button,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';


enum AttendeeType {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
}

interface Attendee {
  name: string;
  email: string;
  type: AttendeeType;
}

const CalendarEvent = () => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [content, setContent] = useState('');
  const [onlineMeeting, setOnlineMeeting] = useState<boolean>(true); // Initially set as online meeting
  const [meetingAddress, setMeetingAddress] = useState('');
  const [additionalAttendees, setAdditionalAttendees] = useState<Attendee[]>([
    { name: '', email: '', type: AttendeeType.REQUIRED },
  ]);

  const { data: session } = useSession()

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

  const resetForm = () => {
    setSubject('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setContent('');
    setOnlineMeeting(true);
    setMeetingAddress('');
    setAdditionalAttendees([{ name: '', email: '', type: AttendeeType.REQUIRED }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const accessToken = session?.accessToken;

    // Create ISO format date-time strings from date, startTime, and endTime
    const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

    const eventPayload = {
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


    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      if (response.ok) {
        const createdEvent = await response.json();
        if (onlineMeeting) {
          let meetingUrl = createdEvent.onlineMeeting?.joinUrl || '';
          console.log('Meeting URL:', meetingUrl);
        }
        resetForm()
        // Handle the meeting URL as needed
      } else {
        console.error('Failed to create event with description:', response.statusText);
        // Handle error in creating the event
      }
    } catch (error) {
      console.error('Error creating event with description:', error);
      // Handle any other errors that might occur during the process
    }
  };

  const handleDeleteAttendee = (index: number) => {
    const updatedAttendees = [...additionalAttendees];
    updatedAttendees.splice(index, 1);
    setAdditionalAttendees(updatedAttendees);
  };


  return (
    <Box maxW="700px" mx="auto" mt="4">
      <Heading mb="4" textAlign='center'>Create Meeting Schedule</Heading>
      <form onSubmit={handleSubmit}>
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
            defaultValue="online"
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
        <Table variant='simple' mb="4">
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
          <Button colorScheme='blue' type="submit">Create Event</Button>
        </Box>
      </form>
    </Box>
  );
};

export default CalendarEvent;
