import React, { useEffect, useContext } from 'react';
import { AppContext } from '../AppContext'; // Adjust path as necessary

const RaceParticipations = () => {
    const { races, setRaces, error, setError } = useContext(AppContext);

    useEffect(() => {
        const fetchRaces = async () => {
            const token = localStorage.getItem('token'); 
            try {
                const response = await fetch('http://127.0.0.1:5555/api/races_with_participants', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Error fetching races');
                }
                const data = await response.json();
                setRaces(data); // Use setRaces from context
            } catch (err) {
                setError(err.message); // Use setError from context
            }
        };

        fetchRaces();
    }, [setRaces, setError]); // Add setRaces and setError to dependencies

    return (
        <div>
            <h2>Other Sweat Junkie's Results</h2>
            {error && <p className="error">{error}</p>}
            <ul>
                {races.length > 0 ? (
                    races.map(race => (
                        <li key={race.id}>
                            {race.race_name} on {race.date} - Participants: {race.participants ? race.participants.join(', ') : 'No participants'}
                        </li>
                    ))
                ) : (
                    <p>No race participations found.</p>
                )}
            </ul>
        </div>
    );
};

export default RaceParticipations;
