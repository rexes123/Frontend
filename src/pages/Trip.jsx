import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";

export default function Trip() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedTrips, setSelectedTrips] = useState(new Set());
  const { user } = useContext(AuthContext);

  // Navigate to the new trip page
  const navToNewTrip = () => {
    navigate("/newTrips");
  };

  // Fetch data based on user role (admin or regular user)
  const getData = async () => {
    try {
      const url = user.email === "admin@gmail.com"
        ? "https://backend-2txi.vercel.app/trips"
        : `https://backend-2txi.vercel.app/trips/user/${user.uid}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log("Response from server:", data);
      setData(data);
    } catch (error) {
      console.error("Error fetching trips:", error.message);
    }
  };

  useEffect(() => {
    if (user) getData(); // Ensure user context is ready before fetching
  }, [user]);

  const handleCheckboxChange = (id) => {
    const updatedSelection = new Set(selectedTrips);
    if (updatedSelection.has(id)) {
      updatedSelection.delete(id);
    } else {
      updatedSelection.add(id);
    }
    setSelectedTrips(updatedSelection);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allTripIds = new Set(data.map((trip) => trip.id));
      setSelectedTrips(allTripIds);
    } else {
      setSelectedTrips(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = Array.from(selectedTrips);
    if (idsToDelete.length === 0) {
      alert("No trips selected for deletion.");
      return;
    }

    await Promise.all(
      idsToDelete.map((id) =>
        fetch(`https://backend-2txi.vercel.app/trips/${id}`, {
          method: "DELETE",
        })
      )
    );

    // Update local state after deletion
    setData((prevData) =>
      prevData.filter((trip) => !idsToDelete.includes(trip.id))
    );
    setSelectedTrips(new Set());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      case "pending":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container" style={{ display: "flex" }}>
      <div style={{ width: "100%" }}>
        <button
          onClick={navToNewTrip}
          type="button"
          className="btn btn-success"
          style={{ marginRight: "10px" }}
        >
          + New trip
        </button>

        {selectedTrips.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            type="button"
            className="btn btn-danger"
          >
            Delete Selected
          </button>
        )}

        <div className="card-container">
          {data.map((trip) => (
            <div key={trip.id} className="card my-2 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedTrips.has(trip.id)}
                    onChange={() => handleCheckboxChange(trip.id)}
                  />
                  <span className={`badge ${getStatusBadgeClass(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                <h5 className="card-title">{trip.purpose}</h5>
                <p className="card-text mb-2">
                  <strong>Departure:</strong> {formatDate(trip.depart_from)} <br />
                  <strong>Return:</strong> {formatDate(trip.return_date)} <br />
                  <strong>Amount:</strong> RM{" "}
                  {typeof trip.amount === "number"
                    ? trip.amount.toFixed(2)
                    : "N/A"}{" "}
                  <br />
                  <strong>Report Created:</strong> {formatDate(trip.create_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
