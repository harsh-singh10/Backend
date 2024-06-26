import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import express from "express";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken"

 

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
         const user = await User.findById(userId);
         const accessToken = user.generateAccessToken()
         const refreshToken = user.generateRefreshToken()

         user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave:false })

        return {accessToken , refreshToken}


    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating token")
    }
}





// register user 

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

    // console.log(" I am avatarr ",avatar);


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


// login user 

const loginUser = asyncHandler( async(req,res)=>{

    // req.body -> data
    // username or email 
    // find the user 
    // password check
    // access and refresh token 
    //send cookies

    const {username , email, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")    
    // }


     const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404 , "User doesnot exists")
    }

    const isPasswordValid = await user.isPasswordCorrcet(password)

    if(!isPasswordValid){
        throw new ApiError(401 , "Password is incorrect")
    }

    const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id)


    const loggedInUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly:true,
        secure:true
    }
    

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200 , 
            {
               user: loggedInUser , accessToken,refreshToken 
            }
            , 
            "Successfully loged in"
        )
    )

} )


// log out user 

const logOutUser = asyncHandler( async(req, res ) =>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
            
        }, {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200 ,
        {},
        "User logged out  successfuly"

    )
    )

})


// refresh access token 

const refreshAccessToken = asyncHandler( async (req,res)=>{

    // collect refresh token 
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorize request")
    }
try {
    
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401 , "Envalid refresh token ")
        }
    
        if(incommingRefreshToken !== user.refreshToken){
            throw new ApiError(401 , "refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await  generateAccessTokenAndRefreshToken(user._id)
    
         return res
         .status(200)
         .cookie("accessToken" , accessToken , options)
         .cookie("refreshToken" ,newRefreshToken , options)
         .json(
            new ApiResponse( 
                200,
                {accessToken , refreshToken:newRefreshToken},
                "access token refreshed"
            )
         )
} catch (error) {
    throw new ApiError(401 , error?.message || "Invalid refresh token ")
}


} )




// change password 

const changeCurrentPassword = asyncHandler(async (req,res)=>{

    const {oldPassword , newPassword } = req.body 

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect =  user.isPasswordCorrcet(oldPassword)

    if(!isPasswordCorrect){
        new ApiError(400 , "Invalid Old Password ")

    }

    user.password = newPassword ;
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200 , {} , "Password Changed successfuly"))

})

// current user 

const getCurrentUser = asyncHandler(async (req,res)=>{

    return res
    .status(200)
    .json(new ApiResponse(200 , req.user,"user fected"))

})


const updateUserAccountDetails = asyncHandler(async(req,res)=>{
    const { fullname , email  } = req.body

    if(!fullname || email){
        new ApiError(400 , "Full name and email is required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new:true }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user, "Account details updated successfully"))

})


// update avatar 

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path 

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar field is required ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")


    return res 
    .status(200)
    .json( new ApiResponse(200 , user , "This is updated avatar"))


})

// update coverImage

const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path 

    if(!coverImageLocalPath){
        throw new ApiError(400, "coverImage field is required ")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading coverImage ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")


    return res 
    .status(200)
    .json( new ApiResponse(200 , user , "This is updated coverImage"))


})


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
    }