import asyncHandler from "../utils/asyncHandler.js";
import Joi from "joi";
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

const registerUser = asyncHandler(async (req, res) => {
    // Step 01 - get user details from frontend
    const { fullName, username, email, password} = req.body;
    console.log(fullName, username, email, password);

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
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Step 05 - upload those images on cloudinary 


    // Step 06 - create user object = then create an entry in mongodb
    // Step 07 - remove password and refresh token field from response 
    // Step 08 - check for user creation
    // Step 09 - return response

})

export { registerUser };