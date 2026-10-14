require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Store Rating System API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            message: "Backend and MySQL connected successfully",
            database: rows[0].result
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});
app.use("/api/auth", authRoutes);

const {verifyToken, allowRoles} =require("./middleware/authMiddleware");

app.get("/api/admin/test", verifyToken, allowRoles("ADMIN"), (req, res) => {
    res.json({
        message: "Admin access successful"
    });
});
app.use("/api/admin", adminRoutes);
app.use("/api", ratingRoutes);
app.use("/api/owner", ownerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});