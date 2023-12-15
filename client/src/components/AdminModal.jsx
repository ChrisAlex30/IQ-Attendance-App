import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import {useNavigate} from "react-router-dom"


const AdminModal = ({attendance,adminref,idupd,fetchAttendance}) => {
    const navigate = useNavigate();
    const [updattendance,setUpdAttendance]= useState([])
    const [heads,setHeads]= useState([])
    const [toupdate,setToUpdate]= useState({
        month:'',
        day:'',
        subject:[],
        year:''
    })
    const getStuAtt=(att)=>{
        const col=att.length
        const row=att[0]?.months[0]?.days?.length
        let arr=[]
        if(row && col){
            for(let i=0;i<row;i++){  
                let obj={
                    month:att[0].months[0].month,
                    day:i+1,
                    subject:[],
                    year:att[0].months[0].year
                }              
                for(let j=0;j<col;j++){
                    // if(i===0){
                    //     setHeads([...heads,att[j].subjectname])
                    // }
                    let objS={
                        subjectname:att[j].subjectname,
                        value:att[j].months[0].days[i].present,
                        isEdit:true
                    }
                    obj.subject.push(objS)
                }
                arr.push(obj)
            }
        }
        return arr
    }
    const updateAttendance=()=>{
        console.log(attendance);
        adminref.current.close()
    }
   

    useEffect(()=>{
        reset()
    },[attendance])

    const reset=()=>{
        if(attendance.length!==0){
            setUpdAttendance(getStuAtt(attendance))
            setHeads(attendance.map((aa)=>aa.subjectname))
            setToUpdate({
                month:'',
                day:'',
                subject:[],
                year:''
            })           
        }
    }

    const closeView=()=>{ 
        setUpdAttendance([])
        setHeads([])
        adminref.current.close()
    }
    const handleEdit=async(i,e)=>{         
        if(e.target.value==="Edit"){
            const obj=updattendance[i]
            obj.subject.forEach((ss)=>{
                ss.isEdit=false
            })
            setUpdAttendance(updattendance.map((att,index)=>{
                return index===i?obj:att
             }))
        }      
        else{
            const token = Cookies.get('uid')    
            if (token) {
                    const obj=updattendance[i]
                    if(idupd==="" || Object.keys(obj).length===0){   
                        alert('Plz Select a Student First!!!')
                        return
                    }
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/att/fetchupdatestudents/${idupd}`, {
                    credentials: 'include',  
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body:JSON.stringify(obj)
                    });
                    const data= await response.json()
                    if(Object.keys(data).length>0){
                      alert(data.msg)
                    } 
                    fetchAttendance(idupd)
            }
            else{
                alert('PLz Login!!!')
                navigate("/")
              }  
        }
    }

    const handleChangedd=(indexM,index,e)=>{ 
        const obj=updattendance[indexM]
        obj.subject[index].value=e.target.value
        setUpdAttendance(updattendance.map((att,index)=>{
            return index===indexM?obj:att
         }))

    }

  return (
    <dialog ref={adminref}>
         <div className='service-table'>
    <table className="tab" >
            <thead >
            {     heads.length!==0 &&
                <tr>
                <th>Day</th>
                {heads.map((head,index)=><th key={index}>{head}</th>)}
                <th>Actions</th>           
                </tr>              
            }
            </thead>
            <tbody className="screen">
              {
                updattendance.length===0?
                <tr>
                  <td colSpan={4}>NO DATA YET!!!</td>
                </tr>
                :
                updattendance.map((student,indexM)=>  <tr key={indexM}>
                <td>{student?.day}</td>
                {student?.subject.map((sub,index)=>
                <td key={index}> 
                <select  name="classname" className='inp-dd' onChange={(e)=>{handleChangedd(indexM,index,e)}} disabled={sub.isEdit} value={sub.value} >
                <option value="Unknown">Unknown</option>
                    <option value="P">P</option>
                    <option value="A">A</option>
                </select> 
                </td> 
                )}
                <td>
                    <button className='tbl-btn w-100' onClick={(e)=>handleEdit(indexM,e)} value={student?.subject[0]?.isEdit===true?'Edit':'Update'} >{student?.subject[0]?.isEdit===true?'Edit':'Update'}</button>                        
                </td>
            </tr>)
              }
                
            </tbody>
      </table>
            </div>
            <div style={{
            textAlign:"center",
            marginTop:"20px"
        }}> 
        {/* <button className="btn btn-log" onClick={updateAttendance} >UPDATE</button> */}
        <button className="btn btn-log" onClick={reset}>RESET</button>
        <button className="btn btn-log" onClick={closeView}>CLOSE</button>
        </div>
    </dialog>
  )
}

export default AdminModal