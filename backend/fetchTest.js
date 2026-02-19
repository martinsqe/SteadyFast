
const princeEmail = "prince@gmail.com";
const password = "password123";

const runTest = async () => {
    try {
        console.log("Attempting Login...");
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: princeEmail, password: password })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login Successful, Token received");

        console.log("Attempting Create Service Request...");
        const requestRes = await fetch("http://localhost:5000/api/services", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                vehicleType: "Car",
                problem: "Flat Tyre",
                details: { brand: "Toyota", model: "Camry" },
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128]
                },
                price: 25
            })
        });

        const requestData = await requestRes.json();
        console.log("Service Request Created:", requestData);

    } catch (e) {
        console.error("Error:", e.message);
    }
};

runTest();
