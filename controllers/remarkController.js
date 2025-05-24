const Remark = require('../models/Remark');

// @desc    Create a new remark
// @route   POST /api/remarks
// @access  Private
exports.createRemark = async (req, res) => {
  try {
    const { 
      name, 
      mobileNumber, 
      fromAddress,
      toAddress,
      date, 
      content, 
      done,
      totalAmount,
      advanceAmount,
      specialNote,
      priority
    } = req.body;
    
    // Create new remark
    const remark = await Remark.create({
      user: req.user._id,
      name,
      mobileNumber,
      fromAddress,
      toAddress,
      date,
      content,
      done: done !== undefined ? done : false,
      totalAmount: totalAmount || 0,
      advanceAmount: advanceAmount || 0,
      specialNote,
      priority: priority || 'medium'
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
    const searchDate = new Date(req.params.date);
    
    const startDate = new Date(searchDate);
    startDate.setHours(0, 0, 0, 0);
    
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
    const { 
      name, 
      mobileNumber, 
      fromAddress,
      toAddress,
      date, 
      content, 
      done,
      totalAmount,
      advanceAmount,
      specialNote,
      priority
    } = req.body;
    
    const remark = await Remark.findById(req.params.id);
    
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }
    
    if (remark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this remark' });
    }
    
    // Update fields
    remark.name = name || remark.name;
    remark.mobileNumber = mobileNumber || remark.mobileNumber;
    remark.fromAddress = fromAddress || remark.fromAddress;
    remark.toAddress = toAddress || remark.toAddress;
    remark.date = date || remark.date;
    remark.content = content || remark.content;
    remark.specialNote = specialNote !== undefined ? specialNote : remark.specialNote;
    remark.priority = priority || remark.priority;
    
    // Handle financial fields
    if (totalAmount !== undefined) remark.totalAmount = totalAmount;
    if (advanceAmount !== undefined) remark.advanceAmount = advanceAmount;
    
    // Only update done if it's explicitly provided
    if (done !== undefined) {
      remark.done = done;
    }
    
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
    
    if (remark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this remark' });
    }
    
    await remark.deleteOne();
    res.json({ message: 'Remark removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a remark as done/undone
// @route   PATCH /api/remarks/:id/toggle-done
// @access  Private
exports.toggleRemarkDone = async (req, res) => {
  try {
    const remark = await Remark.findById(req.params.id);
    
    if (!remark) {
      return res.status(404).json({ message: 'Remark not found' });
    }
    
    if (remark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this remark' });
    }
    
    remark.done = !remark.done;
    
    const updatedRemark = await remark.save();
    res.json(updatedRemark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all done/undone remarks for a user
// @route   GET /api/remarks/status/:status
// @access  Private
exports.getRemarksByStatus = async (req, res) => {
  try {
    const status = req.params.status === 'done';
    
    const remarks = await Remark.find({ 
      user: req.user._id,
      done: status
    }).sort({ date: -1 });
    
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get remarks by priority
// @route   GET /api/remarks/priority/:priority
// @access  Private
exports.getRemarksByPriority = async (req, res) => {
  try {
    const priority = req.params.priority;
    
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority level' });
    }
    
    const remarks = await Remark.find({ 
      user: req.user._id,
      priority: priority
    }).sort({ date: -1 });
    
    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial summary
// @route   GET /api/remarks/financial/summary
// @access  Private
exports.getFinancialSummary = async (req, res) => {
  try {
    const summary = await Remark.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalAdvance: { $sum: '$advanceAmount' },
          totalPending: { $sum: '$pendingAmount' },
          completedRemarks: {
            $sum: { $cond: [{ $eq: ['$done', true] }, 1, 0] }
          },
          pendingRemarks: {
            $sum: { $cond: [{ $eq: ['$done', false] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json(summary[0] || {
      totalAmount: 0,
      totalAdvance: 0,
      totalPending: 0,
      completedRemarks: 0,
      pendingRemarks: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};