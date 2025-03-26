const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || 'simple_secret_key';
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Create a new contact request
router.post('/', auth, async (req, res) => {
  try {
    const { toUserId } = req.body;
    
    if (!toUserId) {
      return res.status(400).json({ message: 'Recipient user ID is required' });
    }
    
    // Check if recipient user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }
    
    // Check if request already exists
    const existingRequest = await Request.findOne({
      fromUser: req.user.id,
      toUser: toUserId
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    
    // Create new request
    const request = new Request({
      fromUser: req.user.id,
      toUser: toUserId
    });
    
    await request.save();
    
    res.status(201).json({
      message: 'Request sent successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all requests for the current user
router.get('/', auth, async (req, res) => {
  try {
    // Get requests where the current user is either the sender or recipient
    const requests = await Request.find({
      $or: [
        { fromUser: req.user.id },
        { toUser: req.user.id }
      ]
    })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update request status (accept/reject)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (accepted/rejected) is required' });
    }
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Ensure the user is the recipient of the request
    if (request.toUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }
    
    // Update request status
    request.status = status;
    await request.save();
    
    // Populate user details for response
    await request.populate('fromUser', 'name email');
    await request.populate('toUser', 'name email');
    
    res.json({
      message: `Request ${status}`,
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
