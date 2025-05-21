export default function Messages () {
    return (
        <>
        <div className="w-full h-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Messages</h1>
                </div>
                <div className="flex h-3/4">
                    {/* Sidebar for choosing different conversations */}
                    <div className="w-1/3 bg-white shadow-md rounded-lg p-4 overflow-y-auto">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 bg-gray-100 shadow-md rounded-lg p-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
                                    <img
                                        src="/path/to/avatar1.jpg"
                                        alt="Friend 1"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Friend 1</h2>
                                    <p className="text-gray-600 text-xs">"Hello, how are you?"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-100 shadow-md rounded-lg p-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
                                    <img
                                        src="/path/to/avatar2.jpg"
                                        alt="Friend 2"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Friend 2</h2>
                                    <p className="text-gray-600 text-xs">"Are we still on for tomorrow?"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-100 shadow-md rounded-lg p-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
                                    <img
                                        src="/path/to/avatar3.jpg"
                                        alt="Friend 3"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Friend 3</h2>
                                    <p className="text-gray-600 text-xs">"Don't forget the meeting!"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Conversation UI */}
                    <div className="w-2/3 flex flex-col ml-4 bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-2xl font-bold mb-4">Current Conversation</h2>
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-inner bg-white">
                            <div className="flex flex-col gap-4">
                                {/* Message from the other person */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-300 text-black rounded-lg p-3 max-w-xs">
                                        <p>"Hello, how are you?"</p>
                                    </div>
                                </div>
                                {/* Message from the user */}
                                <div className="flex justify-end">
                                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                                        <p>"I'm good, thanks! How about you?"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="border border-gray-300 focus:outline-none rounded p-2 flex-1"
                                />
                                <button className="bg-blue-500 text-white rounded-md py-2 px-4 cursor-pointer font-semibold">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        </>
    );
}