package com.taskflow.service;

import com.taskflow.model.Task;
import com.taskflow.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // Get all tasks
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Get task by ID
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    // Create new task
    public Task createTask(Task task) {
        task.setCompleted(false);
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    // Update task (toggle complete or rename)
    public Optional<Task> updateTask(Long id, Task updatedTask) {
        Optional<Task> existing = taskRepository.findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        Task old = existing.get();

        // Update title only if provided
        if (updatedTask.getTitle() != null && !updatedTask.getTitle().trim().isEmpty()) {
            old.setTitle(updatedTask.getTitle());
        }

        // Toggle completed status
        old.setCompleted(updatedTask.isCompleted());

        return taskRepository.update(id, old);
    }

    // Delete task by ID
    public boolean deleteTask(Long id) {
        return taskRepository.deleteById(id);
    }

    // Delete all completed tasks
    public void deleteCompletedTasks() {
        taskRepository.deleteCompleted();
    }
}
