// client/src/components/Activities.js
import React, { useContext, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppContext } from '../AppContext'; // Import your context

const Activities = () => {
  const { activities, setActivities, error, setError } = useContext(AppContext); // Access context
  const [isAdding, setIsAdding] = useState(false); // State to manage adding new activity

  // Validation schema for the activity form
  const activitySchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    date: Yup.date().required('Date is required'),
    duration: Yup.number()
      .required('Duration is required')
      .min(1, 'Duration must be at least 1 minute'),
  });

  // Fetch all activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:5555/api/activities', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch activities');
          }
          const data = await response.json();
          setActivities(data); // Use context to set activities
        } catch (error) {
          setError('Error fetching activities: ' + error.message);
        }
      } else {
        setError('User is not authenticated');
      }
    };

    fetchActivities();
  }, [setActivities, setError]); // Add setActivities and setError to dependency array

  // Function to handle adding a new activity
  const handleSaveActivity = async (values, { setSubmitting, resetForm }) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://127.0.0.1:5555/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to add activity');
      }

      const data = await response.json();
      setActivities((prevActivities) => [...prevActivities, data]); // Update activities through context
      resetForm(); // Reset the form after successful submission
      setIsAdding(false); // Close the form after submission
    } catch (error) {
      setError('Error adding activity: ' + error.message);
    } finally {
      setSubmitting(false);
    }
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
