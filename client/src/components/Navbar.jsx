import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import {useNavigate} from "react-router-dom"



const Navbar = ({role}) => {
  const navigate = useNavigate();
  

  const handleLogout=(e)=>{
    Cookies.remove('uid')
    navigate('/')
    alert('Logged Out Successfully')    
    
  }  

  return (
    <div>
        <div className="navbar">
            <span className='logo' onClick={()=>{navigate(`/${role}`)}}>IQ ATTENDANCE APP</span>
            <button className='btn btn-log' onClick={handleLogout}>LOGOUT</button>
        </div>
    </div>
  )
}

export default Navbar