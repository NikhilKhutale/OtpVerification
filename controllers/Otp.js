import { db } from "../db.js"
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();


let savedOTP = '';
let otpTimeout = null;

const generateOTP = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
    return randomNum.substring(0, 6);
};

const compareOTP = (otpentered, savedOTP) => {
    return otpentered === savedOTP;
};

const setOtpTimeout = () => {
    otpTimeout = setTimeout(() => {
        savedOTP = '';
    }, 5 * 60 * 1000);
};

const sendOTPByEmail = (email, otp, callback) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const messageId = `Message-${Date.now()}@yourdomain.com`;

    const emailTemplate = `
    <html>
      <body>
        <h1>OTP Verification</h1>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Please use this OTP to complete the verification process.</p>
        <p>Thank you!</p>
      </body>
    </html>
  `;

    transporter.sendMail({
        from: `Nikhil Khutale <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: "OTP Verification",
        html: emailTemplate,
        messageId: messageId,
        dsn: {
            id: messageId,
            return: "headers",
            notify: ["failure", "delay", "success"],
            recipient: process.env.EMAIL_USERNAME,
        },
    }, (error, info) => {
        if (error) {
            console.log(error);
            callback(error, null);
        } else {
            clearTimeout(otpTimeout);
            setOtpTimeout();
            callback(null, info);
        }
    });
};

export const getOtp = (req, res) => {
    const { email, isSignup } = req.body

    if (isSignup) {
        const otp = generateOTP();

        savedOTP = otp;

        sendOTPByEmail(email, otp, (error, info) => {
            if (error) {
                return res.status(500).json("Failed to send OTP");
            } else {
                return res.status(200).json("Otp sent successfully");
            }
        });
    } else {

        const q = "SELECT * FROM otpverification WHERE email = ?"

        db.query(q, [email], (err, data) => {
            if (err) return res.json(err)

            if (data.length === 0) return res.status(404).json("User not registered")

            const otp = generateOTP();

            savedOTP = otp;

            sendOTPByEmail(email, otp, (error, info) => {
                if (error) {
                    return res.status(500).json("Failed to send OTP");
                } else {
                    return res.status(200).json("Otp sent successfully");
                }
            });

        })
    }
}


export const compareOtp = (req, res) => {
    const { otpEntered } = req.body

    const otpentered = otpEntered.join('');

    const isOTPValid = compareOTP(otpentered, savedOTP);

    if (isOTPValid) {
        clearTimeout(otpTimeout);
        return res.status(200).json("OTP verification successful");
    } else {
        clearTimeout(otpTimeout);
        return res.status(500).json("OTP does not match!");
    }
}