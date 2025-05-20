const Remark = require('../models/Remark');

// @desc    Create a new remark
// @route   POST /api/remarks
// @access  Private
exports.createRemark = async (req, res) => {
  try {
    const { date, content } = req.body;
    
    // Create new remark
    const remark = await Remark.create({
      user: req.user._id,
      date,
      content
    });
    
    res.status(201).json(remark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all remarks for a user by date
// @route   GET /api/remarks/:date
// @access  Private
exports.getRemarksByDate = async (req, res) => {
  try {
    // Parse the date from the request parameters
    const searchDate = new Date(req.params.date);
    
    // Set time to beginning of the day
    const startDate = new Date(searchDate);
    startDate.setHours(0, 0, 0, 0);
    
    // Set time to end of the day
    const endDate = new Date(searchDate);
    endDate.setHours(23, 59, 59, 999);
    
    const remarks = await Remark.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 });
    
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all remarks for a user
// @route   GET /api/remarks
// @access  Private
exports.getAllRemarks = async (req, res) => {
  try {
    const remarks = await Remark.find({ user: req.user._id }).sort({ date: -1 });
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a remark
// @route   PUT /api/remarks/:id
// @access  Private
exports.updateRemark = async (req, res) => {
  try {
    const { date, content } = req.body;
    const remark = await Remark.findById(req.params.id);
    
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }
    
    // Check if the remark belongs to the user
    if (remark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this remark' });
    }
    
    remark.date = date || remark.date;
    remark.content = content || remark.content;
    
    const updatedRemark = await remark.save();
    res.json(updatedRemark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a remark
// @route   DELETE /api/remarks/:id
// @access  Private
exports.deleteRemark = async (req, res) => {
  try {
    const remark = await Remark.findById(req.params.id);
    
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }
    
    // Check if the remark belongs to the user
    if (remark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this remark' });
    }
    
    await remark.deleteOne();
    res.json({ message: 'Remark removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};