
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  async function fetchStores() {
    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (address) params.set("address", address);

      const response = await fetch(
        `http://localhost:5000/api/stores?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load stores");
        return;
      }

      setStores(data);
      setMessage("");
    } catch {
      setMessage("Cannot connect to backend");
    }
  }

  useEffect(() => {
    fetchStores();
  }, []);

  async function submitRating(storeId, rating) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/stores/${storeId}/rating`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ rating })
        }
      );

      const data = await response.json();
      setMessage(data.message || "Rating submitted");

      if (response.ok) fetchStores();
    } catch {
      setMessage("Cannot connect to backend");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Store Rating System</h1>
      <button onClick={logout}>Logout</button>

      <h2>Find Stores</h2>

      <input
        placeholder="Search by store name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Search by address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button onClick={fetchStores}>Search</button>

      {message && <p>{message}</p>}

      {stores.map((store) => (
        <div
          key={store.id}
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            marginTop: "15px",
            borderRadius: "8px"
          }}
        >
          <h3>{store.name}</h3>
          <p>{store.address}</p>
          <p>
            Overall Rating: {store.overallRating ?? "No ratings yet"}
          </p>
          <p>
            Your Rating: {store.myRating ?? "Not rated yet"}
          </p>

          <label>
            Submit or update rating:{" "}
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  submitRating(store.id, Number(e.target.value));
                }
              }}
            >
              <option value="" disabled>
                Select rating
              </option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </label>
        </div>
      ))}
    </div>
  );
}

export default UserDashboard;
