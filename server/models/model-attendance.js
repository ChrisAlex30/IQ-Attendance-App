const mongoose=require('mongoose')

mongoose.connect(
    process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/attendanceApp",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const adminschema = new mongoose.Schema({
    name: String,
    password: String
  });

  const teacherschema = new mongoose.Schema({
    name: String,
    password: String,
    Subjectcode: String,
  });  

  const studentschema = new mongoose.Schema({
    name: String,
    classname: String,
    DOJ: Date,
    Subject: String,
    status: String,
    attendance: [
      {
        subjectname: String,
        subjectstatus: String,
        months: [
          {
            month: String,
            year:String,
            days: [
              {
                day: String,
                present: String,
              
              },
            ],
          },
        ],
      },
    ],
  });


  
// mongoose.set('debug', true);
module.exports.adminmodel = mongoose.model("adminmodel", adminschema);


module.exports.teachersmodel = mongoose.model("teachersmodel", teacherschema);


module.exports.studentsmodel = mongoose.model("studentsmodel", studentschema);
