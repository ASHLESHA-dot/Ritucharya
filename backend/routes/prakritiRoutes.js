const express = require("express");

const router = express.Router();

router.get("/predict", (req, res) => {
    res.json({
        message: "Prakriti route works"
    });
});

module.exports = router;