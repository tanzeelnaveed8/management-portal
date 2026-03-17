
"use client";
import { Bar } from 'react-chartjs-2';
import {
     Chart as ChartJS,
     CategoryScale,
     LinearScale,
     BarElement,
     Title,
     Tooltip,
     Legend,
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PortfolioPulseChart({ projectStats }) {
     // Data mapped from your ProjectStatus enum
     const data = {
          labels: ['Upcoming', 'Active', 'Development', 'Review', 'Completed'],
          datasets: [
               {
                    label: 'Number of Projects',
                    data: [2, 5, 8, 3, 12], // These would come from your Prisma query
                    backgroundColor: '#2563eb', // Authority Blue from your globals.css
                    borderRadius: 8,
                    barThickness: 40,
               },
          ],
     };

     const options = {
          responsive: true,
          plugins: {
               legend: { display: false },
               title: {
                    display: true,
                    text: 'Portfolio Status Distribution',
                    font: { size: 16, weight: 'bold', family: 'Work Sans' },
                    color: '#0f172a',
               },
          },
          scales: {
               y: { beginAtZero: true, grid: { display: false } },
               x: { grid: { display: false } }
          }
     };

     return (
          <div className="bg-bg-surface p-6 rounded-3xl border border-border-default shadow-sm">
               <Bar data={data} options={options} />
          </div>
     );
}