import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/tasks', {
        params: { sortBy, order: sortOrder },
      });
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [user, fetchTasks]);

  const showActionError = (msg) => {
    setActionError(msg);
    setTimeout(() => setActionError(''), 4000);
  };

  const handleAddOrUpdate = async (taskData) => {
    try {
      setActionError('');
      if (editingTask) {
        const res = await API.put(`/tasks/${editingTask._id}`, taskData);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
        setEditingTask(null);
      } else {
        const res = await API.post('/tasks', taskData);
        setTasks((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      showActionError(err.response?.data?.message || 'Failed to save task. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionError('');
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      showActionError(err.response?.data?.message || 'Failed to delete task. Please try again.');
    }
  };

  // Now receives the explicit next status from TaskItem
  const handleToggleStatus = async (task, newStatus) => {
    try {
      setActionError('');
      const res = await API.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      showActionError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Client-side filtering for search and priority (status filter sent to server via refetch,
  // but we do all filters client-side here to avoid refetch on every keystroke)
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Count helpers for filter bar badges
  const countByStatus = (s) => tasks.filter((t) => t.status === s).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Manager</h1>
        <div className="header-right">
          <span>Hi, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {actionError && <div className="action-error">{actionError}</div>}

      <div className="dashboard-content">
        <aside className="form-panel">
          <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <TaskForm
            onSubmit={handleAddOrUpdate}
            editingTask={editingTask}
            onCancel={() => setEditingTask(null)}
          />
        </aside>

        <main className="tasks-panel">
          {/* Search + Sort bar */}
          <div className="search-sort-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); }}
            >
              <option value="createdAt">Sort: Date Created</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
            </button>
          </div>

          {/* Status filter + Priority filter */}
          <div className="filter-row">
            <div className="filter-bar">
              {statusFilters.map((f) => (
                <button
                  key={f.key}
                  className={filter === f.key ? 'active' : ''}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  <span className="filter-count">
                    {f.key === 'all' ? tasks.length : countByStatus(f.key)}
                  </span>
                </button>
              ))}
            </div>

            <div className="priority-filter">
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  className={`priority-filter-btn priority-${p} ${priorityFilter === p ? 'active' : ''}`}
                  onClick={() => setPriorityFilter(p)}
                >
                  {p === 'all' ? 'All Priority' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
          {loading ? (
            <p className="loading-state">Loading tasks...</p>
          ) : error ? (
            <div className="fetch-error">
              <p>{error}</p>
              <button onClick={fetchTasks}>Retry</button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <p className="empty-state">
              {search || filter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks match your filters.'
                : 'No tasks yet. Add one!'}
            </p>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
