import { useEffect, useMemo, useState } from 'react';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask as deleteTaskApi,
  type Task,
} from './api/tasksApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

type Priority = 'Low' | 'Medium' | 'High';

// type Task = {
//   id: number;
//   title: string;
//   description: string;
//   completed: boolean;
//   priority: Priority;
//   dueDate: string;
//   category: string;
// };

// const initialTasks: Task[] = [];

function App() {
  // const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  const filteredTasks = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(value) ||
        task.description?.toLowerCase().includes(value) ||
        task.category?.toLowerCase().includes(value)
    );
  }, [tasks, search]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Unable to load tasks. Please try again.');
      toast.error('Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;

    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        dueDate: dueDate || undefined,
        category: 'General',
      });

      setTasks((current) => [newTask, ...current]);
      toast.success('Task created successfully!');
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setCategory('General');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    try {
      const updatedTask = await updateTask(id, {
        completed: !task.completed,
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === id ? updatedTask : item,
        ),
      );
      toast.success(
        updatedTask.completed
          ? 'Task marked as completed!'
          : 'Task marked as pending!',
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await deleteTaskApi(id);

      setTasks((current) =>
        current.filter((task) => task.id !== id),
      );
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <span>TaskFlow</span>
        </div>

        <nav className="navigation">
          <p className="nav-label">Workspace</p>

          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>☑</span>
            My Tasks
            <span className="nav-count">{pendingCount}</span>
          </button>

          <button className="nav-item">
            <span>✓</span>
            Completed
          </button>

          <p className="nav-label">Manage</p>

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">PG</div>

            <div>
              <strong>Prashanth</strong>
              <span>Developer</span>
            </div>

            <span className="user-more">⋯</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <kbd>⌘ K</kbd>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications">
              ♧
            </button>

            <div className="top-avatar">PG</div>
          </div>
        </header>

        <div className="content">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">TASK MANAGEMENT</p>
              <h1>Good evening, Prashanth 👋</h1>
              <p className="subtitle">
                Here's what's happening with your tasks today.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => setShowModal(true)}
            >
              <span>+</span>
              Add Task
            </button>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">☷</div>

              <div>
                <span>Total Tasks</span>
                <strong>{tasks.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">◷</div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">↗</div>

              <div>
                <span>Completion</span>
                <strong>
                  {tasks.length
                    ? Math.round((completedCount / tasks.length) * 100)
                    : 0}
                  %
                </strong>
              </div>
            </div>
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div>
                <h2>My Tasks</h2>
                <p>{filteredTasks.length} tasks found</p>
              </div>

              <div>
                <button
                  className="refresh-btn"
                  onClick={loadTasks}
                  disabled={loading}
                >
                  ↻ Refresh
                </button>

                <button
                  className="secondary-button"
                  onClick={() => setShowModal(true)}
                >
                  + New Task
                </button>
              </div>
            </div>

            <div className="task-list">
              {loading ? (
                <div className="empty-state">
                  <div className="loading-spinner" />
                  <h3>Loading tasks...</h3>
                  <p>Please wait while we load your tasks.</p>
                </div>
              ) : error ? (
                <div className="empty-state">
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                  <button className="secondary-button" onClick={loadTasks}>
                    Try Again
                  </button>
                </div>
              ) : filteredTasks.length !== 0 ? (
                filteredTasks.map((task) => (
                  <article
                    className={`task-card ${task.completed ? 'task-completed' : ''
                      }`}
                    key={task.id}
                  >
                    <button
                      className={`checkbox ${task.completed ? 'checked' : ''
                        }`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? 'Mark task as pending'
                          : 'Complete task'
                      }
                    >
                      {task.completed ? '✓' : ''}
                    </button>

                    <div className="task-info">
                      <div className="task-title-row">
                        <h3>{task.title}</h3>

                        <span
                          className={`priority priority-${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <p>{task.description || 'No description provided.'}</p>

                      <div className="task-meta">
                        <span>{task.category || 'General'}</span>
                        <span>•</span>
                        <span>Due {task.dueDate}</span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="delete-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No tasks found</h3>
                  <p>{search
                    ? 'Try a different search term.'
                    : 'Create your first task to get started.'}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Create new task</h2>
                <p>Add something you need to get done.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <label>
              Task title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Build Tasks API"
                autoFocus
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a short description..."
              />
            </label>

            <label>
              Due Date
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="General">General</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Testing">Testing</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as Priority)
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="primary-button" onClick={addTask}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

export default App;
