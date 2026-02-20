import React, { useState } from "react";

type User = { id: number; name: string; email: string; role: string };

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Alice", email: "alice@test.com", role: "Admin" },
    { id: 2, name: "Bob", email: "bob@test.com", role: "User" },
    { id: 3, name: "Charlie", email: "charlie@test.com", role: "User" },
  ]);

  const [newUser, setNewUser] = useState<User>({ id: 0, name: "", email: "", role: "User" });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Add new user
  const handleAdd = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ id: 0, name: "", email: "", role: "User" });
  };

  // Delete user
  const handleDelete = (id: number) => setUsers(users.filter(u => u.id !== id));

  // Save edited user
  const handleSaveEdit = () => {
    if (!editingUser) return;
    setUsers(users.map(u => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "100px auto 40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Users List</h1>

      {/* Add new user */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
        />
        <select
          value={newUser.role}
          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
        >
          <option>User</option>
          <option>Admin</option>
        </select>
        <button
          onClick={handleAdd}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 3px 6px rgba(0,0,0,0.15)"
          }}
        >
          Add
        </button>
      </div>

      {/* Users Table */}
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "linear-gradient(90deg, #6a11cb, #2575fc)", color: "white" }}>
            <th style={{ padding: "15px" }}>ID</th>
            <th style={{ padding: "15px" }}>Name</th>
            <th style={{ padding: "15px" }}>Email</th>
            <th style={{ padding: "15px" }}>Role</th>
            <th style={{ padding: "15px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr
              key={u.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                transition: "0.3s",
                textAlign: "center"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e0f7fa")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#fff")}
            >
              <td style={{ padding: "12px" }}>{u.id}</td>
              <td style={{ padding: "12px" }}>{u.name}</td>
              <td style={{ padding: "12px" }}>{u.email}</td>
              <td style={{ padding: "12px" }}>{u.role}</td>
              <td style={{ padding: "12px", display: "flex", justifyContent: "center", gap: "8px" }}>
                <button
                  onClick={() => setEditingUser(u)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#ff9800",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#f44336",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200
          }}
        >
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", minWidth: "300px" }}>
            <h2 style={{ marginTop: 0 }}>Edit User</h2>
            <input
              type="text"
              value={editingUser.name}
              onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
              style={{ padding: "8px", width: "100%", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <input
              type="email"
              value={editingUser.email}
              onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
              style={{ padding: "8px", width: "100%", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <select
              value={editingUser.role}
              onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
              style={{ padding: "8px", width: "100%", marginBottom: "20px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option>User</option>
              <option>Admin</option>
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "none", backgroundColor: "#ccc", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "none", backgroundColor: "#4CAF50", color: "white", cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
