
const express = require("express");
const pool = require("../config/db");
const {
    verifyToken,
    allowRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken, allowRoles("STORE_OWNER"));

// Store owner's dashboard
router.get("/dashboard", async (req, res) => {
    try {
        const [stores] = await pool.execute(
            `SELECT
                s.id,
                s.name,
                ROUND(AVG(r.rating), 2) AS averageRating,
                COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id, s.name`,
            [req.user.id]
        );

        const [ratings] = await pool.execute(
            `SELECT
                u.name AS userName,
                u.email AS userEmail,
                s.name AS storeName,
                r.rating,
                r.updated_at AS ratedAt
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             JOIN stores s ON r.store_id = s.id
             WHERE s.owner_id = ?
             ORDER BY r.updated_at DESC`,
            [req.user.id]
        );

        res.json({
            stores,
            ratings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch owner dashboard"
        });
    }
});

module.exports = router;
