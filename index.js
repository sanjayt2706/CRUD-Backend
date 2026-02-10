// Import Express framework
// Express helps us build web servers and APIs
const express = require("express");

// Import File System module
// fs allows us to read/write files (JSON file acts like a database)
const fs = require("fs");

// Load existing users data from JSON file
// This data is read once when the server starts
// const users = require("./MOCK_DATA.json");

// Create Express application
const app = express();

// Define port number
const PORT = 8000;

const mongoose = require("mongoose");

//Connection

mongoose.connect('mongodb://127.0.0.1:27017/MyApp1')
.then(()=>console.log('MongoDB Connected'))
.catch((err)=>console.log('mongoError', err));

//Schema

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    jobTitle:{
        type: String,
    },
    gender:{
        type: String,
    }
},
{timestamps:true});

const User = mongoose.model("user", userSchema);

/* ======================
   MIDDLEWARE
====================== */

// Middleware to read form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Middleware to read JSON body (application/json)
// Without this, req.body will be undefined
app.use(express.json());

/* ======================
   ROUTES
====================== */

/*
  GET /users
  Sends HTML list of user names (browser-friendly)
*/
app.get("/users", async(req, res) => {
    const allDbUsers = await User.find({});
    const html = `
    <ul>
      ${allDbUsers.map(user => `<li>${user.firstName} - ${user.email}</li>`).join("")}
    </ul>
  `;
    res.send(html);
});

/*
  GET /api/users
  Returns all users as JSON
*/
app.get("/api/users", async(req, res) => {
    const allDbUsers = await User.find({});
    res.setHeader("X-MyName", "Piyush Garg");
    return res.json(allDbUsers);
});

/*
  POST /api/users
  Creates a new user and saves it into MOCK_DATA.json
*/
app.post("/api/users", async (req, res) => {

    // Step 1: Store request body in a variable
    // req.body contains data sent from client (Postman / frontend)
    const body = req.body;
    if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        return res.status(400).json({ msg: 'All fields are required' });
    }
    const result = await User.create({
        firstName:body.first_name,
        lastName:body.last_name,
        email:body.email,
        gender: body.gender,
        jobTitle: body.job_title,
    });
    console.log(result)
    return res.status(201).json({msg:"Success"})

    // Step 2: Push new user into users array
    // Spread operator copies all fields from body
    // id is generated automatically
    });


/*
  GET /api/users/:id
  Fetch single user by ID
*/
app.route("/api/users/:id")
.get(async (req, res) => {
    const user = await User.findById(req.params.id);
    // If user not found
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Return user
    res.json(user);
})

.patch(async (req,res) =>{
    await User.findByIdAndUpdate(req.params.id, {lastName:"Changed"});
    return res.json({status:"Success"})
})

.delete(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return res.json({ status: "Success" });
});
/* ======================
   SERVER START
====================== */

// Start server on defined port
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
