import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

// Register chart elements
ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

function BarChart({ data, labels }) {
    const chartData = {
        labels: labels || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                label: 'Orders per Day',
                data: data || [12, 19, 8, 5, 2, 14, 10],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderRadius: 6
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Orders: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12,
                    },
                },
                title: {
                    display: true,
                    text: 'Number of Orders',
                    font: {
                        size: 14,
                    },
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            }
        }
    };

    return (
        <div style={{ maxWidth: '650px', margin: '20px auto' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default BarChart;
