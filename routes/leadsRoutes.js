const express = require("express");
const router = express.Router();
const { getFilteredLeads, updateLeadField } = require("../controllers/leadsController");

router.get("/", getFilteredLeads);
router.patch("/:key", updateLeadField);

module.exports = router;
