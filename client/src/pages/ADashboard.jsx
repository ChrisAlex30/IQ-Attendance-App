import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Cookies from 'js-cookie';
import {useNavigate} from "react-router-dom"
import AdminModal from '../components/AdminModal';


const ADashboard = () => {
  const navigate = useNavigate();
  const [students,setStudents]= useState([])
  const [attendance,setAttendance]= useState([])
  const [idupd,setIdUpd]= useState('')
  const adminref=useRef()

  

  const fetchAttendance=async(id)=>{
    const token = Cookies.get('uid')    
    if (token) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/fetchstudents/${id}/${new Date().toLocaleString('default', { month: 'long' })}`, {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data= await response.json()
      if(data.length!==0){
        setAttendance(data[0].attendance)
        adminref.current.showModal()        
      }
      else{
        alert('Server Error')
        adminref.current.close()
      }
      
    }
    else{
      alert('PLz Login!!!')
      navigate("/")
    }    
  }

  const getData=async()=>{
    const token = Cookies.get('uid')    
    if (token) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/getstudents`, {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data= await response.json()
      setStudents(data)
    }
    else{
      alert('PLz Login!!!')
      navigate("/")
    }
  }
  useEffect(()=>{
    const token = Cookies.get('uid')    
    if (!token) {
        navigate('/')
        alert('plz login')            
     }
     else{
      getData()
     }
},[])

const [student,setStudent]=useState({
  id:'',
  name:'',
  classname:'',
  DOJ:new Date().toISOString().split('T')[0],
  Subject:[]
})
const{id,name,classname,DOJ,Subject}=student

const handleChange=(e)=>{
  setStudent({...student,[e.target.name]:e.target.value})
}
const subjectsAdd=(e)=>{
  if(e.target.checked){

      setStudent({
          ...student,Subject:[...Subject,e.target.value]
      })
  }
  else{
      
      console.log(Subject);

      setStudent({
          ...student,Subject:Subject.filter(val => val !== e.target.value)
      })
  }

}

const reset=()=>{
  setStudent({
    id:'',
    name:'',
    classname:'',
    DOJ:new Date().toISOString().split('T')[0],
    Subject:[]
  })
}
const handleEdit=(stu)=>{
  const{_id,name,classname,DOJ,Subject}=stu
  setStudent({
    id:_id,
    name,
    classname,
    DOJ:DOJ.split('T')[0],
    Subject:Subject.split(',')
  })
 }

const AddStudent=async(e)=>{
  const token = Cookies.get('uid')    
  if (token) {
      if(!name || !classname || !DOJ || Subject.length===0){   
        alert('Plz Fill all Fields!!!')
        return
      }
      if(id===''){
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/addstudents`, {
          credentials: 'include',  
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify({name, classname, DOJ, Subject})
          });
          const data= await response.json()
          if(Object.keys(data).length>0){
            alert(data.msg)
          }
      }
      else{
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/updatestudent/${id}`, {
          credentials: 'include',  
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify({name, classname, DOJ, Subject})
          });
          const data= await response.json()
          if(Object.keys(data).length>0){
            alert(data.msg)
          } 
      }
      reset()     
      getData()
  }
  else{
    alert('PLz Login!!!')
    navigate("/")
  }  
}



 const handleDelete=async(id)=>{
  const token = Cookies.get('uid')    
  if (token) {
      if(window.confirm('Are You Sure!!')){
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/deletedata/${id}`, {
        credentials: 'include',            
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
        });
        const data= await response.json()        
        if(Object.keys(data).length>0){
          alert(data.msg)
        }
        reset()     
        getData()
        }    
     }
    else{
    alert('PLz Login!!!')
    navigate("/")
  }
}

  return (
    <>
    <Navbar role="admin"/>
    <AdminModal adminref={adminref} attendance={attendance} idupd={idupd} fetchAttendance={fetchAttendance}/>
    <div className='bckg'>
    <div className="admin-form-heading">
  <span >WELCOME ADMIN</span>
</div>
    <div className='service-section'>
            <div className='service-form'>
            
            <span className='lbl'>Name</span>
        <input type="text" name="name" placeholder="Enter Name" value={name} onChange={handleChange} className='inp' />
        <span className='lbl'>Class</span>
        <select id="class" name="classname" className='inp-dd' value={classname} onChange={handleChange} >
        <option value="0">--Select Class--</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>

        <span className='lbl'>Date</span>
        <input type="date" id="date" placeholder="Enter Date" value={DOJ} name="DOJ" className='inp' onChange={handleChange} />
        <span className='lbl'>Subjects</span>
        <div>
            
          <input  id="ad_Checkbox1"  type="checkbox" checked={Subject.includes("PHY")}  onChange={subjectsAdd}  value="PHY" />
          <label>Physics</label>

          <input  id="ad_Checkbox2"  type="checkbox" checked={Subject.includes("CHE")}  onChange={subjectsAdd}  value="CHE" />
          <label>Chemistry</label>

          <input  id="ad_Checkbox3"  type="checkbox" checked={Subject.includes("MAT")}  onChange={subjectsAdd}  value="MAT" />
          <label>Maths</label>

          <input  id="ad_Checkbox4"  type="checkbox" checked={Subject.includes("BIO")}  onChange={subjectsAdd}  value="BIO" />
          <label>Biology</label><br />

          <input  id="ad_Checkbox5"  type="checkbox" checked={Subject.includes("ENG")}  onChange={subjectsAdd}  value="ENG" />
          <label>English</label>

          <input  id="ad_Checkbox6"  type="checkbox" checked={Subject.includes("COM")}  onChange={subjectsAdd}  value="COM" />
          <label>Commerce</label>

          <input  id="ad_Checkbox7"  type="checkbox" checked={Subject.includes("ECO")}  onChange={subjectsAdd}  value="ECO" />
          <label>Economics</label>

          <input  id="ad_Checkbox8"  type="checkbox" checked={Subject.includes("ACC")}  onChange={subjectsAdd}  value="ACC" />
          <label>Accounts</label><br />

          <input  id="ad_Checkbox9"  type="checkbox" checked={Subject.includes("CSC")}  onChange={subjectsAdd}  value="CSC" />
          <label>Computers</label>
          <input  id="ad_Checkbox10"  type="checkbox" checked={Subject.includes("SST")}  onChange={subjectsAdd}  value="SST" />
          <label>SST</label>
        </div>
     
      <br />
      <div >
        <button className="btn btn-log" value="Submit" onClick={AddStudent} id="submit">{id===''?'ADD':'UPDATE'}</button>
        <button className="btn btn-log" onClick={reset} value="Reset">RESET</button>
        <button className="btn btn-log" onClick={()=>{navigate("/deleted")}} value="Status" id="stat">DELETED</button>
      </div>
    </div>           
    <div className='service-table'>
    <table className="tab" >
            <thead >
                <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Subjects</th>
            <th>Join Date</th>
            <th>Actions</th>
            </tr>
            </thead>
            <tbody className="screen">
              {
                students.length===0?
                <tr>
                  <td colSpan={5}>NO DATA YET!!!</td>
                </tr>
                :
                students.map((student)=><tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.classname}</td>
                    <td>{student.Subject}</td>
                    <td>{new Date(student.DOJ).toLocaleString().split(',')[0].replaceAll('/','-')}</td>
                    <td>
                        <button onClick={()=>handleEdit(student)} className='tbl-btn' >Edit</button>
                        <button onClick={()=>handleDelete(student._id)} className='tbl-btn'>Delete</button>
                        <button onClick={()=>{
                          setIdUpd(student._id)
                          fetchAttendance(student._id)
                          }} className='tbl-btn' >View</button>
                    </td>
                </tr>)
              }
                
            </tbody>
      </table>
            </div>
    </div>

    </div>
    </>
  )
}

export default ADashboard