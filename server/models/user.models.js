const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is required"],
    },
    email: {
      type: String,
      unqiue: [true, "email should be unique"],
      required: [true, "email is required"],
    },
    password: {
      type: String,
      minlength: [8, "password should be greater than or equal to 8"],
      required: [true, "password is required"],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
