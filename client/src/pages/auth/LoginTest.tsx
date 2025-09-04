import { RiHome7Fill } from "react-icons/ri";
import { PiDotsSixBold } from "react-icons/pi";
import { BiSolidPolygon } from "react-icons/bi";
import { useState } from "react";
import usePostAndPut from "@/hooks/usePostAndPut";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import SpinLoader from './../../components/SpinLoader';
import NavBar from "@/components/NavBar";

const LoginTest = () => {
    const defaultUserData = {
        email: "",
        password: "",
    };

    const [userData, setUserData] = useState(defaultUserData);
    const { callApi, loading } = usePostAndPut(axios.post);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserData((prev) => ({ ...prev, [id]: value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await callApi("auth/login", userData, false, false, true);
        if (response?.data?.token) {
            localStorage.setItem("Authorization", `Bearer ${response.data.token}`);
            localStorage.removeItem("type")
            localStorage.setItem("type", response.data.userType);
            const params = new URLSearchParams(window.location.search);
            if (params.size !== 0) {
                const afterLogin = params.get("after_login");
                const decoded = decodeURIComponent(afterLogin as string);
                navigate(decoded);
                localStorage.removeItem('after_login')
            }
            else {
                localStorage.removeItem('after_login')
                navigate(`/${response.data.userType}/prescreen_interview`);
            }
        }
    };




    return (
        <div className="flex flex-col h-screen w-full" >
            <NavBar/>
            <div className="flex-1  flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full  max-w-5xl bg-white rounded-2xl shadow-sm overflow-hidden flex  flex-col lg:flex-row">
                    <div className="flex flex-col w-full lg:w-1/2  items-start justify-start p-6 ">
                        <div className="w-full  flex items-center justify-center h-full ">
                            <div className="flex flex-col justify-center items-center w-full">
                                <div className="w-full max-w-sm">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 rounded-md
                                      bg-gradient-to-tr from-[#484f98] to-[#1a237e]
                                    flex items-center justify-center text-white font-bold">
                                            <span>BA</span>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-semibold mb-1">Get Started</h2>
                                    <p className="text-gray-500 mb-8">
                                        Welcome to <b>Bussiness Automation</b>
                                    </p>

                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="his@bussinessautomation.com"
                                                onChange={handleInputChange}
                                                className="mt-1 w-full  border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center">
                                                <label className="block text-sm font-medium text-gray-600">
                                                    Password
                                                </label>
                                                
                                            </div>
                                            <input
                                                type="password"
                                                id="password"
                                                onChange={handleInputChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a237e] focus:outline-none"
                                            />
                                        </div>


                                        {
                                            loading ?
                                                <button
                                                    disabled={loading}
                                                    type="submit"
                                                    className="w-full py-3 rounded-lg 
  bg-gradient-to-tr from-[#484f98] to-[#1a237e]
  text-white flex items-center justify-center gap-3 
  font-medium transition opacity-50 hover:opacity-100"
                                                >
                                                    <span>
                                                        Please wait
                                                    </span>
                                                    <SpinLoader />
                                                </button>
                                                : <button type="submit"
                                                    className="w-full py-3 rounded-lg 
                                          bg-gradient-to-tr from-[#484f98] to-[#1a237e]
                                            text-white font-medium transition"
                                                >
                                                    Login
                                                </button>
                                        }


                                    </form>

                                    <p className="mt-6 text-sm text-gray-500">
                                        if you have an account?{" "}
                                        <Link to="/signup" className="text-black font-bold hover:underline">
                                            Signup
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-tr from-[#484f98] to-[#1a237e] w-full lg:w-1/2 rounded-[10px] h-[400px] lg:h-[650px] text-white flex flex-col items-center justify-center px-3 py-10  relative">
                        <div className="max-w-sm w-full">
                             <h2 className="leading-tight space-y-4">
                                <div className="merriweather italic text-4xl lg:text-5xl tracking-normal">
                                    Powering businesses with 
                                </div>
                                <div className="roboto text-3xl lg:text-5xl tracking-tight">
                                    smart automation
                                </div>
                            </h2>

                            <div className="mt-8 flex flex-row items-end justify-end gap-3">

                                <div className="text-gray-300 px-4 py-6 rounded-lg flex flex-col items-center justify-center gap-6 bg-white">
                                    <RiHome7Fill size={24} className="text-gray-700" />
                                    <PiDotsSixBold size={24} className="text-gray-700" />
                                    <BiSolidPolygon size={24} className="text-gray-700" />
                                </div>

                                <div className="bg-white text-gray-900 rounded-lg h-[220px] lg:h-[300px] min-w-60 flex flex-col items-start justify-end shadow-lg px-3 py-6">
                                    <p className="text-lg lg:text-xl font-semibold">12,347.23$</p>
                                    <p className="text-sm text-gray-500">Combined balance</p>
                                    <div className="flex w-full items-start justify-between">
                                        <div className="mt-4">
                                            <p className="text-sm font-semibold">Primary Card</p>
                                            <p className="text-xs">3456 **** **** 6917</p>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-md lg:text-lg font-semibold">2,546.64$</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center w-full justify-between">
                                        <div className="font-bold text-lg lg:text-xl italic text-gray-400">
                                            VISA
                                        </div>
                                        <button className="text-sm bg-gray-200 px-3 py-1 rounded-full text-[#1a237e] font-medium hover:underline">
                                            View All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginTest;
