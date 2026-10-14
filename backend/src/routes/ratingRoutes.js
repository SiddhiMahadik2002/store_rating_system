
const express = require("express");
const pool = require("../config/db");
const {
    verifyToken,
    allowRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken, allowRoles("USER"));

// View and search all stores
router.get("/stores", async (req, res) => {
    try {
        const { name = "", address = "" } = req.query;

        const [stores] = await pool.execute(
            `SELECT
                s.id,
                s.name,
                s.address,
                ROUND(AVG(allRatings.rating), 2) AS overallRating,
                MAX(myRating.rating) AS myRating
             FROM stores s
             LEFT JOIN ratings allRatings
                ON s.id = allRatings.store_id
             LEFT JOIN ratings myRating
                ON s.id = myRating.store_id
                AND myRating.user_id = ?
             WHERE s.name LIKE ?
                AND s.address LIKE ?
             GROUP BY s.id, s.name, s.address
             ORDER BY s.name ASC`,
            [req.user.id, `%${name}%`, `%${address}%`]
        );

        res.json(stores);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch stores"
        });
    }
});

// Submit or update rating
router.post("/stores/:storeId/rating", async (req, res) => {
    try {
        const storeId = Number(req.params.storeId);
        const { rating } = req.body;

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                message: "Invalid store ID"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be an integer from 1 to 5"
            });
        }

        const [stores] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (!stores.length) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        await pool.execute(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
                rating = VALUES(rating)`,
            [req.user.id, storeId, rating]
        );

        res.json({
            message: "Rating submitted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to submit rating"
        });
    }
});

module.exports = router;
