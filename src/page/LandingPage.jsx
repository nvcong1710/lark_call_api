import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
function LandingPage() {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (code && state) {
            fetch("http://localhost:3001/api/auth/callback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, state }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Server response:", data);
                })
                .catch(error => {
                    console.error("Error sending code to server", error);
                });
        }
    }, [location]);

    return (
        <div>
            Landing Page
            <a href="/login">Login</a>
            <a href="/Home">Home</a>
        </div>
    );
}

export default LandingPage;
