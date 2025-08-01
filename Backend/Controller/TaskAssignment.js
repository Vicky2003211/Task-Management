const CsvData = require('../Models/CsvData');
const User = require('../Models/User');

// Auto-assign tasks to all agents
const assignTasksToAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'Agent' }).select('user_id username email mobile');
    
    if (agents.length === 0) {
      const allUsers = await User.find({}).select('user_id username role');
    
      return res.status(400).json({
        message: 'No agents found. Please register agents with role "Agent" first.',
        debug: {
          searchedRole: 'Agent',
          totalUsers: allUsers.length,
          availableRoles: [...new Set(allUsers.map(u => u.role))]
        }
      });
    }

    const pendingTasks = await CsvData.find({ status: 'Pending' }).sort({ createdAt: 1 });
    
    if (pendingTasks.length === 0) {
      return res.status(200).json({
        message: 'No pending tasks found',
        assignments: []
      });
    }

    const assignments = [];
    let agentIndex = 0;
    
    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      const agent = agents[agentIndex];
      
      await CsvData.findOneAndUpdate(
        { Task_id: task.Task_id },
        { 
          status: 'In-progress',
          assignedAgent: agent.user_id,
          assignedAt: new Date()
        },
        { new: true }
      );
      
      assignments.push({
        taskId: task.Task_id,
        agentId: agent.user_id,
        agentName: agent.username,
        agentEmail: agent.email,
        taskDetails: {
          firstName: task.firstName,
          phone: task.phone,
          notes: task.notes
        }
      });
      
      agentIndex = (agentIndex + 1) % agents.length;
    }

    const assignmentSummary = agents.map(agent => ({
      agentId: agent.user_id,
      agentName: agent.username,
      agentEmail: agent.email,
      agentMobile: agent.mobile,
      assignedTasks: assignments.filter(a => a.agentId === agent.user_id).length
    }));

    res.status(200).json({
      message: `Successfully assigned ${assignments.length} pending tasks to ${agents.length} agents`,
      totalTasks: pendingTasks.length,
      assignments: assignments,
      summary: assignmentSummary
    });

  } catch (error) {
    console.error('❌ Error in assignTasksToAgents:', error);
    res.status(500).json({
      message: 'Error assigning tasks to agents',
      error: error.message
    });
  }
};

// Assign tasks to selected agents
const assignTasksToSelectedAgents = async (req, res) => {
  try {
    const { selectedAgentIds } = req.body;
    
    if (!selectedAgentIds || selectedAgentIds.length !== 5) {
      return res.status(400).json({
        message: 'Please select exactly 5 agents for task assignment'
      });
    }

    const selectedAgents = await User.find({ 
      user_id: { $in: selectedAgentIds },
      role: 'Agent'
    }).select('user_id username email mobile');
    
    if (selectedAgents.length !== 5) {
      return res.status(400).json({
        message: 'Some selected agents were not found or are not valid agents'
      });
    }

    const pendingTasks = await CsvData.find({ status: 'Pending' }).sort({ createdAt: 1 });
    
    if (pendingTasks.length === 0) {
      return res.status(200).json({
        message: 'No pending tasks found in CsvData',
        assignments: []
      });
    }

    const totalTasks = pendingTasks.length;
    const baseTasksPerAgent = Math.floor(totalTasks / 5);
    const remainingTasks = totalTasks % 5;

    const assignments = [];
    let taskIndex = 0;
    
    for (let i = 0; i < 5; i++) {
      const agent = selectedAgents[i];
      const tasksForThisAgent = baseTasksPerAgent + (i < remainingTasks ? 1 : 0);
      
      for (let j = 0; j < tasksForThisAgent; j++) {
        if (taskIndex < pendingTasks.length) {
          const task = pendingTasks[taskIndex];
          
          await CsvData.findOneAndUpdate(
            { Task_id: task.Task_id },
            { 
              status: 'In-progress',
              assignedAgent: agent.user_id,
              assignedAt: new Date()
            },
            { new: true }
          );
          
          assignments.push({
            taskId: task.Task_id,
            agentId: agent.user_id,
            agentName: agent.username,
            agentEmail: agent.email,
            taskDetails: {
              firstName: task.firstName,
              phone: task.phone,
              notes: task.notes
            }
          });
          
          taskIndex++;
        }
      }
    }

    const assignmentSummary = selectedAgents.map(agent => {
      const agentAssignments = assignments.filter(a => a.agentId === agent.user_id);
      return {
        agentId: agent.user_id,
        agentName: agent.username,
        agentEmail: agent.email,
        agentMobile: agent.mobile,
        assignedTasks: agentAssignments.length,
        tasksPerAgent: baseTasksPerAgent,
        isOverloaded: agentAssignments.length > baseTasksPerAgent + 1
      };
    });

    res.status(200).json({
      message: `Successfully assigned ${assignments.length} pending tasks to 5 selected agents`,
      totalTasksInCsvData: pendingTasks.length,
      selectedAgents: selectedAgents.length,
      baseTasksPerAgent: baseTasksPerAgent,
      remainingTasks: remainingTasks,
      assignments: assignments,
      summary: assignmentSummary,
      distribution: {
        type: 'admin-selected-agents',
        description: `Each agent gets ${baseTasksPerAgent} tasks, with ${remainingTasks} agents getting +1 task`
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error assigning tasks to selected agents',
      error: error.message
    });
  }
};

// Get task details by agent ID
const getTaskDetailsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const taskDetails = await CsvData.find({ assignedAgent: agentId })
      .sort({ createdAt: -1 });

    if (taskDetails.length === 0) {
      return res.status(200).json({
        message: `No task assignments found for agent: ${agentId}`,
        taskDetails: []
      });
    }

    res.status(200).json({
      message: `Task details for agent: ${agentId}`,
      taskDetails: taskDetails
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching task details by agent',
      error: error.message
    });
  }
};

module.exports = {
  assignTasksToAgents,
  assignTasksToSelectedAgents,
  getTaskDetailsByAgent,
}; 