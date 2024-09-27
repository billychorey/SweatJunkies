// client/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema for Formik
const ProfileSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  birthday: Yup.date().required('Birthday is required'),
});

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('User is not authenticated');
      setLoading(false);
      return;
    }

    // Fetch user data
    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching profile');
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching profile: ' + error.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = () => {
    const token = localStorage.getItem('token');

    if (!window.confirm('Are you sure? All activities will be deleted and you will be logged out.')) {
      return;
    }

    // Delete user account
    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error deleting profile');
        }
        return response.json();
      })
      .then(() => {
        localStorage.removeItem('token');
        navigate('/login');
      })
      .catch((error) => {
        setError('Error deleting profile: ' + error.message);
      });
  };

  const handleUpdate = (values, { setSubmitting }) => {
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error updating profile');
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
        setSubmitting(false);
      })
      .catch((error) => {
        setError('Error updating profile: ' + error.message);
        setSubmitting(false);
      });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-column">
      <h1>User Profile</h1>
      {error && <p className="error">{error}</p>}
      {userData ? (
        <Formik
          initialValues={{
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            birthday: userData.birthday || '',
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleUpdate}
        >
          {({ isSubmitting }) => (
            <Form>
              <div>
                <label htmlFor="first_name">First Name</label>
                <Field name="first_name" type="text" />
                <ErrorMessage name="first_name" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="last_name">Last Name</label>
                <Field name="last_name" type="text" />
                <ErrorMessage name="last_name" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="birthday">Birthday</label>
                <Field name="birthday" type="date" />
                <ErrorMessage name="birthday" component="div" className="error" />
              </div>
              <button type="submit" disabled={isSubmitting}>
                Update Profile
              </button>
            </Form>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            email: '',
            birthday: '',
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleUpdate}
        >
          {({ isSubmitting }) => (
            <Form>
              <div>
                <label htmlFor="first_name">First Name</label>
                <Field name="first_name" type="text" />
                <ErrorMessage name="first_name" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="last_name">Last Name</label>
                <Field name="last_name" type="text" />
                <ErrorMessage name="last_name" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div>
                <label htmlFor="birthday">Birthday</label>
                <Field name="birthday" type="date" />
                <ErrorMessage name="birthday" component="div" className="error" />
              </div>
              <button type="submit" disabled={isSubmitting}>
                Add Profile
              </button>
            </Form>
          )}
        </Formik>
      )}
      {userData && (
        <button onClick={handleDelete} style={{ color: 'red' }}>
          Delete Profile
        </button>
      )}
    </div>
  );
};

export default Profile;
