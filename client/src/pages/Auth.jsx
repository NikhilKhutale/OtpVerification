import React, { useEffect, useRef, useContext, useState } from 'react'
import axios from 'axios';
import throttle from "lodash.throttle";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { CircularProgress } from '@mui/material';
import { AuthContext } from '../context/authContext';
import 'animate.css';
import profilePic from '../assets/pic.jpg'
import { axiosInstance } from '../config';

const initialState = {
  fName: '',
  lName: '',
  password: '',
  confirmPassword: '',
  mobileNo: '',
  email: '',
}

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const phoneNumberRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
const firstNameRegex = /^[a-zA-Z]+$/;
const lastNameRegex = /^[a-zA-Z]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const Auth = () => {
  const [form, setForm] = useState(initialState);
  const [isSignup, setIsSignup] = useState(true);
  const [isOtpConfirmed, setIsOtpConfirmed] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const [otpSendLoading, setOtpSendLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);

  const navigate = useNavigate()
  const { login, register } = useContext(AuthContext)

  const inputRefs = useRef([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const switchMode = () => {
    setForm({
      fName: '',
      lName: '',
      password: '',
      confirmPassword: '',
      mobileNo: '',
      email: '',
    })
    setIsOtpConfirmed(true)
    setIsSignup((prevIsSignup) => !prevIsSignup);
  }


  const handleInputChange = (event, index) => {
    const newOTP = [...otp];
    newOTP[index] = event.target.value;

    setOTP(newOTP);

    if (event.target.value.length === 1 && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleFocus = (index) => {
    if (inputRefs.current[index].value === '') {
      inputRefs.current[index].focus();
    }
  };

  useEffect(() => {
    const handleBackspace = (event, index) => {
      if (event.keyCode === 8 && index > 0 && event.target.value === '') {
        inputRefs.current[index - 1].focus();
      }
    };

    inputRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.addEventListener('keydown', (event) => handleBackspace(event, index));
      }
    });

    return () => {
      inputRefs.current.forEach((ref, index) => {
        if (ref) {
          ref.removeEventListener('keydown', (event) => handleBackspace(event, index));
        }
      });
    };
  }, [otpSent]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setOtpSendLoading(true)
      const res = await axiosInstance.post("api/otp/getOtp", { email: form.email, isSignup: isSignup })
      Swal.fire({
        html: `${res.data} !<br><span style="font-size: 12px;">Also check your spam folder.</span>`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setOtpSent(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `${error}`,
      });
    } finally {
      setOtpSendLoading(false);
    }

  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setOtpVerifyLoading(true);
      const res = await axiosInstance.post("api/otp/compareOtp", { otpEntered: otp })
      Swal.fire({
        text: `${res.data} !`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setIsOtpConfirmed(false)
      setOTP(['', '', '', '', '', ''])
      setTimer(300)
      setOtpSent('')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `${error.response.data}`,
      });
    } finally {
      setOtpVerifyLoading(false);
    }
  }

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otpSent, timer]);

  useEffect(() => {
    if (timer === 0) {
      setOtpSent(false);
      setTimer(300);
    }
  }, [timer]);

  const handleSubmit = throttle(async (e) => {
    e.preventDefault();

    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (isSignup) {

      if (!phoneNumberRegex.test(form.mobileNo)) {
        alert('Please enter a valid phone number');
        return;
      }

      if (!firstNameRegex.test(form.fName)) {
        alert('Please enter a valid first name');
        return;
      }

      if (!lastNameRegex.test(form.lName)) {
        alert('Please enter a valid last name');
        return;
      }
    }

    if (isSignup) {
      if (!passwordRegex.test(form.password)) {
        alert('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.');
        return;
      }
    }

    if (isSignup) {
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);
      isSignup ? await register(form) : await login(form)
      navigate('/')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `${err.response.data}`,
      });
    } finally {
      setLoading(false);
    }

  }, 1000)


  const handlePortfolio = () => {
    window.open('https://velvety-mochi-49252e.netlify.app/', '_blank');
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="login-form col-10 col-lg-5 col-md-7">
        <h2>{isSignup ? 'Sign Up' : 'Sign In'}</h2>
        <div className='d-flex align-items-center justify-content-center'>
          <button className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center icon-link icon-link-hover" onClick={handlePortfolio}>
            <span className="rounded-circle overflow-hidden me-2">
              <img src={profilePic} alt="profile_photo" className="img-fluid rounded-circle" style={{ width: '30px', height: '30px' }} />
            </span>
            <span>Nikhil Khutale</span>
            <svg className="bi" aria-hidden="true">
              <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="form-group mb-1">
                <label htmlFor="fName">First Name</label>
                <input type="text" className="form-control" id="fName" name='fName' placeholder="Enter first name" onChange={handleChange} required />
              </div>
              <div className="form-group mb-1">
                <label htmlFor="lName">Last Name</label>
                <input type="text" className="form-control" id="lName" name='lName' placeholder="Enter last name" onChange={handleChange} required />
              </div>
            </>
          )}
          <div className="form-group mb-1">
            <label htmlFor="email">Email address</label>
            <input type="email" className="form-control" id="email" name='email' value={form.email} placeholder="Enter email" onChange={handleChange} required />
          </div>
          {!otpSent && (
            <div className="form-group mb-1">
              {otpSendLoading ?
                <button className="btn btn-primary px-4"><CircularProgress sx={{ color: "#a8bffc" }} size={20} /></button> :
                isOtpConfirmed ?
                  <button className='btn btn-outline-primary' disabled={form.email.length < 7} onClick={handleSendOtp}>Verify Email</button> :
                  <button disabled='true' className='btn btn-success animate__animated animate__animate__fadeIn'>Email Verified<i className="fa-solid fa-circle-check ms-1"></i></button>
              }
            </div>
          )}
          {otpSent && (
            <div className="d-flex flex-column justify-content-center mb-1">
              <label htmlFor="">Enter OTP
                <span className="ms-1">
                  {timer > 0 ? (
                    <span style={{ color: timer < 60 ? "red" : "black" }}>
                      {Math.floor(timer / 60)}:
                      {timer % 60 < 10 ? `0${timer % 60}` : timer % 60} remaining
                    </span>
                  ) : (
                    <span>
                      OTP expired.
                    </span>
                  )}
                </span>

              </label>
              <div className="form-group d-flex mb-1" >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    pattern="\d"
                    required
                    className="form-control text-center mx-1"
                    value={digit}
                    onChange={(event) => handleInputChange(event, index)}
                    onFocus={() => handleFocus(index)}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                  />
                ))}
              </div>
              <div className="form-group mb-1">
                {otpVerifyLoading ?
                  <button className="btn btn-primary px-4"><CircularProgress sx={{ color: "#a8bffc" }} size={20} /></button> :
                  <button className='btn btn-outline-primary' onClick={handleVerifyOTP}>Verify otp</button>
                }
              </div>
            </div>
          )}
          {isSignup && (
            <div className="form-group mb-1">
              <label htmlFor="mobileNo">Mobile No.</label>
              <input type="text" className="form-control" id="mobileNo" name='mobileNo' placeholder="Enter mobile no." onChange={handleChange} required />
            </div>
          )}
          <div className="form-group mb-1">
            <label htmlFor="password">Password</label>
            <input type="password" className="form-control" id="password" name='password' value={form.password} placeholder="Enter password" onChange={handleChange} required />
          </div>
          {isSignup && (
            <div className="form-group mb-1">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" className="form-control" id="confirmPassword" name='confirmPassword' placeholder="Enter password" onChange={handleChange} required />
            </div>
          )}
          {loading ?
            <button className="btn btn-primary px-4"><CircularProgress sx={{ color: "#a8bffc" }} size={20} /></button> :
            <button disabled={isOtpConfirmed} type="submit" className="btn btn-primary btn-block">{isSignup ? "Sign Up" : "Sign In"}</button>
          }
        </form>
        <div className="text-center">
          <p>
            {isSignup
              ? "Already have an account? "
              : "Don't have an account? "
            }
            <span onClick={switchMode} className="switch icon-link icon-link-hover">
              {isSignup ? 'Sign In' : 'Sign Up'}
              <svg className="bi" aria-hidden="true">
                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
              </svg>
            </span>
          </p>
        </div>
      </div >
    </div >
  )
}

export default Auth

