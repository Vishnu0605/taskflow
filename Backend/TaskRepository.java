package com.taskflow.repository;

import com.taskflow.model.Task;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class TaskRepository {

    // In-memory storage (like a fake database)
    private final Map<Long, Task> taskStore = new LinkedHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    // Save a new task
    public Task save(Task task) {
        task.setId(idCounter.getAndIncrement());
        taskStore.put(task.getId(), task);
        return task;
    }

    // Get all tasks
    public List<Task> findAll() {
        return new ArrayList<>(taskStore.values());
    }

    // Get task by ID
    public Optional<Task> findById(Long id) {
        return Optional.ofNullable(taskStore.get(id));
    }

    // Update existing task
    public Optional<Task> update(Long id, Task updatedTask) {
        if (!taskStore.containsKey(id)) {
            return Optional.empty();
        }
        updatedTask.setId(id);
        taskStore.put(id, updatedTask);
        return Optional.of(updatedTask);
    }

    // Delete task by ID
    public boolean deleteById(Long id) {
        return taskStore.remove(id) != null;
    }

    // Delete all completed tasks
    public void deleteCompleted() {
        taskStore.values().removeIf(Task::isCompleted);
    }
}
