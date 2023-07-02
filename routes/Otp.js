import express from "express"
import { compareOtp, getOtp } from "../controllers/Otp.js";

const router = express.Router()

router.post("/getOtp",getOtp)
router.post("/compareOtp",compareOtp)

export default router;