import React from 'react'

const adminDashboard = () => {
  return (
    <div>adminDashboard</div>

    // const handleEventClick = (clickInfo: any) => {
      // const eventId = clickInfo.event._def.extendedProps.eventId;
      // const organizer = clickInfo.event._def.extendedProps.isOrganizer

      // const event = clickInfo.event._def.extendedProps;
      // setClickedEvent(event);
      // const confirmCancellation = window.confirm("Do you want to cancel the event?");

      // if (confirmCancellation) {
      //     // Prompt for cancellation message
      //     const cancelMessage = window.prompt("Please provide a cancellation message:");

      //     // Check if cancelMessage is not null (user didn't cancel prompt)
      //     if (cancelMessage !== null) {
      //         // Make API call to cancel event
      //         const url = `https://graph.microsoft.com/v1.0/me/events/${eventId}/cancel`;
      //         const cancelAccessToken = accessToken; // Use a different variable name


      //         fetch(url, {
      //             method: 'POST',
      //             headers: {
      //                 'Authorization': `Bearer ${cancelAccessToken}`,
      //                 'Content-Type': 'application/json'
      //             },
      //             body: JSON.stringify({ comment: cancelMessage })
      //         })
      //             .then(response => {
      //                 if (response.ok) {
      //                     console.log("Event cancellation successful!");
      //                     const updatedEvents = events.filter(event => event.eventId !== eventId);
      //                     setEvents(updatedEvents); // Update the state
      //                 } else {
      //                     console.error("Event cancellation failed:", response.statusText);
      //                     // Handle failure, show error message, etc.
      //                 }
      //             })
      //             .catch(error => {
      //                 console.error("Error occurred during cancellation:", error);
      //                 // Handle any other errors
      //             });
      //     }
      // }
  // };
  )
}

export default adminDashboard