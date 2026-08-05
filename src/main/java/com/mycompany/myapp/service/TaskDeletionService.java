package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Task;
import com.mycompany.myapp.repository.TaskRepository;
import java.util.HashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles task deletion by unlinking activity relationships before removal.
 */
@Service
@Transactional
public class TaskDeletionService {

    private static final String ENTITY_NAME = "task";

    private final TaskRepository taskRepository;

    public TaskDeletionService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findOneWithEagerRelationships(id).orElseThrow(() -> new EntityNotFoundException(ENTITY_NAME));
        clearActivityRelationships(task);
        taskRepository.delete(task);
    }

    public void deleteTasksByProjectId(Long projectId) {
        List<Task> tasks = taskRepository.findByProject_Id(projectId);
        tasks.forEach(this::clearActivityRelationships);
        taskRepository.deleteAll(tasks);
    }

    private void clearActivityRelationships(Task task) {
        new HashSet<>(task.getActivities()).forEach(task::removeActivities);
    }
}
