import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment-timezone';

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
}

interface OutlookCalendarProps {
    accessToken: string;
}

const mLocalizer = momentLocalizer(moment);

const OutlookCalendar: React.FC<OutlookCalendarProps> = ({ accessToken }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const fetchEventsForMonth = async (start: Date, end: Date) => {
        try {
            let allEvents: CalendarEvent[] = [];
            let url =
                `https://graph.microsoft.com/v1.0/me/calendarview` +
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
                        start: moment.utc(event.start.dateTime).tz('Asia/Karachi').toDate(),
                        end: moment.utc(event.end.dateTime).tz('Asia/Karachi').toDate(),
                    }));
                    allEvents = allEvents.concat(parsedEvents);

                    if (!data['@odata.nextLink']) {
                        break; // No more pages, exit loop
                    } else {
                        url = data['@odata.nextLink']; // Get the next page URL
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

    const handleDatesSet = (range: Date[] | { start: Date; end: Date }) => {
        if (Array.isArray(range)) {
            // Handle the case when an array of dates is received (in case of day view)
            const startOfMonth = moment(range[0]).startOf('month').toDate();
            const endOfMonth = moment(range[range.length - 1]).endOf('month').toDate();
            fetchEventsForMonth(startOfMonth, endOfMonth);
        } else {
            // Handle the case when an object with start and end dates is received
            const startOfMonth = moment(range.start).startOf('month').toDate();
            const endOfMonth = moment(range.end).endOf('month').toDate();
            fetchEventsForMonth(startOfMonth, endOfMonth);
        }
    };

    useEffect(() => {
        if (accessToken) {
            const today = new Date();
            const startOfMonth = moment(today).startOf('month').toDate();
            const endOfMonth = moment(today).endOf('month').toDate();
            fetchEventsForMonth(startOfMonth, endOfMonth);
        }
    }, [accessToken]);

    // const ColoredDateCellWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    //     React.cloneElement(React.Children.only(children) as React.ReactElement, {
    //       style: {
    //         backgroundColor: 'lightblue',
    //       },
    //     })
    //   );

    return (
        <div style={{ width: '90vw', margin: 'auto' }}>
            <Calendar
                localizer={mLocalizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '90vh' }}
                views={['month', 'week', 'day']}
                toolbar={true}
                // eventPropGetter={ColoredDateCellWrapper}
                onRangeChange={(range) => handleDatesSet(range)}
            />
        </div>
    );
};

export default OutlookCalendar;
