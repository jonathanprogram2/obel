import React from 'react';

const WalletModal = ({ show, onClose }) => {
    if (!show) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full  max-w-md text-white">
                <h2 className="text-xl font-bold mb-4"> 🔒 Connect Wallet</h2>
                <p className="mb-4 text-gray-300">Choose a wallet provider to connect:</p>
                <div className="flex flex-col gap-4">
                    <button className=" bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded-md">
                       🦊 MetaMask
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-500 py-2 px-4 rounded-md">
                       🌐 WalletConnect 
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-md">
                       🔗 Coinbase Wallet
                    </button>
                </div>
                <button
                    className="mt-6 text-sm text-gray-400 hover:underline"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WalletModal;