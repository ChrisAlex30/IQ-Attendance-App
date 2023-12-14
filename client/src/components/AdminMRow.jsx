import React, { useEffect, useState } from 'react'
import AdminMSubRow from './AdminMSubRow'

const AdminMRow = ({student,handleEdit,i}) => {

      //const{day,subject}=student

    // const [day,setDay]= useState([])
    // const [subject,setSubject]= useState([])

    // useEffect(()=>{
    //     if(student.length!==0){
    //         setDay(student.day)
    //         setSubject(student.subject)
    //     }
    //     },[student])  
    
  return (
    
    <tr>
                    <td>{student?.day}</td>
                    {student?.subject.map((sub,index)=>
                    <td key={index}> 
                    <select name="classname" className='inp-dd' onChange={(e)=>{}} disabled={sub.isEdit} value={sub.value} >
                    <option value="Unknown">Unknown</option>
                        <option value="P">P</option>
                        <option value="A">A</option>
                    </select>
                    </td> 
                    )}
                    <td>
                        <button className='tbl-btn w-100' onClick={()=>handleEdit(i)} >{student?.subject[0]?.isEdit===true?'Edit':'Update'}</button>                        
                    </td>
                </tr>
  )
}

export default AdminMRow