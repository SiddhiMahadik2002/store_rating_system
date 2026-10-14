const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken, allowRoles("ADMIN"));


router.get("/dashboard", async (req, res) => {
    try {
        const [[users]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
        const [[stores]] = await pool.query("SELECT COUNT(*) AS totalStores FROM stores");
        const [[ratings]] = await pool.query("SELECT COUNT(*) AS totalRatings FROM ratings");

        res.json({
            totalUsers: users.totalUsers,
            totalStores: stores.totalStores,
            totalRatings: ratings.totalRatings
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load dashboard" });
    }
});

// List users with filters and sorting
router.get("/users", async (req, res) => {
    try {
        const { name = "", email = "", address = "", role = "", sortBy = "name", order = "ASC" } = req.query;

        const allowedSort = ["name", "email", "address", "role"];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : "name";
        const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        let sql = `SELECT id, name, email, address, role FROM users
                   WHERE name LIKE ? AND email LIKE ? AND address LIKE ?`;
        const params = [`%${name}%`, `%${email}%`, `%${address}%`];

        if (role) {
            sql += " AND role = ?";
            params.push(role);
        }

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [users] = await pool.execute(sql, params);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to load users" });
    }
});

// List stores with overall ratings and filters
router.get("/stores", async (req, res) => {
    try {
        const { name = "", email = "", address = "", sortBy = "name", order = "ASC" } = req.query;

        const allowedSort = ["name", "email", "address"];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : "name";
        const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        const [stores] = await pool.execute(
            `SELECT s.id, s.name, s.email, s.address,
                    ROUND(AVG(r.rating), 2) AS averageRating
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.name LIKE ? AND s.email LIKE ? AND s.address LIKE ?
             GROUP BY s.id, s.name, s.email, s.address
             ORDER BY ${sortColumn} ${sortOrder}`,
            [`%${name}%`, `%${email}%`, `%${address}%`]
        );

        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: "Failed to load stores" });
    }
});

// Add a normal user or another admin
router.post("/users", async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (!name || name.trim().length < 20 || name.trim().length > 60 ||
            !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !address || address.length > 400 ||
            !password || password.length < 8 || password.length > 16 ||
            !/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password) ||
            !["ADMIN", "USER", "STORE_OWNER"].includes(role)) {
            return res.status(400).json({ message: "Invalid user details" });
        }

        const [existing] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email.trim()]
        );

        if (existing.length) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
            [name.trim(), email.trim(), hashedPassword, address.trim(), role]
        );

        res.status(201).json({
            message: "User created successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create user" });
    }
});

// Add a store and assign its owner
router.post("/stores", async (req, res) => {
    try {
        const { name, email, address, ownerId } = req.body;

        if (!name?.trim() || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !address?.trim() || address.length > 400 || !ownerId) {
            return res.status(400).json({ message: "Invalid store details" });
        }

        const [owners] = await pool.execute(
            "SELECT id FROM users WHERE id = ? AND role = 'STORE_OWNER'",
            [ownerId]
        );

        if (!owners.length) {
            return res.status(400).json({ message: "Valid store owner required" });
        }

        const [result] = await pool.execute(
            "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
            [name.trim(), email.trim(), address.trim(), ownerId]
        );

        res.status(201).json({
            message: "Store created successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create store" });
    }
});
router.get("/users/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const [users] = await pool.execute(
            `SELECT id, name, email, address, role, created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const [ratings] = await pool.execute(
            `SELECT
                s.id AS storeId,
                s.name AS storeName,
                r.rating,
                r.updated_at AS ratedAt
             FROM ratings r
             JOIN stores s ON s.id = r.store_id
             WHERE r.user_id = ?
             ORDER BY s.name ASC`,
            [userId]
        );

        res.json({
            user: users[0],
            ratings: ratings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch user details"
        });
    }
});
router.get("/users/:id", async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const [users] = await pool.execute(
            `SELECT id, name, email, address, role, created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const [ratings] = await pool.execute(
            `SELECT
                s.id AS storeId,
                s.name AS storeName,
                r.rating,
                r.updated_at AS ratedAt
             FROM ratings r
             JOIN stores s ON s.id = r.store_id
             WHERE r.user_id = ?
             ORDER BY s.name ASC`,
            [userId]
        );

        res.json({
            user: users[0],
            ratings: ratings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch user details"
        });
    }
});

module.exports = router;