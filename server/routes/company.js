const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

// Get company profile
router.get("/", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ company });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ error: "Failed to fetch company profile" });
  }
});

// Update company profile
router.put("/", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Update company data
    Object.assign(company, req.body);
    company.updatedAt = new Date();
    await company.save();

    res.json({
      message: "Company profile updated successfully",
      company,
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ error: "Failed to update company profile" });
  }
});

// Upload company logo
router.post(
  "/logo",
  auth,
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const company = await Company.findOne({ userId: req.user._id });

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Delete old logo if exists
      if (company.logo && company.logo.startsWith("/uploads/")) {
        const oldLogoPath = path.join(__dirname, "..", company.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Update logo path
      // Update logo path (STORE FULL PUBLIC PATH)
      company.logo = `/uploads/${req.file.filename}`;
      company.updatedAt = new Date();
      await company.save();

      res.json({
        message: "Logo uploaded successfully",
        logo: company.logo,
        company,
      });
    } catch (error) {
      console.error("Upload logo error:", error);
      res.status(500).json({ error: "Failed to upload logo" });
    }
  },
  (error, req, res, next) => {
    // Handle multer errors
    res.status(400).json({ error: error.message });
  }
);

// Delete company logo
router.delete("/logo", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (!company.logo) {
      return res.status(400).json({ error: "No logo to delete" });
    }

    // Delete logo file
    if (company.logo.startsWith("/uploads/")) {
      const logoPath = path.join(__dirname, "..", company.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Clear logo field
    company.logo = "";
    company.updatedAt = new Date();
    await company.save();

    res.json({
      message: "Logo deleted successfully",
      company,
    });
  } catch (error) {
    console.error("Delete logo error:", error);
    res.status(500).json({ error: "Failed to delete logo" });
  }
});

module.exports = router;
