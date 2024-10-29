// ChartStyles.js

export const chartContainerStyle = {
    width: "80%",
    height: "400px",
    margin: "0 auto",
  };
  
  export const commonOptions = {
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
        color: "black",
        font: { size: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
          stepSize: 25,
        },
      },
      x: {
        ticks: {
          color: "black",
        },
      },
    },
  };
  