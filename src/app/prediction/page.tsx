"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Check, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PredictionPage() {
  const router = useRouter();
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<null | { safe: boolean; score: number }>(null)
  const [loading, setLoading] = useState(false)
  
  const handleCheck = async () => {
    if (!url) return

    setLoading(true)

    // This is where you would connect to your backend
    // For demo purposes, we'll simulate a response after a delay
    setTimeout(() => {
      // Simulate a result - in a real app, this would come from your backend
      const isSafe = Math.random() > 0.5
      setResult({
        safe: isSafe,
        score: isSafe ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3,
      })
      setLoading(false)
    }, 1500)
  }

  const handleClear = () => {
    setUrl("")
    setResult(null)
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            <span>PhishGuard</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium underline-offset-4 hover:underline">
              Home
            </Link>
            <Link href="/prediction" className="text-sm font-medium underline-offset-4 hover:underline">
              Prediction
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl space-y-8">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">URL Phishing Detection</h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Enter a URL below to check if it's potentially malicious
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter URL (e.g., https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleCheck} disabled={!url || loading}>
                    {loading ? "Checking..." : "Check"}
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>

                {result && (
                  <Alert variant={result.safe ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {result.safe ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertTitle>{result.safe ? "Safe URL Detected" : "Potential Phishing Detected"}</AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      {result.safe
                        ? `This URL appears to be safe with a phishing probability of ${Math.round(result.score * 100)}%.`
                        : `This URL may be malicious with a phishing probability of ${Math.round(result.score * 100)}%.`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">How to use the URL checker</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Enter the complete URL you want to check in the input field above</li>
                  <li>Click the "Check" button to analyze the URL</li>
                  <li>Wait for our system to process and evaluate the URL</li>
                  <li>Review the results to determine if the URL is safe or potentially malicious</li>
                  <li>Use the "Clear" button to reset the form and check another URL</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2023 PhishGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

