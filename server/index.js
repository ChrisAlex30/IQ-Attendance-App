const express = require("express");
const expressLayouts=require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const app = express();

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);

const port = 3000;
app.listen(port, () => {
  console.log(`server is running in port` + port);
});




// api-links url


app.use(require('./links/attendance'));


// app.post('/getteacherstudent', async(req,res)=>{
//   try{
//     let {classname,subjectcode}=req.body

//      const currentdate = new Date();

//       const getmonth = currentdate.getMonth();

//       const getyear = currentdate.getFullYear();

     
//     const users=await studentsmodel.find(
//       {
//         "attendance":{
//           $elemMatch:{
//             subjectname:subjectcode,
//             subjectstatus:"1",
//             "months.month":getmonth
//           }
//         },
//         classname:classname
//       }
//     )

//     res.send(users)

//     }catch (err) {
//       console.log(err);
//       // res.json({success:false,"message":"Server Error"});
//       res.status(500).send("Server error");
//   }
// })

