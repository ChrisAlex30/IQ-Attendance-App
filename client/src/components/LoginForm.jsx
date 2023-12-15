import React, { useState } from 'react'
import {useNavigate} from "react-router-dom"
import logo from "../assets/images/568.png"

const LoginForm = () => {

  const navigate = useNavigate();
    const [username,setusername]=useState('')
    const [password,setpassword]=useState('')

    const loginCall=  async()=>{        
      const data={
        name:username,
        password
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/login`, {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body:JSON.stringify(data)
      });
      response.json().then((json=>{
        if(json.msg==='success' && json.role==='admin'){
              navigate("/admin")
        }
        else
        if(json.msg==='success' && json.role==='teacher'){
          navigate("/teacher")
        }
        else
          alert('Incorrect Credentials')
      })); 
  } 

  const handleLogin=(e)=>{
      if(username && password)
      loginCall()
      else
      alert('plz fill fields')
  }

  return (
    <>
    

<div className="login-sec">
<div className="form-heading">
  <span >Login Form</span>
</div>

  <div className="imgcontainer">
    <img src={logo} alt="Avatar" className="avatar" />
  </div>

  <div className="login-form">
    <span className='lbl'>Username</span>
    <input type="text" placeholder="Enter Username" value={username} onChange={(e)=>{setusername(e.target.value)}} className='inp' />
    <span className='lbl'>Password</span>
    <input type="password" placeholder="Enter Password" value={password} onChange={(e)=>{setpassword(e.target.value)}} className='inp'/>
    <div style={{
        margin:"30px"
    }}>
    <button className="btn btn-log w-50" onClick={handleLogin} type="submit">Login</button>   
    </div>        
  </div>
  </div>  
    </>
  )
}

export default LoginForm