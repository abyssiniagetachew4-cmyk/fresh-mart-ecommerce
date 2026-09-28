const express = require("express");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      message: "Your message has been sent successfully.",
      contactMessage,
    });
  } catch (error) {
    console.error("Contact message error:", error);

    res.status(500).json({
      message: "Failed to send your message.",
    });
  }
});

module.exports = router;