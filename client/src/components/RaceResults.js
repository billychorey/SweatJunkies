// client/src/components/RaceResults.js
import React, { useContext, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppContext } from '../AppContext'; // Import your context

const RaceResults = () => {
  const { races, setRaces, error, setError } = useContext(AppContext); // Access context
  const [loading, setLoading] = useState(true); // Loading state

  // Initial form values
  const initialValues = {
    race_name: '',
    date: '',
    distance: '',  // Free-form distance field
    time: ''  // Field for time
  };

  // Validation schema for the form
  const validationSchema = Yup.object({
    race_name: Yup.string().required('Race name is required'),
    date: Yup.date().required('Date is required'),
    distance: Yup.string().required('Distance is required'), // Validation as string to allow flexibility
    time: Yup.string().required('Time is required')  // Validation for time
  });

  // Fetch all races on component mount
  useEffect(() => {
    const fetchRaces = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:5555/api/races', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch races');
          }
          const data = await response.json();
          setRaces(data); // Use context to set races
        } catch (error) {
          setError('Error fetching races: ' + error.message);
        } finally {
          setLoading(false); // End loading
        }
      }
    };

    fetchRaces();
  }, [setRaces, setError]); // Add setRaces and setError to dependency array

  // Function to handle adding a new race
  const handleSubmit = async (values, { resetForm }) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://127.0.0.1:5555/api/races', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Failed to add race');
      }
      const data = await response.json();
      setRaces(prevRaces => [...prevRaces, data]); // Update races through context
      resetForm(); // Reset the form after successful submission
    } catch (error) {
      setError('Error adding race: ' + error.message);
    }
  };

  return (
    <div className='content-column'>
      <h2>Add New Race</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <label htmlFor="race_name">Race Name</label>
              <Field name="race_name" type="text" />
              <ErrorMessage name="race_name" component="div" />
            </div>
            <div>
              <label htmlFor="date">Date</label>
              <Field name="date" type="date" />
              <ErrorMessage name="date" component="div" />
            </div>
            <div>
              <label htmlFor="distance">Distance</label>
              <Field name="distance" type="text" />
              <ErrorMessage name="distance" component="div" />
            </div>
            <div>
              <label htmlFor="time">Time (hh:mm:ss)</label>
              <Field name="time" type="text" />
              <ErrorMessage name="time" component="div" />
            </div>
            <button type="submit" disabled={isSubmitting}>
              Save Race
            </button>
          </Form>
        )}
      </Formik>

      <h2>Race Results</h2>
      {loading && <p>Loading races...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {races.map((race) => (
          <li key={race.id}>
            {race.race_name} on {race.date} - Distance: {race.distance}, Time: {race.time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RaceResults;
