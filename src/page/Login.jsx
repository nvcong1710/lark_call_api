import React, { useEffect } from 'react';

export const Login = () => {

    useEffect(() => {
        window.location.href = 'http://localhost:3001/api/get-user-access-token';
    }, []);

    return (
        <div className="App">
            <p>Redirecting to login...</p>
        </div>
    );
};
