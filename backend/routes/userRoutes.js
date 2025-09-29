import express from "express";
import UserCount from "../models/UserCount.js"; // Mongoose model
import UserTracking from "../models/UserTracking.js"; // User tracking model

const router = express.Router();

// Increment count when user accepts cookies
router.post("/accept", async (req, res) => {
  try {
    let record = await UserCount.findOne();

    if (!record) {
      record = new UserCount({ count: 0 });
    }

    record.count += 1;
    await record.save();

    res.json({ success: true, count: record.count });
  } catch (error) {
    console.error("Error updating count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get current count
router.get("/count", async (req, res) => {
  try {
    let record = await UserCount.findOne();
    res.json({ count: record ? record.count : 0 });
  } catch (error) {
    console.error("Error fetching count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Silent tracking endpoint
router.post("/track", async (req, res) => {
  try {
    const {
      sessionId,
      userAgent,
      language,
      platform,
      cookieEnabled,
      doNotTrack,
      screenWidth,
      screenHeight,
      screenColorDepth,
      windowWidth,
      windowHeight,
      timezone,
      canvasFingerprint,
      sessionStart,
      webGL,
      touchSupport,
      localStorage,
      sessionStorage,
      connectionType
    } = req.body;

    // Get IP address from request
    const ipAddress = req.ip || req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Check if user already exists
    let existingUser = await UserTracking.findOne({ sessionId });

    if (existingUser) {
      // Update existing user
      existingUser.visitCount += 1;
      existingUser.lastVisit = new Date();
      await existingUser.save();
      
      res.json({ 
        success: true, 
        message: "User tracking updated",
        visitCount: existingUser.visitCount,
        isReturning: true
      });
    } else {
      // Create new user tracking record
      const newTracking = new UserTracking({
        sessionId,
        userAgent,
        language,
        platform,
        cookieEnabled,
        doNotTrack,
        screenWidth,
        screenHeight,
        screenColorDepth,
        windowWidth,
        windowHeight,
        timezone,
        canvasFingerprint,
        sessionStart: new Date(sessionStart),
        webGL,
        touchSupport,
        localStorage,
        sessionStorage,
        connectionType,
        ipAddress
      });

      await newTracking.save();

      // Also increment the general user count
      let countRecord = await UserCount.findOne();
      if (!countRecord) {
        countRecord = new UserCount({ count: 0 });
      }
      countRecord.count += 1;
      await countRecord.save();

      res.json({ 
        success: true, 
        message: "User tracked successfully",
        visitCount: 1,
        isReturning: false,
        totalUsers: countRecord.count
      });
    }

  } catch (error) {
    console.error("Error tracking user:", error);
    res.status(500).json({ success: false, message: "Tracking error" });
  }
});

// Get user analytics
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await UserTracking.countDocuments();
    const todayUsers = await UserTracking.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      }
    });
    
    const browserStats = await UserTracking.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const timezoneStats = await UserTracking.aggregate([
      {
        $group: {
          _id: "$timezone",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalUsers,
      todayUsers,
      browserStats,
      timezoneStats
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: "Analytics error" });
  }
});

export default router;
