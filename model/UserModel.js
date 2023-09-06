const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please Enter Your Name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,

      //validate: [validator.isEmail, "Please Enter a valid Email"],  validator used fr verfiy email , pass, isNumaric and return treur and false "i made a email velidator already in clintSide"
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [8, "Password should have more than 4 characters"],
      select: false, // this will make sure password is sended with data to anyone not even admin when he req for user data
    },
    pic: {
      type: "String",
      //required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true,
  
  }
);

// " it will run berfore Schema Updates" >>>>Password hash<<<<
userSchema.pre("save", async function (next) {
  // without this if statement password hashed each time when data is modified
  if (!this.isModified('password')) {
    console.log('Password not modified. Skipping hashing.');
    next();
  } else {
    // Hash the password only if it's modified or when a new user is created
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Password hashed successfully.');
    next();
  }
});

//>>>>>JWT Token method<<<<<<

userSchema.methods.getJwtToken = function () {
  //  payLoad : => Token expiry, userId, or Secret key, along with header that has algo name and type of JWT
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  console.log('JWT Token generated:', token);
  return token;
};

// >>>>>>  Compare Password method  <<<<<<<<
userSchema.methods.comparePassword = async function (password) {
  console.log('Password received for comparison:', password);
  console.log('Hashed Password from DB:', this.password);
  
  const isPasswordCorrect = await bcrypt.compare(password, this.password);
  console.log('Is password correct?', isPasswordCorrect);
  
  return isPasswordCorrect;
};





const userModel = mongoose.model("userModel", userSchema);

module.exports = userModel;
