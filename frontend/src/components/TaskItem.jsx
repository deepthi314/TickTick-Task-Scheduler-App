export default function TaskItem({ task, onEdit, onDelete, onToggleStatus }) {
  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
  };

  const statusColors = {
    pending: { background: '#fff3cd', color: '#856404' },
    'in-progress': { background: '#cce5ff', color: '#004085' },
    completed: { background: '#d4edda', color: '#155724' },
  };

  // Determine if the task is overdue (due date is in the past and not completed)
  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  // Cycle: pending -> in-progress -> completed -> pending
  const nextStatus = {
    pending: 'in-progress',
    'in-progress': 'completed',
    completed: 'pending',
  };

  const nextStatusLabel = {
    pending: 'Start Task',
    'in-progress': 'Mark Complete',
    completed: 'Mark Pending',
  };

  return (
    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-item-header">
        <h3>{task.title}</h3>
        <span
          className="priority-badge"
          style={{ backgroundColor: priorityColors[task.priority] }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span
          className="status-badge"
          style={statusColors[task.status]}
        >
          {task.status}
        </span>
        {task.dueDate && (
          <span className={`due-date ${isOverdue ? 'due-date-overdue' : ''}`}>
            {isOverdue ? '⚠ Overdue: ' : 'Due: '}
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="task-actions">
        <button onClick={() => onToggleStatus(task, nextStatus[task.status])}>
          {nextStatusLabel[task.status]}
        </button>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button className="delete-btn" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
