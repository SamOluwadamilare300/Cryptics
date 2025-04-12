// components/payment-status-animation.tsx
"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Checkmark } from "./checkmark"
import { X } from "lucide-react"

interface PaymentStatusAnimationProps {
  status: 'success' | 'error' | 'pending'
  transactionData?: {
    reference: string
    amount?: number
    currency?: string
    method?: string
  }
  errorMessage?: string
}

export function PaymentStatusAnimation({ 
  status, 
  transactionData,
  errorMessage 
}: PaymentStatusAnimationProps) {
  return (
    <Card className="w-full max-w-sm mx-auto p-6 min-h-[300px] flex flex-col justify-center bg-zinc-900 dark:bg-white border-zinc-800 dark:border-zinc-200 backdrop-blur-sm">
      <CardContent className="space-y-4 flex flex-col items-center justify-center">
        {/* Animation Container */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            scale: {
              type: "spring",
              damping: 15,
              stiffness: 200,
            },
          }}
        >
          <div className="relative">
            {/* Animated Background Glow */}
            <motion.div
              className={`absolute inset-0 blur-xl rounded-full ${
                status === 'success' 
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20" 
                  : status === 'error'
                  ? "bg-red-500/10 dark:bg-red-500/20"
                  : "bg-blue-500/10 dark:bg-blue-500/20"
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
            />
            
            {/* Status Icon */}
            {status === 'success' ? (
              <Checkmark
                size={80}
                strokeWidth={4}
                color="rgb(16 185 129)"
                className="relative z-10 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]"
              />
            ) : status === 'error' ? (
              <motion.div
                className="relative z-10"
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <X 
                  size={80} 
                  strokeWidth={4} 
                  className="text-red-500 dark:text-red-600" 
                />
              </motion.div>
            ) : (
              <motion.div
                className="relative z-10 w-20 h-20 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  ease: "linear",
                  repeat: Infinity
                }}
              >
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Status Content */}
        <motion.div
          className="space-y-2 text-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Status Title */}
          <motion.h2
            className="text-lg text-zinc-100 dark:text-zinc-900 tracking-tighter font-semibold uppercase"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {status === 'success' 
              ? "Payment Successful" 
              : status === 'error'
              ? "Payment Failed"
              : "Processing Payment"}
          </motion.h2>

          {/* Success Details */}
          {status === 'success' && transactionData && (
            <motion.div
              className="flex-1 bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-3 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.6,
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="space-y-1.5 text-center">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Transaction Reference
                  </span>
                  <div className="font-mono text-sm text-emerald-500 dark:text-emerald-400 bg-zinc-800/50 dark:bg-zinc-100/50 px-2 py-1 rounded">
                    {transactionData.reference}
                  </div>
                </div>
                
                {transactionData.amount && (
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Amount Paid
                    </span>
                    <div className="text-zinc-100 dark:text-zinc-900 font-medium">
                      {transactionData.currency} {transactionData.amount.toFixed(2)}
                    </div>
                  </div>
                )}
                
                {transactionData.method && (
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Payment Method
                    </span>
                    <div className="text-zinc-100 dark:text-zinc-900 font-medium">
                      {transactionData.method}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <motion.div
              className="flex-1 bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-3 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.6,
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="text-center">
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errorMessage || 'Payment processing failed'}
                </p>
                {transactionData?.reference && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    Reference: {transactionData.reference}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}