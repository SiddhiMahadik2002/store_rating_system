const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        if (!name || name.trim().length < 20 || name.trim().length > 60) {
            return res.status(400).json({
                message: "Name should be between 20 and 60 chars"
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email"
            });
        }

        if (!address || address.length > 400) {
            return res.status(400).json({
                message: "Address should be at most 400 characters"
            });
        }

        if (
            !password ||
            password.length < 8 ||
            password.length > 16 ||
            !/[A-Z]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            return res.status(400).json({
                message: "Password should be 8-16 characters with an uppercase letter and special character"
            });
        }

        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, 'USER')`,
            [name.trim(), email.trim(), hashedPassword, address.trim()]
        );

        res.status(201).json({
            message: "Registration successful"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Registration failed"
        });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [users] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const jwt = require("jsonwebtoken");

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

module.exports = router;