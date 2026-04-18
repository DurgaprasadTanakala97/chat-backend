import { catchAsyncError } from "../middleware/catchAsyncError.middleware.js";
import { User } from "../model/user.model.js";
import { Message } from "../model/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId } from "../utils/socket.js";
import { io } from "../utils/socket.js"; 

// ✅ Get All Users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  
  const filteredUsers = await User.find({
    _id: { $ne: userId },
  }).select("-password");

  res.status(200).json({
    success: true,
    users: filteredUsers,
  });
});

// ✅ Get Messages
// export const getMessages = catchAsyncError(async (req, res, next) => {
//   const receiverId = req.params.id;
//   const myId = req.user._id;

//   if (!receiverId) {
//     return res.status(400).json({
//       success: false,
//       message: "Receiver Id Invalid",
//     });
//   }

//   const messages = await Message.find({
//     $or: [
//       { senderId: myId, receiverId: receiverId },
//       { senderId: receiverId, receiverId: myId },
//     ],
//   }).sort({ createdAt: 1 });

//   res.status(200).json({
//     success: true,
//     messages,
//   });
// });

import mongoose from "mongoose";

export const getMessages = catchAsyncError(async (req, res, next) => {
  const receiverId = req.params.id;
  const myId = req.user._id;

  // ✅ Prevent crash
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid receiver ID",
    });
  }

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId },
      { senderId: receiverId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    messages,
  });
});

// ✅ Send Message
export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { text } = req.body;
  const media = req?.files?.media;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  if (!receiverId) {
    return res.status(400).json({
      success: false,
      message: "Receiver Id Invalid",
    });
  }

  const sanitizedText = text?.trim() || "";

  if (!sanitizedText && !media) {
    return res.status(400).json({
      success: false,
      message: "Cannot send empty message.",
    });
  }

  let mediaUrl = "";

  // ✅ Upload media to Cloudinary
  if (media) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(
        media.tempFilePath,
        {
          resource_type: "auto",
          folder: "CHAT_APP_MEDIA",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        }
      );

      mediaUrl = uploadResponse.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to upload media. Please try again later.",
      });
    }
  }

  // ✅ Save message
  const newMessage = await Message.create({
    senderId,
    receiverId,
    text: sanitizedText,
    media: mediaUrl,
  });

  // ✅ Emit socket event
  const receiverSocketId = getReceiverSocketId(receiverId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res.status(201).json({
    success: true,
    message: newMessage,
  });
});