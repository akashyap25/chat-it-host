const asyncWrapper = require("../middleWare/asyncWrapper");
const UserModel = require("../model/UserModel");
const sendJwtToken = require("../appUtills/jwtToken");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../appUtills/error");
const userModel = require("../model/UserModel");
const bcrypt = require("bcryptjs");
 
 

//>>>>>>get all search user expect this user <<<<<<<<<
//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public


exports.allSearchUser = asyncWrapper(async (req, res) => {
  // Get the search keyword from the query parameter, if present
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: { $regex: req.query.search, $options: "i" }, // search by name (case-insensitive)
          },
          {
            email: { $regex: req.query.search, $options: "i" }, // search by email (case-insensitive)
          },
        ],
      }
    : {};

  // Find all users that match the search criteria, excluding[$ne: not equals] the currently logged-in user (req.user)
  const users = await UserModel.find(keyword).find({
    _id: { $ne: req.user._id },
  });

  // Send the list of matching users in the response
  res.send(users);
});


// >>>>> Create User Api <<<<<<<<< 
//@description     Register new user
//@route           POST /api/user/
//@access          Public
exports.registerUser = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all required fields", 400));
  }

  const userExists = await UserModel.findOne({ email });

  if (userExists) {
    return next(new ErrorHandler("User already exists", 400));
  }

  // Hash and salt the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    sendJwtToken(user, 201, res);
  } else {
    return next(new ErrorHandler("Bad request", 400));
  }
});

// >>>>>> login user <<<<<<<<
//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
exports.loginController = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("Email received:", email);

  if (!email || !password) {
    console.log("Invalid email or password (missing data)");
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) {
    console.log("User not found");
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  console.log("User found in the database:", user);

  const isPasswordCorrect = user.comparePassword(password);

  console.log("Manually compared password result:", isPasswordCorrect);

  if (isPasswordCorrect) {
    sendJwtToken(user, 201, res);
  } else {
    console.log("Invalid email or password (incorrect password)");
    return next(new ErrorHandler("Invalid email or password", 401));
  }
});





exports.logoutUser = asyncWrapper(async (req , res) =>{

   

   const options = {
     expires: new Date(
       Date.now()
     ), 
     httpOnly: true,
   };

   res.status(200).cookie("token", null, options).json({
     success: true,
     message : "Loged out successfully"
   });


})



exports.loadUser = asyncWrapper (async( req , res) =>{


  const user = await  userModel.findById(req.user._id);

   res.send(user);
})