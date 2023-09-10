import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    min: [8, "Please Enter the name with more than 8 letters"],
  },
  email: {
    type: String,
    unique: [true, "Please Enter Unique Email Address"],
    validate: [validator.isEmail, "Please Enter Valid Email Address"],
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  password: {
    type: String,
    require: [true, "Please Enter the password"],
    min: 8,
  },
  confirmPassword: {
    type: String,
    require: [true, "Please Enter the password"],
    min: 8,
    validate: {
      //This only works on CREATE and  Save
      validator: function (el) {
        return el === this.password; //abc === abc
      },
      message: "Password are not the same",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  //   this.password = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
export default User;
