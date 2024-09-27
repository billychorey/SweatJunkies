import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const RaceResults = () => {
  const initialValues = {
    race_name: '',
    date: '',
    distance: '',  // New field for distance
    time: ''  // New field for time
  };

  const validationSchema = Yup.object({
    race_name: Yup.string().required('Race name is required'),
    date: Yup.date().required('Date is required'),
    distance: Yup.number().required('Distance is required'),  // Validation for distance
    time: Yup.string().required('Time is required')  // Validation for time
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
          throw new Error('Failed to add race');
        }
        return response.json();
      })
      .then(data => {
        // Handle success
        resetForm();
      })
      .catch(error => console.error('Error adding race:', error));
  };

  return (
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
            <label htmlFor="distance">Distance (km)</label>
            <Field name="distance" type="number" step="0.1" />
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
  );
};

export default RaceResults;
