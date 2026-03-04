import React, {useState} from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import axios from 'axios';


const Dashboard = () => {
  const dashboardUrl = 'http://localhost:7890/getDashoard'
  const [user, setUser] = useState({})

  // Toastify notification for successful sign in
  const notify = () => {
    toast.success('Sign in Successful!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  };

  // Toastify notification for error 
  const errorNotify = (errorMessage) => {
    toast.error(`${errorMessage}`, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  };


  axios.get(dashboardUrl)
    .then((result) => {
      if (result.status === 200) {
        console.log(result.data);
        setUser(result.data);
      }
    })
    .catch((error) => {
      console.log(error)
      errorNotify('Failed to fetch dashboard data')
    })


  return (
    <>
      <div>Dashboard</div>
      <p>Welcome {user.username}!</p>
      <ToastContainer />
    </>
  )
}

export default Dashboard