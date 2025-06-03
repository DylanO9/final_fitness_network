'use client';
import Link from "next/link";
import { useState } from "react"
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import ApiClient from "../../utils/apiClient";

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

        try {
            const { data, error } = await ApiClient.login(form.username, form.password);
            
            if (error) {
                throw new Error(error);
            }

            if (data) {
                // Save the JWT token to local storage
                localStorage.setItem('token', data.token);

                // Call the login function from AuthContext
                if (login) {
                    login(data.user);
                }

                // Add a one second delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setLoading(false);

                // Redirect to dashboard
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError(true);
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
            </div>
        );
    }

    return (
        <main className="flex flex-col min-h-screen items-center justify-center bg-[#1a1a1a]">
            <div className="max-w-lg w-md w-full">
                <h1 className="mb-8 text-lg text-center text-gray-400">Welcome back! Log in to your account</h1>

                <form onSubmit={handleSubmit} className="bg-[#2d2d2d] border-1 border-[#404040] px-8 py-4 rounded-md shadow-md">
                    <h2 className="font-semibold text-xl text-white">Log In</h2>
                    <h3 className="mb-8 text-gray-400 text-sm">Enter your credentials to access your account</h3>

                    <label className="block text-sm font-semibold mb-1 text-white" htmlFor="username">Username</label>
                    <input
                        className="block rounded-md border-[#404040] bg-[#404040] border-1 w-full mb-4 p-1 text-white placeholder-gray-500"
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        type="text"
                        placeholder="Test_User"
                    />

                    <label className="block text-sm font-semibold mb-1 text-white" htmlFor="password">Password</label>
                    <input
                        className="block rounded-md border-[#404040] bg-[#404040] border-1 w-full mb-4 p-1 text-white placeholder-gray-500"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        type="text"
                        placeholder="************"
                    />
                    <button type="submit" className="cursor-pointer w-full p-2 rounded-md bg-blue-600 hover:bg-blue-700 mb-2 text-white" disabled={loading}>Log In</button>
                    <p className="text-sm text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-blue-600 hover:text-blue-500 hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                    {error && <p className="text-red-500 text-sm mt-2">Log in failed. Please try again.</p>}
                </form>
            </div>
        </main>
    )
}