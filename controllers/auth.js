import { db } from "../db.js"
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"


export const register = (req, res) => {

    const q = "SELECT * FROM otpverification WHERE phone = ? OR email = ?"
    db.query(q, [req.body.mobileNo, req.body.email], (err, data) => {
        if (err) return res.json("Something went wrong!")
        
        if (data.length) return res.status(409).json("User already existed!")
 
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q = "INSERT INTO otpverification(`fname`,`lname`,`phone`,`role`,`email`,`password`) VALUES (?)"



        const values = [
            req.body.fName,
            req.body.lName,
            req.body.mobileNo,
            'ad12min',
            req.body.email,
            hash
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.json(err)



            const q = "SELECT * FROM otpverification WHERE email = ?"
            db.query(q, [req.body.email], (err, data) => {
                if (err) return res.json("Something went wrong!")
                const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRETE)
                const { password, ...other } = data[0]
                
                res.cookie("access_token", token, {
                    httpOnly: true
                }).status(200).json(other)
            })

        })
    })
}

export const login = (req, res) => {
    
    const q = "SELECT * FROM otpverification WHERE email = ?"

    db.query(q, [req.body.email], (err, data) => {
        if (err) return res.json("Something went wrong!"); 
        if (data.length === 0) return res.status(404).json("User not registered")
        
        if (req.body.email !== data[0].email) return res.status(404).json("Wrong credentials")
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password)

        if (!isPasswordCorrect) return res.status(404).json("Wrong username or password")

        const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRETE)
        
        const { email, key, phone, password, idadmin, ...other } = data[0]

        const maxAge = 24 * 60 * 60 * 1000;

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: true,
            maxAge: maxAge,
        }).status(200).json(other)
    })
}

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true,
    }).status(200).json("User has been logged out.")
}