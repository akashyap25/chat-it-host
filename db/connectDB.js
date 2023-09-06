const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Get the current working directory of the script
const currentDirectory = process.cwd();

// Construct the path to the .env file relative to the current directory
const dotenvPath = path.join(currentDirectory, ".env");

// Check if the .env file exists
if (!fs.existsSync(dotenvPath)) {
  console.error(`The .env file does not exist at ${dotenvPath}`);
  process.exit(1); // Exit the script with an error code
}

// Load environment variables from the .env file
require("dotenv").config({ path: dotenvPath });

function connectDB() {
  //console.log("Current working directory:", currentDirectory);
  //console.log("Attempting to connect to MongoDB using DB_LINK:", process.env.DB_LINK);

  mongoose
    .connect(process.env.DB_LINK)
    .then(() => console.log("DB_CONNECTED"))
    .catch((err) => console.log(`Error: ${err.message}`));
}

module.exports = connectDB;
