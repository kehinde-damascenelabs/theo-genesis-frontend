const fns = {
  fetchWeatherForecast: async ({ zipCode }) => {
    try {
      // const response = await fetch(`http://localhost:3000/weather/forecast?zipCode=${zipCode}`); //DEV
      const response = await fetch(`https://openaibackend-production.up.railway.app/weather/forecast?zipCode=${zipCode}`);
      const json = await response.json();
      console.log('_____________json________________:', json);
      return json;
    } catch (error) {
      throw new Error(`Failed to fetch weather forecast: ${error.message}`);
    }
  },

  // Create a new calendar event
  createReservationEvent: async ({ userId, date, time, partySize, email, restaurantName, restaurantAddress, name }) => {
    try {
      // const response = await fetch('http://localhost:3000/calendar/events', {
      const response = await fetch('https://openaibackend-production.up.railway.app/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          date,
          time,
          partySize,
          email,
          restaurantName,
          restaurantAddress,
          name
        })
      });
      
      const json = await response.json();
      console.log('_____________created calendar event________________:', json);
      
      // Refresh the calendar after creating an event
      if (typeof window !== 'undefined' && window.calendarRefresh && typeof window.calendarRefresh.refreshCalendar === 'function') {
        console.log('Triggering calendar refresh after event creation');
        window.calendarRefresh.refreshCalendar();
      }
      
      return json;
    } catch (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  },

  // Update an existing calendar event
  updateReservationEvent: async ({ userId, name, date, time, partySize, email, restaurantName, restaurantAddress, newName }) => {
    try {
      // Create an updates object excluding undefined values
      const updates = {
        userId,
        ...(date && { date }),
        ...(time && { time }),
        ...(partySize && { partySize }),
        ...(email && { email }),
        ...(restaurantName && { restaurantName }),
        ...(restaurantAddress && { restaurantAddress }),
        ...(newName && { name: newName }) // Use newName parameter but set as 'name' in the request
      };

      // const response = await fetch(`http://localhost:3000/calendar/events/${encodeURIComponent(name)}`, {
      const response = await fetch(`https://openaibackend-production.up.railway.app/calendar/events/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      const json = await response.json();
      console.log('_____________updated calendar event________________:', json);
      
      // Refresh the calendar after updating an event
      if (typeof window !== 'undefined' && window.calendarRefresh && typeof window.calendarRefresh.refreshCalendar === 'function') {
        console.log('Triggering calendar refresh after event update');
        window.calendarRefresh.refreshCalendar();
      }
      
      return json;
    } catch (error) {
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  },

  // Delete a calendar event
  deleteReservationEvent: async ({ userId, name }) => {
    try {
      // const response = await fetch(`http://localhost:3000/calendar/events/${encodeURIComponent(name)}`, {
      const response = await fetch(`https://openaibackend-production.up.railway.app/calendar/events/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      const json = await response.json();
      console.log('_____________deleted calendar event________________:', json);
      
      // Refresh the calendar after deleting an event
      if (typeof window !== 'undefined' && window.calendarRefresh && typeof window.calendarRefresh.refreshCalendar === 'function') {
        console.log('Triggering calendar refresh after event deletion');
        window.calendarRefresh.refreshCalendar();
      }
      
      return json;
    } catch (error) {
      throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
  },

  switchTab: async ({ tabName }) => {
    try {
      // Create a mapping from names to indices
      const tabIndices = {
        "Transcript": 0,
        "Restaurant Info": 1,
        "Menu": 2,
        "Calendar": 3
      };
      
      // Get the index for the requested tab
      const index = tabIndices[tabName];
      
      // Check if the index is valid
      if (index === undefined) {
        throw new Error(`Unknown tab name: ${tabName}`);
      }
      
      // Access the global tab switching function if available
      if (typeof window !== 'undefined' && window.panelCarouselControls) {
        window.panelCarouselControls.switchToTab(index);
        return { success: true, message: `Switched to ${tabName} tab` };
      } else {
        throw new Error("Tab switching controls not available");
      }
    } catch (error) {
      throw new Error(`Failed to switch tab: ${error.message}`);
    }
  }
};
                                                                                                    
module.exports = fns;
