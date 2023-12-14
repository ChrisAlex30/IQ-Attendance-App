import React from 'react'

const AdminMSubRow = ({sub}) => {


  return (
        <td> 
        <select id="class" name="classname" className='inp-dd' onChange={()=>{}} disabled={sub.isEdit} value={sub.value} >
        <option value="Unknown">Unknown</option>
            <option value="P">P</option>
            <option value="A">A</option>
        </select>
        </td>  )
}

export default AdminMSubRow