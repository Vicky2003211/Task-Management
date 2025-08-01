const CsvData = require('../Models/CsvData');

// Get all CSV data
const getAllCsvData = async (req, res) => {
  try {
    const csvData = await CsvData.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'CSV data retrieved successfully',
      count: csvData.length,
      data: csvData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching CSV data',
      error: error.message
    });
  }
};

// Get CSV data by Task_id
const getCsvDataByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const csvData = await CsvData.find({ 
      Task_id: { $regex: taskId, $options: 'i' } 
    }).sort({ createdAt: -1 });
    res.status(200).json({
      message: `CSV data for Task_id: ${taskId}`,
      count: csvData.length,
      data: csvData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching CSV data by Task_id',
      error: error.message
    });
  }
};

// Complete task by Task_id
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const updatedTask = await CsvData.findOneAndUpdate(
      { Task_id: taskId },
      { 
        status: 'Completed',
        completedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({
        message: `Task with Task_id: ${taskId} not found`
      });
    }
    
    res.status(200).json({
      message: `Task ${taskId} completed successfully`,
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error completing task',
      error: error.message
    });
  }
};

// Delete task by Task_id
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const deletedTask = await CsvData.findOneAndDelete({ Task_id: taskId });
    
    if (!deletedTask) {
      return res.status(404).json({
        message: `Task with Task_id: ${taskId} not found`
      });
    }
    
    res.status(200).json({
      message: `Task ${taskId} deleted successfully`,
      deletedTask: {
        Task_id: deletedTask.Task_id,
        firstName: deletedTask.firstName,
        phone: deletedTask.phone,
        status: deletedTask.status,
        assignedAgent: deletedTask.assignedAgent
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting task',
      error: error.message
    });
  }
};

module.exports = {
  getAllCsvData,
  getCsvDataByTaskId,
  completeTask,
  deleteTask
};