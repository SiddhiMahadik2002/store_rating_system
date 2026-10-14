
import { useEffect, useState } from "react";

function StoreOwnerDashboard() {
  const [data, setData] = useState({ stores: [], ratings: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/owner/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setMessage(result.message || "Failed to load dashboard");
          return;
        }

        setData(result);
      } catch {
        setMessage("Cannot connect to backend");
      }
    }

    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Store Owner Dashboard</h1>
      <button onClick={logout}>Logout</button>

      {message && <p>{message}</p>}

      <h2>My Stores</h2>

      {data.stores.map((store) => (
        <div
          key={store.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "12px"
          }}
        >
          <h3>{store.name}</h3>
          <p>Average Rating: {store.averageRating ?? "No ratings yet"}</p>
          <p>Total Ratings: {store.totalRatings}</p>
        </div>
      ))}

      <h2>Users Who Rated My Stores</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Store</th>
              <th>Rating</th>
              <th>Rated At</th>
            </tr>
          </thead>

          <tbody>
            {data.ratings.map((rating, index) => (
              <tr key={`${rating.userEmail}-${rating.storeName}-${index}`}>
                <td>{rating.userName}</td>
                <td>{rating.userEmail}</td>
                <td>{rating.storeName}</td>
                <td>{rating.rating} / 5</td>
                <td>
                  {rating.ratedAt
                    ? new Date(rating.ratedAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;
