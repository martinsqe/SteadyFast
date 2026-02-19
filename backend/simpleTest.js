
import axios from 'axios';

const princeEmail = "prince@gmail.com";
const password = "password123";

const runTest = async () => {
    try {
        console.log("Attempting Login...");
        const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
            email: princeEmail,
            password: password
        });

        const token = loginRes.data.token;
        console.log("Login Successful, Token received");

        console.log("Attempting Create Service Request...");
        const requestRes = await axios.post("http://localhost:5000/api/services", {
            vehicleType: "Car",
            problem: "Flat Tyre",
            details: { brand: "Toyota", model: "Camry" },
            location: { longitude: -74.008, latitude: 40.7128 },
            price: 25
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Service Request Created:", requestRes.data);

    } catch (e) {
        console.error("Error Status:", e.response?.status);
        console.error("Error Data:", e.response?.data);
        console.error("Error Message:", e.message);
    }
};

runTest();
