import { catchAsyncError} from "../middleware/catchAsyncError.middleware.js"
import {User} from "../model/user.model.js"
import bcrypt from 'bcryptjs'
import {generateJWTToken} from '../utils/jwtToken.js'
import { v2 as cloudinary} from 'cloudinary'

export const signup = catchAsyncError(async (req,res,next)=>{
 const {fullName ,email,password } = req.body;
 console.log(fullName,email,password)
 if(!fullName || !email || !password){
    return res.status(400).json({
        success:false,
        message:"Please provide all required fields."
    })
 }
 const emaiRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if(!emaiRegex.test(email)){
    return res.status(400).json({
        success:false,
        message:"Invalida email format."
    });
}
if(password.length < 6){
       return res.status(400).json({
        success:false,
        message:"password must be at least 6 characters long."
    });
}

const isEmailAlreadyUsed = await User.findOne({email});
 if(isEmailAlreadyUsed){
    return res.status(400).json({
        success:false,
        message:"email already exists."
    });
 }
const hashedPassword = await bcrypt.hash(password,10)
const user = await  User.create({
    fullName,
    email,
    password:hashedPassword,
    avatar:{
        public_id:"",
        secure_url:""
    }
});
console.log(user)
generateJWTToken(user, "User registered successfully", 201, res);
});

export const Signin = catchAsyncError(async (req,res,next)=>{
   const {email,password} = req.body;
   if(!email || !password){
    return res.status(400).json({
        success:true,
        message:"Please provide email and password"
    });
   }
 const emaiRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if(!emaiRegex.test(email)){
    return res.status(400).json({
        success:false,
        message:"Invalida email format."
    });
}
const user = await User.findOne({email});
if(!user){
    return res.status(400).json({
        success:false,
        message:"Invalid Credentials."
    });
}
const isPasswordMatched = await bcrypt.compare(password,user.password);
if(!isPasswordMatched){
    return res.status(400).json({
        success:false,
        message:"Invalid Credentials."
    });
}
generateJWTToken(user,"User logged in Successfully",200,res);
})

export const signout = catchAsyncError(async (req,res,next)=>{
   res.status(200).cookie("token","" ,{
    maxAge :0,
    httpOnly:true,
    sameSite:None,
    secure:true,
   }).json({
    sucess:true,
    message:"User logged out successfully."
   });
})

export const getuser = catchAsyncError(async (req, res, next) => {
     const user = req.user
     res.status(200).json({
      success:true,
      user
     })
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { fullName, email } = req.body;

  if (!fullName || !email || fullName.trim() === "" || email.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "fullName and email can't be empty."
    });
  }


  const avatar = req?.files?.avatar;
  let cloudinaryResponse = null;

  if (avatar) {
    try {
      const oldAvatarPublicId = req.user?.avatar?.public_id;

      if (oldAvatarPublicId) {
        await cloudinary.uploader.destroy(oldAvatarPublicId);
      }

      cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "CHATAPP"
        }
      );


    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload avatar"
      });
    }
  }

  let data = {
    fullName,
    email
  };

  if (cloudinaryResponse) {
    data.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user
  });
});