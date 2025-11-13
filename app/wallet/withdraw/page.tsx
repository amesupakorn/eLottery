"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpCircle, X, Banknote, ChevronLeft } from "lucide-react";
import axios from 'axios';
import api from "@/lib/axios";
import Link from "next/link";
import { useAlert } from "@/context/AlertContext";

const bankOptions = [
	{ 
		id: 'ttb', 
		name: 'ทีทีบี (ttb)', 
		iconUrl: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_ttb@2x.png' 
	},
	{ 
		id: 'kbank', 
		name: 'กสิกรไทย (KBank)', 
		iconUrl: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_kbank@2x.png'
	},
	{ 
		id: 'scb', 
		name: 'ไทยพาณิชย์ (SCB)', 
		iconUrl: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_sb@2x.png'
	},
	{ 
		id: 'bbl', 
		name: 'กรุงเทพ (BBL)', 
		iconUrl: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_bbl@2x.png'
	},
	{ 
		id: 'ktb', 
		name: 'กรุงไทย (KTB)', 
		iconUrl: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_ktb@2x.png'
	},
	{ 
		id: 'bay', 
		name: 'กรุงศรี (BAY)', 
		iconUrl: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_krungsri@2x.png'
	},
];

export default function WithdrawAmount() {
    const [currentBalance, setCurrentBalance] = useState(0);
	const [amount, setAmount] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('');
    const { setError, setSuccess } = useAlert();
    
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await api.get('/wallet')
                setCurrentBalance(response.data.balance);
            }
            catch (error) {
                console.error('Error fetching balance:', error);
            }
            finally {
                console.log('Fetch balance attempt finished.');
            }
        };
        fetchBalance();
    }, []);

	const handleConfirm = async () => {
        const postData = {
            amount: Number(amount),
            paymentMethod: paymentMethod,
        };

        console.log('ข้อมูลการถอนเงิน:', postData);
        try {
            const response = await axios.post(`/api/wallet/withdraw`, postData); 
            setCurrentBalance(response.data.balance);
            setSuccess(`ถอนเงินสำเร็จจำนวน: ${amount}`);
        } catch (error) {
            setError('ถอนเงินไม่สำเร็จ');

        }
        setAmount('');
        setPaymentMethod('');
    };

	const isFormValid = amount && Number(amount) > 0 && Number(amount) <= currentBalance && paymentMethod;

	return (
        <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
            <header className="sticky top-0 z-30 bg-gray-500/20 backdrop-blu">
                <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
                <Link href="/wallet" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-base font-semibold text-white">ถอนเงินจากกระเป๋า</h1>
                </div>
            </header>
            
            <div className="mx-auto w-full max-w-md px-6 py-5 space-y-5 bg-white rounded-2xl mt-12">   
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 rounded-full bg-emerald-100 p-2 text-emerald-600">
                        <ArrowUpCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">ถอนเงิน</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            เลือกจำนวนเงินและบัญชีธนาคารที่จะรับเงิน
                        </p>
                    </div>
                </div>


                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">ยอดเงินคงเหลือ</span>
                        <span className="text-xl font-semibold text-gray-900">
                            ฿{currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="mt-6 space-y-6">


                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            จำนวนเงิน (บาท)
                        </label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Banknote className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="ระบุจำนวนเงิน"
                                className="block w-full py-2 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-lg text-black pl-10"
                            />
                        </div>
                        {amount && Number(amount) > currentBalance && (
                            <p className="mt-1 text-sm text-red-600">ยอดเงินของคุณไม่เพียงพอ</p>
                        )}
                    </div>

                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            เลือกช่องทางการชำระเงิน
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {bankOptions.map((bank) => (
                                <button
                                    type="button"
                                    key={bank.id}
                                    onClick={() => setPaymentMethod(bank.id)}
                                    className={`
                                        flex flex-col h-28 w-full items-center justify-center rounded-lg border p-2 text-center text-xs transition-all gap-2
                                        ${
                                            paymentMethod === bank.id
                                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-offset-1 ring-emerald-500 text-emerald-800 font-semibold' 
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50' 
                                        }
                                    `}
                                >

                                    <img
                                        src={bank.iconUrl}
                                        alt={`${bank.name} logo`}
                                        className="h-12 w-12 object-contain rounded-full"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://placehold.co/48x48/CCCCCC/FFFFFF?text=?&font=sans-serif';
                                        }}
                                    />
                                    <span className="leading-snug font-medium">{bank.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                
                <div className="mt-8">
                    <button
                        onClick={handleConfirm}
                        disabled={!isFormValid} 
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ArrowUpCircle size={20} />
                        <span>ยืนยันการถอน</span>
                    </button>
                </div>
            </div>
        </main>
	);
}
