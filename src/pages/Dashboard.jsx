import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BarChar from "../components/BarChart";
import BarChartTeam from "../components/BarChartTeam";


export default function Dashboard() {
    const navigate = useNavigate();

    const navToExpense = () => {
        navigate("/newExpense");
    };

    const navToTrip = () => {
        navigate("/newTrips");
    };

    const [pendingStatus, setPendingStatus] = useState(0);
    console.log(pendingStatus);
    const [data, setData] = useState([]);
    const [expenses, setExpenses] = useState([]); // Store actual expenses
    console.log(expenses);
    const [approvedExpenses, setApprovedExpenses] = useState([]);
    console.log(approvedExpenses);


    const softDevExpense = expenses.filter(expense => expense.team === "Software development");
    console.log(softDevExpense.length);

    // console.log(expenses.create_timestamp);
    const [trips, setTrips] = useState(0);
    console.log(trips);

    useEffect(() => {
        const getData = async () => {
            try {
                const [expensesResponse, tripsResponse] = await Promise.all([
                    fetch('https://backend-2txi.vercel.app/expenses'),
                    fetch('https://backend-2txi.vercel.app/trips')
                ]);

                const expensesData = await expensesResponse.json();
                console.log(expensesData);
                const approvedExpense = expensesData.filter(expense => expense.status === 'approved');
                setApprovedExpenses(approvedExpense)
                const pendingExpense = expensesData.filter(expense => expense.status === 'pending');
                setExpenses(pendingExpense);

                // console.log(pendingExpense);


                const tripsData = await tripsResponse.json();
                const pendingTrips = tripsData.filter(trip => trip.status === 'pending');
                console.log(pendingTrips.length);
                setTrips(pendingTrips.length);

                // Combine data for pending tasks
                const combinedData = [...expensesData, ...tripsData];
                setData(combinedData);

                // Calculate pending status
                const pending = combinedData.filter(item => item.status === 'pending').length;
                setPendingStatus(pending);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        getData();
    }, []);

    return (
        <div className="container">
            <div className="row tasksAndExpense">
                <div className="card col-sm-5">
                    <h5>Pending Tasks</h5>
                    <hr />
                    <div className="pending-row">
                        <i className="bi bi-clock"></i>
                        <div className="pending-info">
                            <span>Pending Approvals</span>
                            <span>{pendingStatus}</span>
                        </div>
                    </div>

                    <div className="pending-row">
                        <i className="bi bi-airplane"></i>
                        <div className="pending-info">
                            <span>Pending Trips Registered</span>
                            <span>{trips}</span>
                        </div>
                    </div>

                    <div className="pending-row">
                        <i className="bi bi-cart-plus"></i>
                        <div className="pending-info">
                            <span>Pending Expenses</span>
                            <span>{expenses.length}</span>
                        </div>
                    </div>
                </div>
                <div className="card col-sm-7 table-responsive">
                    <h5>Recent Expenses Approved</h5>
                    <hr />
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Subject</th>
                                <th scope="col">Employee</th>
                                <th scope="col">Team</th>
                                <th scope="col">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedExpenses
                                .sort((a, b) => new Date(b.create_timestamp) - new Date(a.create_timestamp))
                                .slice(0, 3)
                                .map((expense, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td >{expense.employee}</td>
                                        <td>{expense.team}</td>
                                        <td>{expense.amount}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="row card" style={{ paddingInline: "10px", marginRight: "0px" }}>
                <h5>Quick Access</h5>
                <hr />
                <div className="row quickAccess__row" style={{ padding: "calc(var(--bs-gutter-x)* .5)", margin: "0px" }}>
                    <div className="card col-sm" onClick={navToExpense} style={{ display: "flex", justifyContent: "center" }}>
                        <div>
                            <i className="bi bi-wallet2"/>
                            <span style={{marginLeft: "10px"}}>+New expense</span>
                        </div>
                    </div>

                    <div className="card col-sm" onClick={navToTrip}>
                        <div style={{ display: "flex" }}>
                            <i className="bi bi-airplane"/>
                            <span style={{marginLeft: "10px"}}>+Create trip</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row chart">
                <div className="card col-sm-6">
                    <BarChartTeam />
                </div>
                <div className="card col-sm-6"><BarChar /></div>
            </div>
        </div>
    );
}
