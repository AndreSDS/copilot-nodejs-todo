import express from "express";
import { Task } from "../models/task";
import { DbService } from "../services/db";

const router = express.Router();
const dbService = DbService.getInstance();

router.get("/", async function (req, res) {
  res.json({ message: "server up" });
});

router.get("/users/:userId/tasks", async function (req, res) {
  try {
    const { userId } = req.params;

    // TODO: get tasks from database
    const tasks: Task[] = [] as Task[];
    const data = await dbService.getTasks(userId);
    if (data) {
      tasks.push(...data);
    }
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

router.post("/users/:userId/tasks", async function (req, res) {
  try {
    const { userId } = req.params;
    const task = {
      ...req.body,
      userId,
      completed: false,
    };

    // TODO: create task in database
    const createdTask = await dbService.createTask(task);
    res.json(createdTask);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

router.get("/tasks/:taskId", async function (req, res) {
  try {
    const { taskId } = req.params;

    // TODO: get task from database
    let task: Task = {} as Task;
    const data = await dbService.getTask(taskId);
    if (data) {
      task = data;
    }
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

router.patch("/tasks/:taskId", async function (req, res) {
  try {
    const { taskId } = req.params;

    // TODO: get existing task in database
    let updatedTask: Task = {} as Task;
    const data = await dbService.getTask(taskId);
    if (!data) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    updatedTask = data;
    updatedTask.completed = Boolean(req.body?.completed);

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

router.delete("/tasks/:taskId", async function (req, res) {
  try {
    const { taskId } = req.params;
    // TODO: delete task in database
    await dbService.deleteTask(taskId);
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
