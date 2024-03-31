import asyncHandler from "../utils/asyncHandler.js";
import Joi from "joi";
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';


const registerUser = asyncHandler(async (req, res) => {
    // Step 01 - get user details from frontend
    const { fullName, username, email, password} = req.body;

    // Step 02 - check validation - not empty and the syntax matching as well
    const schema = Joi.object({
        fullName: Joi.string().required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    // Validate req.body against the schema
    const { error, value } = schema.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details);
    }

    // Step 03 - check if the user already exist through email or username 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409,"Username or Email already exists")
    }

    // Step 04 - check for images and check for the compulsory images like avatar in the model
    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    } 

    let coverImageLocalPath;
    
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Step 05 - upload those images on cloudinary 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const cover = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
    }

    // Step 06 - create user object = then create an entry in mongodb
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: cover?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    
    // Step 07 - remove password and refresh token field from response 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Step 08 - check for user creation
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // Step 09 - return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export { registerUser };