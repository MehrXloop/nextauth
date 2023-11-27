'use client'
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

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

  const handleSubmit = async (e:React.FormEvent) => {
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

  return (
    <div>
      <h1>Create an event</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Subject:
          <input
            type="text"
            name="subject"
            value={subject}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Start Time:
          <input
            type="time"
            name="startTime"
            value={startTime}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="time"
            name="endTime"
            value={endTime}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Body Content:
          <textarea
            name="content"
            value={content}
            onChange={handleChange}
          />
        </label>
        <label>
          Meeting Type:
          <select
            name="meetingType"
            onChange={handleMeetingTypeChange}
            defaultValue="online"
          >
            <option value="online">Online</option>
            <option value="onPremise">On Premise</option>
          </select>
        </label>
        {!onlineMeeting && (
          <label>
            Meeting Address:
            <input
              type="text"
              name="meetingAddress"
              value={meetingAddress}
              onChange={handleChange}
              required
            />
          </label>
        )}
        {additionalAttendees.map((attendee, index) => (
          <div key={index}>
            <label>
              Attendee {index + 1} Name:
              <input
                type="text"
                name="name"
                value={attendee.name}
                onChange={(e) => handleAttendeeChange(index, e)}
              />
            </label>
            <label>
              Attendee {index + 1} Email:
              <input
                type="email"
                name="email"
                value={attendee.email}
                onChange={(e) => handleAttendeeChange(index, e)}
                required
              />
            </label>
            <label>
              Attendee {index + 1} Type:
              <select
                name="type"
                value={attendee.type}
                onChange={(e) => handleAttendeeChange(index, e)}
              >
                <option value={AttendeeType.REQUIRED}>Required</option>
                <option value={AttendeeType.OPTIONAL}>Optional</option>
              </select>
            </label>
          </div>
        ))}
        <button type="button" onClick={handleAddAttendee}>
          + Add Attendee
        </button>
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CalendarEvent;
