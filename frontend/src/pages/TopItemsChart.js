// TopItemsChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function TopItemsChart({ restaurant }) {
    const [topItems, setTopItems] = useState([]);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchTopItems = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/orders/top-items/${restaurant}`);
                const data = await res.json();
                setTopItems(data);
            } catch (err) {
                console.error("Error fetching top items", err);
            }
        };

        if (restaurant) fetchTopItems();
    }, [restaurant, BASE_URL]);

    const data = {
        labels: topItems.map(item => item._id),
        datasets: [
            {
                label: 'Times Ordered',
                data: topItems.map(item => item.totalOrdered),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderRadius: 5
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '30px auto' }}>
            <h3 style={{ textAlign: 'center' }}>🍽️ Top 5 Selling Menu Items</h3>
            <Bar data={data} options={options} />
        </div>
    );
}

export default TopItemsChart;
