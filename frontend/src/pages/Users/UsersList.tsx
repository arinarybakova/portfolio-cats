import React, { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

type UserRowProps = {
  user: User;
  onOpen: (id: number) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
};

const styles = `
  * { box-sizing: border-box; }
  .users-page {
    min-height: 100vh;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .users-shell {
    max-width: 1320px;
    margin: 0 auto;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.88);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
    padding: 20px;
  }
  .hero {
    text-align: center;
    max-width: 860px;
    margin: 0 auto 20px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    font-size: 12px;
    color: rgba(255,255,255,0.86);
  }
  .page-title {
    margin: 14px 0 8px;
    font-size: clamp(36px, 7vw, 64px);
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(90deg, #fff, #dbeafe, #f5d0fe);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .page-subtitle {
    margin: 0 auto;
    max-width: 760px;
    color: #dbe4f2;
    font-size: 16px;
    line-height: 1.6;
  }
  .panel {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    border-radius: 22px;
  }
  .add-card {
    margin-bottom: 18px;
    overflow: hidden;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    background: linear-gradient(90deg, rgba(34,211,238,0.14), rgba(217,70,239,0.12), rgba(251,191,36,0.08));
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    padding: 16px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .field label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5e1;
    font-weight: 700;
  }
  .input {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    color: white;
    border-radius: 14px;
    padding: 12px 14px;
    outline: none;
  }
  .input::placeholder { color: #94a3b8; }
  .input option { color: #0f172a; }
  .button-row {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 16px 16px;
    flex-wrap: wrap;
  }
  .btn, .btn-outline, .btn-danger {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    transition: opacity .15s ease;
  }
  .btn:hover, .btn-outline:hover, .btn-danger:hover { opacity: 0.95; }
  .btn {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
  }
  .btn-outline {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .btn-danger {
    padding: 10px 12px;
    border-radius: 12px;
    color: white;
    background: linear-gradient(90deg, #ef4444, #f97316);
  }
  .table-card { overflow: hidden; }
  .table-scroll { overflow-x: auto; }
  .users-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 820px;
  }
  .users-table thead th {
    padding: 14px 12px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: white;
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .users-table tbody td {
    padding: 12px;
    text-align: center;
    color: #e5eefb;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .table-row:hover { background: rgba(255,255,255,0.025); }
  .name-link {
    cursor: pointer;
    color: #7dd3fc;
    font-weight: 800;
  }
  .name-link:hover { color: #c4b5fd; }
  .role-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
  }
  .role-admin { color: #fde68a; background: rgba(245,158,11,0.14); }
  .role-user { color: #bfdbfe; background: rgba(59,130,246,0.14); }
  .row-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 220px;
    color: #cbd5e1;
  }
  .empty-emoji { font-size: 48px; }
  .modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    background: rgba(2, 6, 23, 0.72);
    z-index: 1000;
  }
  .modal-card {
    width: 100%;
    max-width: 460px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #0f172a;
    box-shadow: 0 16px 40px rgba(0,0,0,0.24);
    padding: 18px;
    color: white;
  }
  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
  }
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  @media (max-width: 720px) {
    .users-page { padding: 12px; }
    .users-shell { border-radius: 22px; padding: 14px; }
    .form-grid { grid-template-columns: 1fr; padding: 14px; }
    .button-row { padding: 0 14px 14px; }
    .btn, .btn-outline { width: 100%; }
  }
`;

const UserRow = memo(function UserRow({ user, onOpen, onEdit, onDelete }: UserRowProps) {
  return (
    <tr className="table-row">
      <td>{user.id}</td>
      <td>
        <span className="name-link" onClick={() => onOpen(user.id)}>
          {user.name}
        </span>
      </td>
      <td>{user.email}</td>
      <td>
        <span className={`role-pill ${String(user.role).toLowerCase() === "admin" ? "role-admin" : "role-user"}`}>
          {user.role}
        </span>
      </td>
      <td>
        <div className="row-actions">
          <button className="btn-outline" onClick={() => onEdit(user)}>Edit</button>
          <button className="btn-danger" onClick={() => onDelete(user.id)}>Delete</button>
        </div>
      </td>
    </tr>
  );
});

export default function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({ id: 0, name: "", email: "", role: "User" });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.id - b.id), [users]);

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email) return;

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: "123456",
          role: newUser.role.toUpperCase(),
        }),
      });

      const createdUser = await res.json();
      setUsers((prev) => [...prev, createdUser]);
      setNewUser({ id: 0, name: "", email: "", role: "User" });
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`http://localhost:5000/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: String(editingUser.role).toUpperCase(),
        }),
      });

      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      setEditingUser(null);
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="users-page">
        <div className="users-shell">
          <div className="hero">
            <div className="badge">Premium Users Dashboard</div>
            <h1 className="page-title">Users List</h1>
            <p className="page-subtitle">
              Manage users with a polished interface and open a dedicated details view for user info, cats, addresses, and settings.
            </p>
          </div>

          <div className="panel add-card">
            <div className="section-head">
              <h2 className="section-title">Create User</h2>
              <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{users.length} users</span>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Name</label>
                <input className="input" placeholder="Full name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              </div>

              <div className="field">
                <label>Email</label>
                <input className="input" type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>

              <div className="field">
                <label>Role</label>
                <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option>User</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            <div className="button-row">
              <button className="btn" onClick={handleAdd}>Add User</button>
            </div>
          </div>

          <div className="panel table-card">
            <div className="table-scroll">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-emoji">👤</div>
                          <h2 style={{ margin: 0 }}>No Users Found</h2>
                          <p style={{ margin: 0, color: "#94a3b8" }}>Create your first user to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onOpen={(id) => navigate(`/users/${id}`)}
                        onEdit={setEditingUser}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {editingUser && (
            <Modal title="Edit User" onClose={() => setEditingUser(null)}>
              <input className="input" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
              <input className="input" type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
              <select className="input" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                <option>User</option>
                <option>Admin</option>
              </select>
              <div className="button-row" style={{ padding: 0, justifyContent: "flex-end" }}>
                <button className="btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="btn" onClick={handleSaveEdit}>Save</button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-outline" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
