const express = require('express');
const router = express.Router();
const remarkController = require('../controllers/remarkController');
const { protect } = require('../middleware/authMiddleware');




// All routes are protected
router.use(protect);

router.post('/', remarkController.createRemark);
router.get('/', remarkController.getAllRemarks);
router.get('/status/:status', remarkController.getRemarksByStatus);
router.get('/:date', remarkController.getRemarksByDate);
router.put('/:id', remarkController.updateRemark);
router.patch('/:id/toggle-done', remarkController.toggleRemarkDone);
router.delete('/:id', remarkController.deleteRemark);

module.exports = router;