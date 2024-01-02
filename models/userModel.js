const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: Number,
    required: [true, "Please provide a phone number"],
    min: [10, "Must be at least 10, got {VALUE}"],
    max: [10, "Maximum number should be 10, gor {VALUE}"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model("User", userSchema);

module.exports = User;
