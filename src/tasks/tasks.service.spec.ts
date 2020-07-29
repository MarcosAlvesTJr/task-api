import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser = { id: 2, username: 'User1' };

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = (await module).get<TasksService>(TasksService);
    taskRepository = (await module).get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks', async () => {
      taskRepository.getTasks.mockResolvedValue('some value');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        search: 'some task',
        status: TaskStatus.IN_PROGRESS,
      };
      const response = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(response).toEqual('some value');
    });
  });

  describe('getTaskById', () => {
    it('retrieves a task from a user', async () => {
      const mockTask = {
        title: 'some task',
        description: 'this is a test task',
      };

      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          user: mockUser,
        },
      });
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('successfully creates a task', async () => {
      const mockCreateTaskDto = {
        title: 'some task',
        description: 'this is a test task',
      };
      const mockReturnTask = {
        title: 'some task',
        description: 'this is a test task',
        status: TaskStatus.OPEN,
      };

      taskRepository.createTask.mockResolvedValue(mockReturnTask);
      const response = await tasksService.createTask(
        mockCreateTaskDto,
        mockUser,
      );
      expect(taskRepository.createTask).toHaveBeenCalled();
      expect(response).toEqual(mockReturnTask);
    });
  });

  describe('deleteTaskById', () => {
    it('successefully deletes a task from a user', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        user: mockUser,
      });
    });

    it('throws an exception as the task is not found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('updates the status from a task', async () => {
      tasksService.getTaskById = jest.fn();
      tasksService.getTaskById.mockResolvedValue({
        title: 'some task',
        description: 'this is a test task',
        status: TaskStatus.IN_PROGRESS,
        save: jest.fn().mockResolvedValue(true),
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      const task = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser);
      expect(task.status).toEqual(TaskStatus.DONE);
    });
  });
});
