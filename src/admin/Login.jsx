import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import assets from '../assets/assests';

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

      console.log("Login response:", response.data);

      if (response.status === 200) {
        toast.success('Login successful');

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
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden">
      {/* Background Image */}
      <img
        src={assets.bg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-tetClr/50 z-10"></div>
      
      <div className="relative w-[90%] md:w-[70%] lg:w-[50%] bg-white rounded-2xl shadow-2xl p-6 md:p-12 z-20">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-tetClr mb-4 md:mb-6 lg:mb-8">Sign In</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 md:space-y-5 lg:space-y-6">
              <div>
                <label htmlFor="login" className="block text-sm md:text-sm lg:text-base font-semibold text-gray-800 mb-1 md:mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base lg:text-lg" />
                  <Field
                    type="text"
                    name="login"
                    id="login"
                    className="w-full pl-10 pr-4 py-2 md:py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr transition-all duration-300 text-sm md:text-sm lg:text-base bg-white/50"
                    placeholder="Enter your email or username"
                  />
                  <ErrorMessage
                    name="login"
                    component="div"
                    className="text-red-500 text-sm md:text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm md:text-sm lg:text-base font-semibold text-gray-800 mb-1 md:mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base lg:text-lg" />
                  <Field
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    className="w-full pl-10 pr-10 py-2 md:py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr transition-all duration-300 text-sm md:text-sm lg:text-base bg-white/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-tetClr transition duration-300"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm md:text-base lg:text-lg" /> : <FaEye className="text-sm md:text-base lg:text-lg" />}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm md:text-sm mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 md:py-2.5 lg:py-3 bg-tetClr text-white rounded-lg font-semibold hover:bg-pryClr hover:shadow-xl transition-all duration-300 text-sm md:text-sm lg:text-base"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In'}
              </button>
            </Form>
          )}
        </Formik>
        {/* <p className="mt-4 md:mt-5 lg:mt-6 text-center text-sm md:text-sm lg:text-base text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-tetClr hover:underline font-medium">
            Register
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default Login;