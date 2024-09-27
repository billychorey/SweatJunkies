// client/src/pages/RaceResults.js
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const RaceResults = () => {
  const [races, setRaces] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('User is not authenticated');
      return;
    }

    // Fetch race results
    fetch('http://127.0.0.1:5555/api/races', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching race results');
        }
        return response.json();
      })
      .then(data => setRaces(data))
      .catch(error => setError('Error fetching race results: ' + error.message));
  }, []);

  const initialValues = {
    race_name: '',
    date: '',
    result: ''
  };

  const validationSchema = Yup.object({
    race_name: Yup.string().required('Race name is required'),
    date: Yup.date().required('Date is required'),
    result: Yup.string().required('Result is required')
  });

  const handleSubmit = (values, { resetForm }) => {
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:5555/api/races', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(values)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error adding race result');
        }
        return response.json();
      })
      .then(data => {
        setRaces([...races, data]); // Add new race to state
        setSuccessMessage('Race result added successfully!');
        resetForm(); // Reset the form after submission
      })
      .catch(error => {
        setError('Error adding race result: ' + error.message);
      });
  };

  return (
    <div className="content-column">
      <h1>Race Results</h1>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      
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
              <ErrorMessage name="race_name" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="date">Date</label>
              <Field name="date" type="date" />
              <ErrorMessage name="date" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="result">Result</label>
              <Field name="result" type="text" />
              <ErrorMessage name="result" component="div" className="error" />
            </div>
            <button type="submit" disabled={isSubmitting}>Add Race</button>
          </Form>
        )}
      </Formik>

      <h2>Recent Races</h2>
      {races.length > 0 ? (
        <ul>
          {races.map(race => (
            <li key={race.id}>
              {race.race_name} on {race.date} - {race.result}
            </li>
          ))}
        </ul>
      ) : (
        <p>No races logged.</p>
      )}
    </div>
  );
};

export default RaceResults;
