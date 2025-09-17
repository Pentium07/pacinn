import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    login: '',
    password: '',
  };

  const validationSchema = Yup.object({
    login: Yup.string()
      .required('Email or Username is required')
      .test('is-email-or-username', 'Enter a valid email or username', function (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
        return emailRegex.test(value) || usernameRegex.test(value);
      }),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, values, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    console.log("Login response:", response.data); // 👈 SEE STRUCTURE HERE

    if (response.status === 200) {
      toast.success('Login successful');

      // 🔑 Adjust this based on your backend response
      const token = response.data.token || response.data.access_token || response.data?.data?.authorization?.token;

      if (token) {
        localStorage.setItem("token", token);
      } else {
        console.error("No token found in login response");
      }

      navigate('/admin/dashboard');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setSubmitting(false);
  }
};




  return (
    <div className="min-h-screen bg-tetClr/50 flex items-center justify-center">
      <div className="w-[90%] md:w-[50%] bg-white rounded-lg shadow-lg p-8 transform transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-tetClr mb-6">Login</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                  Email or Username
                </label>
                <div className="relative mt-1">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Field
                    type="text"
                    name="login"
                    id="login"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr transition-all duration-200"
                    placeholder="Enter your email or username"
                  />
                  <ErrorMessage
                    name="login"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Field
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-tetClr transition duration-300"
                  >
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-tetClr text-white rounded-lg font-semibold hover:bg-pryClr hover:shadow-md transition-all duration-300"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        {/* <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-tetClr hover:underline">
            Register
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default Login;