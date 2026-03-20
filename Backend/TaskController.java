package com.taskflow.controller;

import com.taskflow.model.Task;
import com.taskflow.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")   // Frontend (HTML file) connect aaga allow pannum
public class TaskController {

    @Autowired
    private TaskService taskService;

    // GET /api/tasks  →  All tasks list
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // GET /api/tasks/{id}  →  Single task
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/tasks  →  Create new task
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Task created = taskService.createTask(task);
        return ResponseEntity.ok(created);
    }

    // PUT /api/tasks/{id}  →  Update task (toggle / rename)
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        Optional<Task> result = taskService.updateTask(id, updatedTask);
        return result.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/tasks/{id}  →  Delete one task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/tasks/completed  →  Delete all completed tasks
    @DeleteMapping("/completed")
    public ResponseEntity<Void> deleteCompleted() {
        taskService.deleteCompletedTasks();
        return ResponseEntity.noContent().build();
    }
}
