```jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`http://localhost:5000/api/admin/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load user details");
                }

                setUser(data.user);
                setRatings(data.ratings);
            })
            .catch((error) => setError(error.message));
    }, [id]);

    if (error) {
        return (
            <div>
                <h2>{error}</h2>
                <button onClick={() => navigate("/admin")}>
                    Back to Admin Dashboard
                </button>
            </div>
        );
    }

    if (!user) {
        return <h2>Loading user details...</h2>;
    }

    return (
        <div style={{ padding: "25px" }}>
            <button onClick={() => navigate("/admin")}>
                Back to Dashboard
            </button>

            <h2>User Details</h2>

            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Role:</strong> {user.role}</p>

            <h3>Ratings Given by This User</h3>

            {ratings.length === 0 ? (
                <p>This user has not rated any store yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Store Name</th>
                            <th>Rating</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ratings.map((rating) => (
                            <tr key={rating.storeId}>
                                <td>{rating.storeName}</td>
                                <td>{rating.rating} / 5</td>
                                <td>
                                    {new Date(rating.ratedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserDetails;
```