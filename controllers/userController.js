const { error } = require("console");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
// const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWTSECRETCODE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      data: {
        length: users.length,
        users,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
  // next();
};
exports.signup = async (req, res, next) => {
  try {
    const { name, photo, email, phone, password, role } = req.body;
    const newUser = await User.create({
      name,
      photo,
      email,
      phone,
      password,
      role,
    });
    if (!newUser) {
      throw new Error("user is not created please try again");
    }
    // newUser.password = await bcrypt.hash(newUser.password, 12);

    const token = signToken(newUser._id);

    res.status(200).json({
      data: { message: "success", token, user: newUser },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !password) {
      throw new Error("Please provide phone number and password");
    }

    if (!phone && !password) {
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ $or: [{ email }, { phone }] }).select(
      "+password"
    );

    if (!user || !(await user.checkPassword(password, user.password))) {
      throw new Error(
        "Please provide valid email or phone number and password"
      );
    }
    const token = signToken(user._id);

    res.status(200).json({
      data: {
        message: "success",
        token,
        user: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw new Error("You are not logged in. Please login to get access it.");
    }
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWTSECRETCODE
    );
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("User belongs to this id does no longer exist");
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
  // next();
};

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw new Error("You dont have permission to perform this action.");
      }
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
    next();
  };
};

exports.updateMe = async (req, res, next) => {
  try {
    const filteredBody = filterObj(req.body, "name", "photo");
    if (req.file) filteredBody.photo = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true,
    });
    // await user.save();
    res.status(200).json({
      data: {
        message: "success",
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

exports.getme = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      data: {
        message: "success",
        user: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};
exports.deleteme = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(204).json({
      data: {
        message: "success",
        user: null,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    // const user = await User.findById(req.user.id);
    // if (user.role === "user") {
    //   throw new Error("You dont have a permission to perform this action.");
    // }
    // if (user.role === "admin") {
    const filterBody = filterObj(req.body, "name", "photo");

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filterBody,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      data: {
        message: "success",
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      data: {
        message: "success",
        user: null,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};
