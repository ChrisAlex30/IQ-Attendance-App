import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Cookies from 'js-cookie';
import {useNavigate} from "react-router-dom"

const TDashboard = () => {
  const navigate = useNavigate();

  const [students,setStudents]= useState([])
  const [classname,setClassname]= useState('')

  const getStuAtt=(stu)=>{
    if(stu.length>0){
      let arr=[]
      stu.forEach(element => {
        let s=[]
        s.push(element._id)
        s.push(element.attendance[0].months[0].days[0].present)
        s.push(element.name)
        s.push(element.attendance[0].months[0].days[0].day)  
        arr.push(s)      
        });
        return arr
    }
    else  
      return []
}
  const getData=async(classname)=>{
    const token = Cookies.get('uid')    
    if (token) {
        if(classname===""){   
          alert('Plz Select a class First!!!')
          return
          }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/teacherstudentdetails/${classname}`, {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data= await response.json()
      setStudents(getStuAtt(data))
    }
    else{
      alert('PLz Login!!!')
      navigate("/")
    }
  }

  const reset=()=>{
    setStudents([])
    setClassname('')
  }

  useEffect(()=>{
    const token = Cookies.get('uid')    
    if (!token) {
        navigate('/')
        alert('plz login')            
     }
},[])

const handleChange=(e)=>{
  setClassname(e.target.value)
  if(e.target.value!=="0")
  getData(e.target.value)
  else
  reset()  
}


const SIdsAdd=(e,index)=>{
  if(e.target.checked){
      const arr=students[index]  
      arr[1]="P"
      setStudents(students.map((stu,i)=>i==index?arr:stu))
  }
  else{
    const arr=students[index]  
    arr[1]="A"
    setStudents(students.map((stu,i)=>i==index?arr:stu))  
  }
}

const update=async(e)=>{
            const token = Cookies.get('uid')    
            if (token) {
                    if(students.length===0){   
                        alert('No Students!!!')
                        return
                    }
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/teacherstudentdetailsupdate`, {
                    credentials: 'include',  
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body:JSON.stringify({students:students})
                    });
                    const data= await response.json()
                    if(Object.keys(data).length>0){
                      alert(data.msg)
                    } 
                    getData(classname)
            }
            else{
                alert('PLz Login!!!')
                navigate("/")
              }  
}
  return (
      <>
          <Navbar role="teacher"/>
          <div className='bckg'>
              <div className="admin-form-heading">
              <span >WELCOME TEACHER</span>
              </div>
              <div className='teacher-section'>
        <select  name="classname" className='inp-dd w-100' value={classname} onChange={handleChange} >
        <option value="0">--Select Class--</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
              <div className='service-table'>
                  <table className="tab" >
                      <thead >
                          <tr>
                            <th>Day</th> 
                            <th>Name</th>
                            <th>Attendance</th>
                          </tr>
                      </thead>
                      <tbody className="screen">
                        {
                          students.length===0?
                          <tr>
                            <td colSpan={5}>NO DATA YET!!!</td>
                          </tr>
                          :
                          students.map((student,index)=><tr key={index}>
                              <td>{student[3]}</td>
                              <td>{student[2]}</td>
                              <td>
                              <input type="checkbox" value={student._id} onChange={(e)=>{SIdsAdd(e,index)}} checked={student[1]==="P"} />
                              </td>
                          </tr>)
                        }
                          
                      </tbody>
                   </table>
              </div>
      
              </div>
              <div style={{
                  textAlign:"center",
                  marginTop:"20px"
              }}> 
              
              <button className="btn btn-log" onClick={update} >MARK PRESENT</button>
              <button className="btn btn-log" onClick={reset}  >RESET</button>
              </div>
              
          </div>
      </>
  )
}

export default TDashboard