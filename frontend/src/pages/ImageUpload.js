import React, { useState } from 'react';
import axios from 'axios';
import './../css/createParking.scss'; // Reusing styles for consistency
import Layout from './Layout';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Automatically registers Chart.js components

const ImageUpload = () => {
    const [file, setFile] = useState(null);
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/process-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponseData(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to upload and process the image.');
            console.error(err);
        }
    };

    const renderChart = () => {
        if (!responseData || !responseData.class_counts) return null;

        const labels = Object.keys(responseData.class_counts);
        const data = Object.values(responseData.class_counts);

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Class Counts',
                    data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        return (
            <div className="mt-5 chart-container">
                <h3 className="text-center">Class Counts Chart</h3>
                <Bar data={chartData} />
            </div>
        );
    };

    const renderSlots = () => {
        if (!responseData || !responseData.slot_numbers || !responseData.total_slots) return null;
    
        const slots = responseData.slot_numbers; // Booked and empty slots
        const totalSlots = responseData.total_slots; // Total slots detected by the model
        const slotElements = [];
    
        for (let i = 1; i <= totalSlots; i++) {
            const isBooked = slots[i] === 1; // Check if the slot is booked (1 = booked, 0 = empty)
            slotElements.push(
                <div
                    key={i}
                    className={`slot ${isBooked ? 'booked' : 'empty'}`} // Apply 'booked' or 'empty' class
                    title={isBooked ? `Slot ${i}: Booked` : `Slot ${i}: Empty`}
                >
                    {i}
                </div>
            );
        }
    
        return (
            <div className="mt-5 slots-container">
                <h3 className="text-center">Slot Details</h3>
                <div className="slots-grid">
                    {slotElements}
                </div>
            </div>
        );
    };

    return (
        <>
            <Layout />
            <div className="container py-5">
                <div className="card create-parking-card p-5">
                    <h2 className="mb-4 text-center">Upload an Image</h2>
                    <div className="mb-3 w-40 justify-content-center mx-auto d-block">
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button
                        className="btn btn-primary w-50 justify-content-center mx-auto d-block"
                        onClick={handleUpload}
                    >
                        Upload
                    </button>
                    {error && (
                        <div
                            className="alert alert-danger mt-3"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}
                </div>
                {responseData && (
                    <div className="results-container mt-5">
                        {renderChart()}
                        {renderSlots()}
                    </div>
                )}
            </div>
        </>
    );
};

export default ImageUpload;