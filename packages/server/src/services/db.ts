// Import CosmosClient and task model
import { Container, CosmosClient, Database } from "@azure/cosmos";
import { Task } from "../models/task";

/**
 * This class provides a service to interact with the Cosmos DB database.
 * It is a singleton class, meaning that only one instance of it can exist.
 * @class
 * @property {CosmosClient} client - The Cosmos DB client
 * @property {Database} database - The database
 * @property {Container} container - The container
 * @method {createTask} createTask - Create a new task
 * @method {getTask} getTask - Get a task by id
 * @method {getTasks} getTasks - Get all tasks for a user
 * @method {updateTask} updateTask - Update a task
 * @method {deleteTask} deleteTask - Delete a task
*/

export class DbService {
  private client: CosmosClient;
  private database: Database;
  private container: Container;
  private static instance: DbService;

  // singleton pattern
  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  constructor() {
    // check if the required environment variables are set
    if (!process.env.COSMOS_ENDPOINT || !process.env.COSMOS_KEY) {
      throw new Error("COSMOS_ENDPOINT and COSMOS_KEY must be set");
    }

    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    });

    this.database = this.client.database("todos");
    this.container = this.database.container("tasks");
  }

  // create a new task
  async createTask(task: Task): Promise<Task | undefined> {
    const { resource: createdTask } = await this.container.items.create(task);
    return createdTask;
  }

  // get a task by id
  async getTask(id: string): Promise<Task | undefined> {
    const { resource: task } = await this.container.item(id).read();
    return task;
  }

  // get all tasks for a user
  async getTasks(userId: string): Promise<Task[]> {
    const querySpec = {
      query: "SELECT * FROM tasks t WHERE t.userId = @userId",
      parameters: [{ name: "@userId", value: userId }],
    };
    const { resources: tasks } = await this.container.items
      .query(querySpec)
      .fetchAll();
    return tasks;
  }

  // update a task
  async updateTask(task: Task): Promise<Task | undefined> {
    const { resource: updatedTask } = await this.container
      .item(task.id)
      .replace(task);
    return updatedTask;
  }

  // delete a task
  async deleteTask(id: string): Promise<void> {
    await this.container.item(id).delete();
  }
}
