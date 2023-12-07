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
        return res.sendStatus(403);
         }  
      else{
        console.log(username);
        // if(Object.keys(username).length>0)
        // req.headers.cId=username.username.substring(0,3)
      //   { username: 'alexSir', iat: 1691722729, exp: 1691726329 }
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

//LOGIN
router.post("/api/att/login", async (req, res) => {

      try{       

        const { name, password } = req.body;

        if(!name || !password){          
          res.status(401).json({ msg: "Plz Fill All Fields" });
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

//ADD STUDENT ADMIN  
router.post("/api/att/addstudents", authenticateJwt,async function (req, res) {
  try {
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
        res.status(401).send({msg:"Please fill all fields!!!"});
        return
    } 

    const role=req.header.role
    if(role!=="admin"){
      res.status(401).json({msg:"NOT AUTHORIZED"});
      return
    }

    
    const currentdate = new Date(DOJ);  
    const getmonth = currentdate.getMonth();  
    const getyear = currentdate.getFullYear();
    let months = []; 
    let attendance = [];
    let strarr = Subject.split(",");
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
      Subject,
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

        const stu = await oper.studentsmodel.find({ status: "1" });
        res.status(201).json(stu)
    } catch (err) {
        console.log(err);
        res.status(500).json("Server Error");
    }
});
  
//update student  
router.put("/api/att/updatestudent", authenticateJwt,async function (req, res) {
  try {
      let { id, name, classname, DOJ, Subject } = req.body;
      if (
          req.body.id == undefined ||
          req.body.name == undefined ||
          req.body.classname == undefined ||
          req.body.DOJ == undefined ||
          req.body.Subject == undefined ||
          req.body.name == "" ||
          req.body.DOJ == "" ||
          req.body.Subject == ""
      ) {  
        res.status(401).json({msg:"Please fill all fields!!!"});
        return
    } 

    const role=req.header.role
    if(role!=="admin"){
      res.status(401).json({msg:"NOT AUTHORIZED"});
      return
    }
      
        lastchar = Subject.charAt(Subject.length - 1);
        if (lastchar == ",") {
            Subject = Subject.substring(0, Subject.length - 1)
        }
        let strarr = Subject.split(",")
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
                  Subject: Subject
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
  router.get("/api/att/deletedstudents", authenticateJwt,async (req, res) => {
      try {
          const role=req.header.role
          if(role!=="admin"){
            res.status(401).json({msg:"NOT AUTHORIZED"});
            return  
          }
          const users = await oper.studentsmodel.find({ status: "0" });
          res.status(201).json(users);
      } catch (err) {
          console.log(err);
          res.status(500).json({msg:"Server Error"});
      }
  });
  
  
  
  //add deleted   students
  router.put("/api/att/adddeleted", authenticateJwt,async (req, res) => {
      try {

          const role=req.header.role
          if(role!=="admin"){
            res.status(401).json({msg:"NOT AUTHORIZED"});
            return  
          }

          let { studentsIds } = req.body;
          if(studentsIds?.length!==0)  {
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
  


 

module.exports=router;