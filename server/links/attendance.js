const express=require('express');
const jwt = require('jsonwebtoken');

require("dotenv").config();
const router=express.Router()



const path=require('path')

const oper=require('../models/model-attendance')


const authenticateJwt = (req, res, next) => {
  const authHeader = req.cookies.uid;
  if (authHeader) {    
    jwt.verify(authHeader, process.env.SECRET_KEY, (err, username) => {
      if (err) {
        res.clearCookie("uid")
        return res.sendStatus(403);
         }  
      else{
        //console.log(username);
        // if(Object.keys(username).length>0)
        // req.headers.cId=username.username.substring(0,3)
        // { username: 'alexSir', iat: 1691722729, exp: 1691726329 }
        req.header.role=username.role
        next();
        }
    });
  } else {
    res.sendStatus(401);
  }
};

//LOGOUT
router.post("/api/att/logout", async (req, res) => {

  try{ 
    res.cookie("uid","")
    res.status(201).json({msg:'Logged Out!!'})       
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"Server Error"});
  }
});

//PUBLIC
//LOGIN
router.post("/api/att/login", async (req, res) => {

      try{  
        const { name, password } = req.body;
        console.log(req.body);
        if(!name || !password){          
          res.status(401).json({ msg: "Plz Fill All Fields" });
          console.log('hello');
          return;
        }

        
        const admin = await oper.adminmodel.findOne({ name, password });
        if(admin){
          const token = jwt.sign({ name,role:'admin' }, process.env.SECRET_KEY, { expiresIn: '1h' });
          res.cookie("uid",token)
          res.status(201).json({msg:'success'})
          
          return
        }
        const teacher = await oper.teachersmodel.findOne({ name, password });
        if(teacher){
          const token = jwt.sign({ name,role:'teacher' }, process.env.SECRET_KEY, { expiresIn: '1h' });
          res.cookie("uid",token)
          res.status(201).json({msg:'success'})
          return
        }

        res.status(401).json({msg:'Invalid Credentials'})       
      }
      catch(err){
        console.log(err);
        res.status(500).json({msg:"Server Error"});
      }
  });


//PRIVATE ADMIN ROUTES//

//add student
router.post("/api/att/addstudents", authenticateJwt,async function (req, res) {
  try {

    const role=req.header.role
    if(role!=="admin"){
      res.status(401).json({msg:"NOT AUTHORIZED"});
      return
    }

    let { name, classname, DOJ, Subject } = req.body;
    
    if (
      req.body.name == undefined ||
      req.body.classname == undefined ||
      req.body.DOJ == undefined ||
      req.body.Subject == undefined ||
      req.body.name == "" ||
      req.body.phno == "" ||
      req.body.DOJ == "" ||
      req.body.Subject == ""
    ) {  
        res.status(401).json({msg:"Please fill all fields!!!"});
        return
    } 

    const stu = await oper.studentsmodel.findOne({
      name,
      classname
    });
    if(stu){
      res.status(401).json({msg:"Student Name already exists!!!"});
      return
    }


    
    const currentdate = new Date(DOJ);  
    const getmonth = currentdate.getMonth();  
    const getyear = currentdate.getFullYear();
    let months = []; 
    let attendance = [];
    let strarr = Subject;
    strarr.forEach((subjectname) => {
    for (let i = getmonth; i < 12; i++) {
        const monthname = new Date(getyear, i, 1).toLocaleString(
          "default",
          { month: "long" }
        );
        const daysinmonth = new Date(getyear, (i+1), 0).getDate();
        let days = [];
        for (let i = 1; i <= daysinmonth; i++) {
          days.push({
            day: `${i.toString()}`,
            present: 'Unknown',
            
          });
        }

        const monthobj = {
          month: monthname,
          year:getyear,
          days: days,
        };
        months.push(monthobj);
      }
    for (let i = 0; i <3; i++) {
      const monthname = new Date(getyear+1, i , 1).toLocaleString(
        "default",
        { month: "long" }
      );
      const daysinmonth = new Date(getyear+1, (i+1), 0).getDate();

      // console.log(monthname);
      // console.log(daysinmonth);
      let days = [];

      for (let i = 1; i <= daysinmonth; i++) {
        days.push({
          day: `${i.toString()}`,
          present: "Unknown",
        
        });
      }
      
      const monthobj = {
        month: monthname,
        year:getyear+1,
        days: days,
      };
      // console.log(monthobj.days);
      months.push(monthobj);
    }
    let eachsubject = {
      subjectname: subjectname,
      subjectstatus: "1",
      months: months,
    };
    months=[];
    attendance.push(eachsubject);
    });
    let status = "1";
    const user = new oper.studentsmodel({
      name,
      classname,
      DOJ, 
      Subject:Subject.toString(),
      status,
      attendance,
    });
    await user.save();
    res.status(201).json({ msg: " Student Saved" });
    
  } 
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server Error" });
  }
});
  
  
//get students
router.get("/api/att/getstudents", authenticateJwt,async (req, res) => {
    try {
        const role=req.header.role
        if(role!=="admin"){
          res.status(401).json({msg:"NOT AUTHORIZED"});
          return
        }

        const stu = await oper.studentsmodel.find({ status: "1" },{
          "_id": 1,
          "name": 1,
          "classname": 1,
          "DOJ": 1,
          "Subject":1
      });
        res.status(201).json(stu)
    } catch (err) {
        console.log(err);
        res.status(500).json("Server Error");
    }
});
  
//update student  **accepts String of subjects seperated by commas**
router.put("/api/att/updatestudent/:id", authenticateJwt,async function (req, res) {
  try {
      let { name, classname, DOJ, Subject } = req.body;
      let id=req.params.id.toString()
      console.log(id);
      if (!name || !classname || !DOJ || Subject.length===0 || !id) {  
        res.status(401).json({msg:"Please fill all fields!!!"});
        return
    } 

    const role=req.header.role
    if(role!=="admin"){
      res.status(401).json({msg:"NOT AUTHORIZED"});
      return
    }
      
        
        let strarr = Subject
        // strarr = ["maths", "phy", "chem"]
        console.log('strarr', strarr);


        //deleting record -$nin finds the element which is not in the specified list 
        await oper.studentsmodel.updateMany(
            {
                _id: id
            },
            {
                $set: {
                    "attendance.$[elem].subjectstatus": "0"
                }
            },
            {
                arrayFilters: [
                    {
                        "elem.subjectname": { $nin: strarr }
                    }
                ]
            }
        );
        // add pre existing data

        oper.studentsmodel.updateMany(
            { _id: id },
            {
                $set: {
                    "attendance.$[element].subjectstatus": '1'
                }
            },
            {
                arrayFilters: [
                    {
                        "element.subjectname": { $in: strarr },
                        "element.subjectstatus": '0'
                    }
                ]
            }
        ).then(result => {
            console.log(result.nModified + " document(s) updated");
            console.log("Selected elements:");
            console.log(result);
        }).catch(err => {
            console.log('err' + err);
        });

        //add new data

        // total subject there in db

        let newSubjects = []
        let existingsubject = await oper.studentsmodel.findOne({ _id: id }).distinct("attendance.subjectname");

        strarr.forEach((subject) => {

            if (!existingsubject.includes(subject)) {
                newSubjects.push(subject)
            }
        });


        const currentdate = new Date(DOJ);

        const getmonth = currentdate.getMonth();

        const getyear = currentdate.getFullYear();

        // console.log(getmonth);
        let months = [];
    

        attendance = [];
      

      
        newSubjects.forEach((subjectname) => {
        for (let i = getmonth; i < 12; i++) {
            const monthname = new Date(getyear, i, 1).toLocaleString(
              "default",
              { month: "long" }
            );
            const daysinmonth = new Date(getyear, i, 0).getDate();
    
            // console.log(monthname);
            // console.log(daysinmonth);
            let days = [];
    
            for (let i = 1; i <= daysinmonth; i++) {
              days.push({
                day: `${i.toString()}`,
                present: 'Unknown',
              
              });
            }
    
            const monthobj = {
              month: monthname,
              year:getyear,
              days: days,
            };
            months.push(monthobj);
          }

          
        for (let i = 0; i <3; i++) {
          const monthname = new Date(getyear+1, i , 1).toLocaleString(
            "default",
            { month: "long" }
          );
          const daysinmonth = new Date(getyear+1, i, 0).getDate();
  
          // console.log(monthname);
          // console.log(daysinmonth);
          let days = [];
  
          for (let i = 1; i <= daysinmonth; i++) {
            days.push({
              day: `${i.toString()}`,
              present: "Unknown",
            });
          }
          
          const monthobj = {
            month: monthname,
            year:getyear+1,
            days: days,
          };
          // console.log(monthobj.days);
          months.push(monthobj);
        }



        let eachsubject = {
          subjectname: subjectname,
          subjectstatus: "1",
          months: months,
        };
        months=[];  
        attendance.push(eachsubject);
        // console.log(eachsubject);
      });

        await oper.studentsmodel.updateOne(
          { _id: id },
          {
              $set: {
                  name: name,
                  classname: classname,
                  DOJ: DOJ,
                  Subject: Subject.toString()
              },
              $push: {
                  attendance: {
                      $each: attendance
                  }
              }
          }
        );

        res.status(201).json({msg:"Student Updated"})
  
  }
  catch (err) {
      console.log(err);
      res.status(500).json({msg:'Not Updated'})        
  }
})
  
  
  //delete students
  router.delete("/api/att/deletedata/:id", authenticateJwt,async (req, res) => {  
      try {
          const role=req.header.role
          if(role!=="admin"){
            res.status(401).json({msg:"NOT AUTHORIZED"});
            return  
          }

          let { id } = req.params;
          await oper.studentsmodel.findByIdAndUpdate(id, { status: "0" });
          res.status(201).json({msg:"Student Deleted"});
      } catch (err) {
          console.log(err);
          res.status(500).json({msg:'Not Deleted'})        
      }
  });
  
  
  //get deleted   students
  router.get("/api/att/getdeletedstudents", authenticateJwt,async (req, res) => {
      try {
          const role=req.header.role
          if(role!=="admin"){
            res.status(401).json({msg:"NOT AUTHORIZED"});
            return  
          }
          const users = await oper.studentsmodel.find({ status: "0" },{
            "_id": 1,
            "name": 1,
            "classname": 1,
            "DOJ": 1
        });
          res.status(201).json(users);
      } catch (err) {
          console.log(err);
          res.status(500).json({msg:"Server Error"});
      }
  });  
  
  //reverts deleted   students
  router.put("/api/att/revertdeletedstudents", authenticateJwt,async (req, res) => {
      try {

          const role=req.header.role
          if(role!=="admin"){
            res.status(401).json({msg:"NOT AUTHORIZED"});
            return  
          }

          let { studentsIds } = req.body;
          if(studentsIds?.length===0)  {
            res.status(401).json({msg:"Please Select Some Students!!"});
            return
          }
          await oper.studentsmodel.updateMany(
              { _id: { $in: studentsIds } },
              {
                  $set: {
                      "status": '1'
                  }
              }
          );
          res.status(201).json({msg:"Reverted Successfully"});
      } catch (err) {
          console.log(err);
          res.status(500).json("Server Error");
      }
  });


  //ADMIN ATTENDANCE FORMS//
  //fetches a specific student's full month's attendance for all subjects to update
  router.get('/api/att/fetchstudents/:id/:month',authenticateJwt,async(req,res)=>{
    try{

        const role=req.header.role
        if(role!=="admin"){
          res.status(401).json({msg:"NOT AUTHORIZED"});
          return  
        }

        let {id,month}=req.params

        const users= await oper.studentsmodel.find(
            {               
              "_id":id,
             "attendance.months.month":month
        
            }
        );
            // console.log(users);
        
            const filteredUsers = users.map(user => {
              const filteredAttendance = [];
            
              for (const attendance of user.attendance) {
                const matchingMonths = [];
                if(attendance.subjectstatus==1){
                  for (const monthData of attendance.months) {
                    if (monthData.month === month) {
                      matchingMonths.push(monthData);
                    }
                  }
                }
                
            
                if (matchingMonths.length > 0) {
                  filteredAttendance.push({
                    subjectname: attendance.subjectname,
                    subjectstatus: attendance.subjectstatus,
                    months: matchingMonths
                  });
                }
              }
            
              return {
                _id: user._id,
                name: user.name,
                classname: user.classname,
                attendance: filteredAttendance
              };
            });
        


    console.log(filteredUsers);

    res.status(201).json(filteredUsers);
      

    }
    catch (err) {
        console.log(err);
        res.status(500).json({msg:"Server Error"});
    }
})

  // updates attendance for a specific day for all subjects
  router.put('/api/att/fetchupdatestudents/:id',authenticateJwt,async(req,res)=>{
    try {

        const role=req.header.role
        if(role!=="admin"){
          res.status(401).json({msg:"NOT AUTHORIZED"});
          return
        }

        let {month,day,subject,year}=req.body
        let {id}=req.params
        if (!month || !day || !subject || !id) {  
          res.status(401).json({msg:"Please fill all fields!!!"});
          return
        } 
    
        for(const sub of subject)
        {
          await oper.studentsmodel.updateOne(
            {
                _id: id,
                "attendance": {
                    $elemMatch: {
                        "subjectname": sub.subjectname,

                    }
                }
            },
            {
                $set: {
                    "attendance.$.months.$[elem].days.$[day].present":sub.value,
                }
            }, {
            arrayFilters: [{ 
              "elem.month": month,
              "elem.year":year,
            },{
              "day.day":day.toString()
            }
            ]
        }
        ) 
          
        }
          
      

      res.status(201).json({msg:"Attendance Updated"});
    }
    catch (e) {
      console.log(e);
      res.status(500).json({msg:"Server Error"});
    }

})

//TEACHER Routes

  //TEACHER ATTENDANCE FORMS//
//fetches all student's attendance of a specific class of that subject for the current day
router.get("/api/att/teacherstudentdetails/:classname/:subjectcode", authenticateJwt,async (req, res) => {
  try {

      const role=req.header.role
      if(role!=="teacher"){
        res.status(401).json({msg:"NOT AUTHORIZED"});
        return
      }
  
  
      let { classname, subjectcode} = req.params;
  
  
      const currentdate = new Date();
      const currentmonth = currentdate.toLocaleString("default", { month: "long" });
      const currentday=currentdate.getDate();
      const currentyear=currentdate.getFullYear()
  
      const users = await oper.studentsmodel.find(
          {
              // "marks.subjectname": subjectname,
              "attendance": {
                  $elemMatch: {
                      subjectname: subjectcode,
                      subjectstatus: "1",
                     
                  }
              },
              classname: classname
              // "marks.months.month": month
          },
          {
              "_id": 1,
              "name": 1,
              "classname": 1,
              "attendance.$": 1
          }
  
      );
  
      
  
      const filteredUsers=users.map(user=>{
        const filteredAttendance = [];
  
        for(const userattendance of user.attendance)
        {
          const matchedMonths = [];
          
         
          for(const monthnumber of userattendance.months)
          {
  
            const matcheddates=[]
            if(monthnumber.month==currentmonth && monthnumber.year==currentyear)
            {
             
             for(let monthday of monthnumber.days){
             if(monthday.day==currentday)
             {
             matcheddates.push(monthday);
             matchedMonths.push({
              month:monthnumber.month,
              year:monthnumber.year,
              days:matcheddates
             })
             }
             }
            }
  
            if(matcheddates.length>0){
              filteredAttendance.push({
                subjectname:userattendance.subjectname,
                subjectstatus:userattendance.subjectstatus,
                months:matchedMonths
              })
            }
          }
  
          if(filteredAttendance==null){
            return [];
          }
          else{
          return {
            _id: user._id,
            name: user.name,
            classname: user.classname,
            attendance: filteredAttendance
          };
        }
        }
      
      });
      
      res.status(201).json(filteredUsers);
    
  } catch (err) {
      console.log(err);
      res.status(500).json({msg:"Server Error"});
  }
  });
  
  //updates attendance for all students of that class of that subject for the current day
  router.put("/api/att/teacherstudentdetailsupdate", authenticateJwt,async (req, res) => {
    try {

    const role=req.header.role
    if(role!=="teacher"){
      res.status(401).json({msg:"NOT AUTHORIZED"});
      return
    }  
  let { students,subjectname } = req.body
  
    const currentdate = new Date();
    const currentmonth = currentdate.toLocaleString("default", { month: "long" });
    const currentday=currentdate.getDate();
    const currentyear=currentdate.getFullYear()
   
      for(const element of students){

          let check=''        
          if(element[1]=="P")
            check='P';
          else 
            check='Unknown';
    
          await oper.studentsmodel.updateOne(
              {
                  _id: element[0],
                  "attendance": {
                      $elemMatch: {
                          "subjectname": subjectname,

                      }
                  }
              },
              {
                  $set: {
                      "attendance.$.months.$[elem].days.$[day].present":check,
                  }
              }, {
              arrayFilters: [{ 
                "elem.month": currentmonth,
                "elem.year":currentyear,
                },{
                "day.day":currentday.toString()
                }
              ]
          }
          ) 
          
            
      }
          
        res.status(201).json({msg:'Attendance Updated'});
    }
    catch (e) {
        console.log(e);
        res.json({success:false,"message":"Server Error"});
    }
  
  
  })
  


 

module.exports=router;