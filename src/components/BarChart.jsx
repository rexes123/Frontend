import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart() {
  const [cateringExpenses, setCateringExpenses] = useState(0);
  const [serviceExpenses, setServiceExpenses] = useState(0);
  const [tripExpenses, setTripExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("https://backend-2txi.vercel.app/expenses");
        const data = await response.json();

        // Catering
        const catering = data.filter((obj) => obj.category === "Catering" && obj.status === "approved");
        const cateringTotal = catering.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        setCateringExpenses(cateringTotal);

        // Service
        const services = data.filter((obj) => obj.category === "Services" && obj.status === "approved");
        const serviceTotal = services.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        setServiceExpenses(serviceTotal);

        // Trip
        const trips = data.filter((obj) => obj.category === "Trip" && obj.status === "approved");
        const tripTotal = trips.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        setTripExpenses(tripTotal);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };
    getData();
  }, []);

  const data = {
    labels: ["Trip", "Services", "Catering"],
    datasets: [
      {
        label: "Day-to-Day Expenses",
        data: [tripExpenses, serviceExpenses, cateringExpenses],
        backgroundColor: ["#3498db", "#f39c12", "#f1c40f"], // Blue, Orange, Yellow
        borderWidth: 1,
        borderColor: "black",
        hoverBackgroundColor: ["#2980b9", "#e67e22", "#f39c12"], // Darker colors on hover
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: "black",
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: "Expenses",
        color: "black",
        font: { size: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
          stepSize: 25, // Adjust step size for better readability
        },
      },
      x: {
        ticks: { color: "black" },
      },
    },
  };


  return (
    <div style={{ width: "80%", height: "400px", margin: "0 auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
