import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";

export default function Expense() {
    const [data, setData] = useState([]);
    const [selectedExpenses, setSelectedExpenses] = useState(new Set());
    const navigate = useNavigate();

    const user = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const getData = async () => {
                try {
                    const url = user.user.email === 'admin@gmail.com' ? 'https://backend-2txi.vercel.app/expenses' : `https://backend-2txi.vercel.app/expenses/user/${user.user.uid}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    setData(data);

                } catch (error) {
                    console.error(error.message);
                }
            };
            getData();
        }
    })



    const handleAdd = () => {
        navigate("/newExpense");
    };

    console.log(data);

    // useEffect(() => {
    //     const getData = async () => {
    //         const response = await fetch('https://backend-2txi.vercel.app/expenses');
    //         const data = await response.json();
    //         setData(data);
    //     };
    //     getData();
    // }, []);


    const handleCheckBoxChange = (id) => {
        const updatedSelection = new Set(selectedExpenses);
        if (updatedSelection.has(id)) {
            updatedSelection.delete(id);
        } else {
            updatedSelection.add(id);
        }
        setSelectedExpenses(updatedSelection);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allExpenseIds = new Set(data.map(trip => trip.id));
            setSelectedExpenses(allExpenseIds);
        } else {
            setSelectedExpenses(new Set());
        }
    }

    const handleDeleteSelected = async () => {
        const idsToDelete = Array.from(selectedExpenses);
        if (idsToDelete.length === 0) {
            alert("No expenses selected for deletion.");
            return;
        }

        // Make a DELETE request for each selected expense
        await Promise.all(idsToDelete.map(id =>
            fetch(`https://backend-2txi.vercel.app/expenses/${id}`, {
                method: 'DELETE',
            })
        ));

        // Update the local data state
        setData(prevData => prevData.filter(expense => !idsToDelete.includes(expense.id)));
        setSelectedExpenses(new Set()); // Clear selected expenses
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-success'; // Green badge for approved status
            case 'rejected':
                return 'bg-danger'; // Red badge for rejected status
            case 'pending':
                return 'bg-warning text-dark'; // Yellow badge for pending status
            default:
                return ''; // Default class if status is unknown
        }
    };


    return (
        <div className="container" style={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
                <button onClick={handleAdd} type="button" class="btn btn-success" style={{ marginRight: "10px" }}>+ New expense</button>

                {/* Conditionally render the Delete button */}
                {selectedExpenses.size > 0 && (
                    <button onClick={handleDeleteSelected} type="button" class="btn btn-danger">Delete Selected</button>
                )}

                <div className="card-container">
                    {data.map((expense) => (
                        <div key={expense.id} className="card my-2">
                            <div className="card-body">
                                {/* Checkbox for selection */}
                                {user.user.email === 'admin@gmail.com' && (  // Assuming the admin role check is similar to your example
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={selectedExpenses.has(expense.id)}
                                            onChange={() => handleCheckBoxChange(expense.id)}
                                        />
                                        <label className="form-check-label">Select</label>
                                    </div>
                                )}

                                {/* Title and Expense Details */}
                                <h5 className="card-title">{expense.subject}</h5>
                                <p className="card-text">
                                    <strong>Merchant:</strong> {expense.merchant} <br />
                                    <strong>Report Date:</strong> {formatDate(expense.date)} <br />
                                    <strong>Amount:</strong> ${expense.amount} <br />
                                    <strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(expense.status)}`}>{expense.status}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
}
