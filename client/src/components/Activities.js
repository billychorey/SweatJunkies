// client/src/components/Activities.js
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Activities = ({ activities, onAddActivity }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Validation schema for Formik
  const activitySchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    date: Yup.date().required('Date is required'),
    duration: Yup.number()
      .required('Duration is required')
      .min(1, 'Duration must be at least 1 minute')
  });

  // Function to handle form submission
  const handleSaveActivity = (values, { setSubmitting, resetForm }) => {
    onAddActivity(values); // Call the function passed as a prop
    resetForm();  // Reset the form fields
    setIsAdding(false); // Hide the form
    setSubmitting(false);
  };

  return (
    <div className="content-column">
      <h1>Activities</h1>
      {error && <p className="error">{error}</p>}
      <div className="activities-container">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <h2>{activity.description}</h2>
              <p>Date: {activity.date}</p>
              <p>Duration: {activity.duration} minutes</p>
            </div>
          ))
        ) : (
          <p>No activities found.</p>
        )}
      </div>
      <button onClick={() => setIsAdding(true)}>Add Activity</button>
      {isAdding && (
        <Formik
          initialValues={{ description: '', date: '', duration: '' }}
          validationSchema={activitySchema}
          onSubmit={handleSaveActivity}
        >
          {({ isSubmitting }) => (
            <Form>
              <h2>Add New Activity</h2>
              <div>
                <label htmlFor="description">Description</label>
                <Field name="description" type="text" />
                <ErrorMessage name="description" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="date">Date</label>
                <Field name="date" type="date" />
                <ErrorMessage name="date" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="duration">Duration (minutes)</label>
                <Field name="duration" type="number" />
                <ErrorMessage name="duration" component="div" className="error" />
              </div>
              <button type="submit" disabled={isSubmitting}>
                Save Activity
              </button>
              <button type="button" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default Activities;
