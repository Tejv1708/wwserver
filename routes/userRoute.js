import express from "express";
import {
  userLogin,
  userSignup,
  protect,
} from "../controllers/authController.js";
import {
  getAllUser,
  getUser,
  deleteMe,
} from "../controllers/userController.js";
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//For Create the User
router.post("/signup", userSignup);

//For Login the User
router.post("/login", userLogin);

//Get all the user
router.get("/all", protect, getAllUser);

//Get A user using id
router.route("/:id").get(protect, getUser).delete(protect, deleteMe);

export default router;
