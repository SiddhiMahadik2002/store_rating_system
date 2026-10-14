
import { useEffect, useState } from "react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "USER"
  });

  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: ""
  });

  const token = localStorage.getItem("token");

  async function api(url, options = {}) {
    const response = await fetch(`http://localhost:5000${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function loadDashboard() {
    try {
      const [dashboard, userList, storeList] = await Promise.all([
        api("/api/admin/dashboard"),
        api("/api/admin/users"),
        api("/api/admin/stores")
      ]);

      setStats(dashboard);
      setUsers(userList);
      setStores(storeList);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function createUser(e) {
    e.preventDefault();

    try {
      const result = await api("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser)
      });

      setMessage(result.message || "User created successfully");

      setNewUser({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER"
      });

      loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createStore(e) {
    e.preventDefault();

    try {
      const result = await api("/api/admin/stores", {
        method: "POST",
        body: JSON.stringify({
          ...newStore,
          ownerId: Number(newStore.ownerId)
        })
      });

      setMessage(result.message || "Store created successfully");

      setNewStore({
        name: "",
        email: "",
        address: "",
        ownerId: ""
      });

      loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.address} ${user.role}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const filteredStores = stores.filter((store) =>
    `${store.name} ${store.email} ${store.address}`
      .toLowerCase()
      .includes(storeSearch.toLowerCase())
  );

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>
      <button onClick={loadDashboard} style={{ marginLeft: 10 }}>
        Refresh
      </button>

      {message && <p>{message}</p>}

      <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        <Stat title="Total Users" value={stats.totalUsers} />
        <Stat title="Total Stores" value={stats.totalStores} />
        <Stat title="Total Ratings" value={stats.totalRatings} />
      </div>

      <hr />

      <h2>Create User / Store Owner / Admin</h2>

      <form onSubmit={createUser}>
        <input
          placeholder="Full name (20-60 characters)"
          minLength={20}
          maxLength={60}
          required
          value={newUser.name}
          onChange={(e) =>
            setNewUser({ ...newUser, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={newUser.email}
          onChange={(e) =>
            setNewUser({ ...newUser, email: e.target.value })
          }
        />

        <input
          placeholder="Address"
          maxLength={400}
          required
          value={newUser.address}
          onChange={(e) =>
            setNewUser({ ...newUser, address: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          minLength={8}
          maxLength={16}
          required
          value={newUser.password}
          onChange={(e) =>
            setNewUser({ ...newUser, password: e.target.value })
          }
        />

        <select
          value={newUser.role}
          onChange={(e) =>
            setNewUser({ ...newUser, role: e.target.value })
          }
        >
          <option value="USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button type="submit">Create User</button>
      </form>

      <hr />

      <h2>Add Store</h2>

      <form onSubmit={createStore}>
        <input
          placeholder="Store name"
          required
          value={newStore.name}
          onChange={(e) =>
            setNewStore({ ...newStore, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Store email"
          required
          value={newStore.email}
          onChange={(e) =>
            setNewStore({ ...newStore, email: e.target.value })
          }
        />

        <input
          placeholder="Store address"
          maxLength={400}
          required
          value={newStore.address}
          onChange={(e) =>
            setNewStore({ ...newStore, address: e.target.value })
          }
        />

        <input
          type="number"
          min="1"
          placeholder="Store owner's user ID"
          required
          value={newStore.ownerId}
          onChange={(e) =>
            setNewStore({ ...newStore, ownerId: e.target.value })
          }
        />

        <button type="submit">Add Store</button>
      </form>

      <hr />

      <h2>Users</h2>
      <input
        placeholder="Search users"
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Stores</h2>
      <input
        placeholder="Search stores"
        value={storeSearch}
        onChange={(e) => setStoreSearch(e.target.value)}
      />

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Store Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Average Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map((store) => (
              <tr key={store.id}>
                <td>{store.id}</td>
                <td>{store.name}</td>
                <td>{store.email}</td>
                <td>{store.address}</td>
                <td>{store.averageRating ?? "No ratings"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        minWidth: 150
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 24 }}>{value}</p>
    </div>
  );
}

export default AdminDashboard;
