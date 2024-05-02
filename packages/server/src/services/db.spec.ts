import { read } from "fs";
import { DbService } from "./db";
import { query } from "express";
import { Task } from "../models/task";

const newTask = {
  id: "123",
  userId: "123",
  title: "Test",
  completed: false,
};

// mock CosmosClient
jest.mock("@azure/cosmos", () => {
  return {
    CosmosClient: jest.fn().mockImplementation(() => {
      return {
        database: jest.fn().mockImplementation(() => {
          return {
            container: jest.fn().mockImplementation(() => {
              return {
                items: {
                  query: () => ({
                    fetchAll: () => ({
                      resources: [],
                    }),
                  }),
                  create: (task: Task) => ({
                    resource: task,
                  }),
                },
                item: (id: string) => ({
                  read: () => ({
                    resource: newTask,
                  }),
                  replace: (task: Task) => ({
                    resource: task,
                  }),
                  delete: () => {},
                }),
                read: jest.fn().mockResolvedValue({
                  resource: newTask,
                }),
              };
            }),
          };
        }),
      };
    }),
  };
});

describe("DbService", () => {
  beforeAll(() => {
    // Set environment variables
    process.env.COSMOS_ENDPOINT = "dummy";
    process.env.COSMOS_KEY = "123";
  });

  it("should get all tasks for a user", async () => {
    const dbService = DbService.getInstance();
    const tasks = await dbService.getTasks("123");
    expect(tasks).toEqual([]);
  });

  it("should create a new task", async () => {
    const dbService = DbService.getInstance();
    const newTask = {
      id: "123",
      userId: "123",
      title: "Test",
      completed: false,
    };
    const task = await dbService.createTask(newTask);
    expect(task).toEqual(newTask);
  });

  it("should get a task by id", async () => {
    const dbService = DbService.getInstance();
    const task = await dbService.getTask("123");
    expect(task).toEqual({
      id: "123",
      userId: "123",
      title: "Test",
      completed: false,
    });
  });

  it("should update a task", async () => {
    const dbService = DbService.getInstance();
    const updatedTask = {
      id: "123",
      userId: "123",
      title: "Test",
      completed: true,
    };
    const task = await dbService.updateTask(updatedTask);
    expect(task).toEqual(updatedTask);
  });

  it("should delete a task", async () => {
    const dbService = DbService.getInstance();
    await dbService.deleteTask("123");
    expect(true).toBe(true);
  });
});
