import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import express from "express";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";



const registerUser = asyncHandler( async (req,res)=>{
// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res

  const {email ,fullname,username,password} = req.body;
 //   console.log("email :" , email);

  // ye code v sahi hai per ek ek kr ke bhut sara if else lag jaaye ga 
//   if(fullname === ""){
//     throw new ApiError(404 , "Full name is required")
//   }  

    if ([fullname,email,password,username].some((field)=> field?.trim() === "" ) )
     {
        throw new ApiError(404 , "All fields are required")
    }


// fetching data from backend 

    const existingUser = await User.findOne({
        $or:[{username},{email}]
    });

// checking if user already exists 

    if(existingUser){

        throw new ApiError(408,"User with this email already exists")
    }

    // fectching files data from multer {used in router section } using files {provided by multer}

   const avatarLocalPath = req.files?.avatar[0]?.path
   // const coverImageLocalPath = req.files?.coverImage[0]?.path




let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}


   
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is require ")
    }

     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
        throw new ApiError(400,"Avatar file is require ")
     }

    const user =  await User.create({
        fullname,
        password,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username,
     })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )

     if(!createdUser){
        throw new ApiError(500 , "Some thing went wrong while creating user")
     }

     res.status(200).json(
        new ApiResponse(200,createdUser,"User registerd successfuly")
     )


} )


export {registerUser}