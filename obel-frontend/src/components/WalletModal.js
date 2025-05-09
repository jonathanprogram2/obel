import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';

const WalletModal = ({ show, onClose }) => {
    const [walletAddress, setWalletAddress] = useState("");
    const [error, setError] = useState("");

   async function connectWallet () {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                console.log("Connected account:", accounts[0]);
                return accounts[0];
            } catch (error) {
                console.error("User rejected request:", error);
            }
        } else {
            alert("Please install MetaMask to use this feature.");
        }
    };

    if (!show) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md text-white">
                <h2 className="text-xl font-bold mb-4"> 🔒 Connect Wallet</h2>

                {walletAddress ? (
                    <div className="mb-4">
                        <p className="text-green-400">✅ Connected!</p>
                        <p className="break-all text-sm mt-2">{walletAddress}</p>
                    </div>    
                ) : (
                    <>
                        <button
                            onClick={connectWallet}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded w-full mb-4"
                        >
                            🦊 Connect MetaMask
                        </button>  
                        {error && <p className="text-red-400 text-sm">{error}</p>}  
                    </>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-400 hover:underline"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WalletModal;