
'use client';

import { useState } from 'react';
import Web3 from 'web3';
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function LyxPaymentForm({ userId, affiliate }: { userId: string, affiliate: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLyxPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);

      // Convert $99 to LYX (adjust conversion rate as needed)
      const amountInLyx = web3.utils.toWei('99', 'ether');

      const tx = await web3.eth.sendTransaction({
        from: accounts[0],
        to: process.env.NEXT_PUBLIC_LYX_RECEIVING_ADDRESS,
        value: amountInLyx
      });

      // Verify payment with backend
      const response = await fetch('/api/verify-lyx-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          txHash: tx.transactionHash,
          affiliate,
          amount: amountInLyx
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('LYX Payment Error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-themeDark p-4 rounded-lg border border-themeGray">
        <h4 className="font-medium text-themeTextWhite mb-2">LYX Payment</h4>
        <p className="text-sm text-themeTextGray mb-4">
          Pay with LYX (LUKSO) tokens on the Ethereum-compatible blockchain.
          You will need a Web3 wallet like MetaMask installed.
        </p>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        {success ? (
          <div className="text-green-500 text-sm mb-4">
            Payment successful! Your group is being created...
          </div>
        ) : (
          <Button
            onClick={handleLyxPayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with LYX (99 LYX)'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}