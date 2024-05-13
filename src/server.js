const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://localhost:27017/task_manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    }
});

const Task = mongoose.model('Task', taskSchema);

// Create a task
// Task.create({
//     title: 'Task 1',
//     description: 'Description of Task 1',
//     dueDate: new Date(),
//     priority: 'High'
// }, (err, task) => {
//     if (err) {
//         console.error('Error creating task:', err);
//     } else {
//         console.log('Task created:', task);
//     }
// });

app.use(express.json());

// Route to create a new task
app.post('/tasks', async (req, res) => {
    try {
        // Extract task data from the request body
        const { title, description, dueDate, priority } = req.body;

        // Create a new task instance
        const newTask = new Task({
            title,
            description,
            dueDate,
            priority
        });

        // Save the new task to the database
        await newTask.save();

        // Send a success response
        res.status(201).json({ message: 'Task created', task: newTask });
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
});

// Route to get all tasks
app.get('/tasks', async (req, res) => {
    try {
        // Fetch all tasks from the MongoDB database
        const tasks = await Task.find();

        // Return the list of tasks as JSON response
        res.json(tasks);
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
});

// Route to get a specific task by ID
app.get('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        // Find the task by ID in the database
        const task = await Task.findById(taskId);

        if (!task) {
            // If task is not found, send a 404 Not Found response
            return res.status(404).json({ message: 'Task not found' });
        }

        // If task is found, send it as a JSON response
        res.json(task);
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ message: 'Failed to fetch task', error: error.message });
    }
});

// Route to update a task
app.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        // Extract the updated task data from the request body
        const { title, description, dueDate, priority } = req.body;

        // Find the task by ID and update it in the database
        const updatedTask = await Task.findByIdAndUpdate(taskId, {
            title,
            description,
            dueDate,
            priority
        }, { new: true });

        if (!updatedTask) {
            // If task is not found, send a 404 Not Found response
            return res.status(404).json({ message: 'Task not found' });
        }

        // If task is updated successfully, send a success response
        res.json({ message: 'Task updated', task: updatedTask });
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
});


// Route to delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        // Find the task by ID and delete it from the database
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            // If task is not found, send a 404 Not Found response
            return res.status(404).json({ message: 'Task not found' });
        }

        // If task is deleted successfully, send a success response
        res.json({ message: 'Task deleted', task: deletedTask });
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
