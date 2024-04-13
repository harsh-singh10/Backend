import { Router } from "express";
import { logOutUser, loginUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middelware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),    
    registerUser
)
 

// login 

router.route("/login").post(loginUser)

// secure route 
router.route("/logout").post( verifyJWT,  logOutUser)
router.route("refresh-token").post(refreshAccessToken)

export default router;