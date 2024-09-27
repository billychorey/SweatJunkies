import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [athlete, setAthlete] = useState({});
  const [activities, setActivities] = useState([]);
  const [races, setRaces] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Log the token here

        if (!token) {
            setError('User is not authenticated');
            setLoading(false);
            return;
        }

        try {
            // Fetch athlete profile
            const athleteResponse = await fetch('http://127.0.0.1:5555/api/athlete/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!athleteResponse.ok) throw new Error('Error fetching profile');
            const athleteData = await athleteResponse.json();
            console.log('Fetched Athlete:', athleteData); // Log the fetched athlete data here
            setAthlete(athleteData);

            // Fetch activities
            const activitiesResponse = await fetch('http://127.0.0.1:5555/api/activities', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!activitiesResponse.ok) throw new Error('Error fetching activities');
            const activitiesData = await activitiesResponse.json();
            setActivities(activitiesData);

            // Fetch races
            const racesResponse = await fetch('http://127.0.0.1:5555/api/races', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!racesResponse.ok) throw new Error('Error fetching races');
            const racesData = await racesResponse.json();
            setRaces(racesData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData(); // Call the fetchData function
}, []);



  return (
    <AppContext.Provider value={{ 
      athlete, 
      setAthlete,        // Add setter for athlete
      activities, 
      setActivities,     // Add setter for activities
      races, 
      setRaces,         // Add setter for races
      error, 
      setError,         // Add setter for error
      loading 
    }}>
      {children}
    </AppContext.Provider>
  );
};
