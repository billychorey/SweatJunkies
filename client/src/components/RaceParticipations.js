import React, { useState } from 'react';

const RaceParticipations = ({ participations, onAddParticipation }) => {
  const [raceId, setRaceId] = useState(''); // State to store selected race ID
  const [completionTime, setCompletionTime] = useState(''); // State to store completion time
  const [error, setError] = useState(''); // State to store errors

  // Handle form submission to add a new race participation
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!raceId || !completionTime) {
      setError('Please fill in all fields.');
      return;
    }

    // Create a new participation object
    const newParticipation = {
      race_id: raceId,
      completion_time: completionTime
    };

    // Call the onAddParticipation prop function to add the participation
    onAddParticipation(newParticipation);

    // Clear form fields after submission
    setRaceId('');
    setCompletionTime('');
    setError(''); // Clear any error messages
  };

  return (
    <div>
      <h2>Races and Participants</h2>

      {/* Display list of race participations */}
      {participations.length > 0 ? (
        <ul>
          {participations.map((participation) => (
            <li key={participation.id}>
              Race: {participation.race_name} - Completion Time: {participation.completion_time}
            </li>
          ))}
        </ul>
      ) : (
        <p>No race participations found.</p>
      )}

      <h3>Add a New Race Participation</h3>

      {/* Form to add a new participation */}
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="raceId">Race ID:</label>
          <input
            type="text"
            id="raceId"
            value={raceId}
            onChange={(e) => setRaceId(e.target.value)}
            placeholder="Enter race ID"
          />
        </div>
        <div>
          <label htmlFor="completionTime">Completion Time:</label>
          <input
            type="text"
            id="completionTime"
            value={completionTime}
            onChange={(e) => setCompletionTime(e.target.value)}
            placeholder="HH:MM:SS"
          />
        </div>
        <button type="submit">Add Participation</button>
      </form>
    </div>
  );
};

export default RaceParticipations;
