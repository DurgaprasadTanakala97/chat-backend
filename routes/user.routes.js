import express from 'express';
import {getuser,Signin,signup,signout,updateProfile} from "../controller/user.controller.js";
import {isAuthenticated } from "../middleware/auth.middleware.js"
const router = express.Router();
router.post('/sign-up',signup);
router.post('/sign-in',Signin);
router.get('/sign-out' ,isAuthenticated,signout);
router.get('/me',isAuthenticated,getuser);
router.put('/update-profile',isAuthenticated,updateProfile);

export default router;