'use client';
import Link from "next/link";
import { useState } from "react"
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";

export default function Login () {
    const auth = useAuth();
    const login = auth?.login;
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: ''});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log('Login page loaded');


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
      };
    
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    // Optionally send data to an API route
    try {
        const response = await fetch('http://localhost:5001/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } 
        const data = await response.json();

        // Save the JWT token to local storage
        localStorage.setItem('token', data.token);

        // Call the login function from AuthContext
        if (login) {
            login(data.user);
        }

        if (data.error) {
            setError(true);
            setLoading(false);
            return;
        }
        // Handle success state here
        console.log('Login successful:', data);
        console.log('Redirecting to dashboard...');

        // Add a one second delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);

        // Optionally redirect or update UI
        router.push('/dashboard');
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        setError(true);
        setLoading(false);
        return;
    }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-400 border-solid"></div>
            </div>
        );
    }

    return (
        <main className="flex flex-col min-h-screen items-center justify-center">
            <div className="max-w-lg w-md w-full">
                <h1 className="mb-8 text-lg text-center text-gray-500">Welcome back! Log in to your account</h1>

                <form onSubmit={handleSubmit} className="bg-white border-1 border-gray-300 px-8 py-4 rounded-md shadow-md">
                    <h2 className="font-semibold text-xl">Log In</h2>
                    <h3 className="mb-8 text-gray-500 text-sm">Enter your credentials to access your account</h3>

                    <label className="block text-sm font-semibold mb-1" htmlFor="username">Username</label>
                    <input
                        className="block rounded-md border-gray-300 bg-off-white border-1 w-full mb-4 p-1"
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        type="text"
                        placeholder="Test_User"
                    />

                    <label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label>
                    <input
                        className="block rounded-md border-gray-300 bg-off-white border-1 w-full mb-4 p-1"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        type="text"
                        placeholder="************"
                    />
                    <button type="submit" className="w-full p-2 rounded-md bg-purple-400 mb-2" disabled={loading}>Log In</button>
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-fitness-primary hover:underline font-medium text-purple-400">
                            Sign up
                        </Link>
                    </p>
                    {error && <p className="text-red-500 text-sm mt-2">Log in failed. Please try again.</p>}
                </form>
            </div>
        </main>
    )
}