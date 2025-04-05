import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
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
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Protect Yourself from Phishing Attacks
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our advanced detection system helps you identify malicious URLs before they can harm you.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Link href="/prediction">
                  <Button className="w-full" size="lg">
                    Check URL
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">What is Phishing?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Phishing is a cybercrime where attackers disguise themselves as trustworthy entities to steal
                  sensitive information like passwords and credit card details.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Common Signs</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Suspicious URLs, spelling errors, urgent requests, and unexpected attachments are common signs of
                  phishing attempts.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">How to Stay Safe</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Verify sender identities, don't click suspicious links, use our URL checker, and keep your software
                  updated.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How Our Detection Works</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our advanced algorithm analyzes URLs for common phishing patterns and security risks.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">URL Analysis</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We examine the structure and components of URLs to identify suspicious patterns.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Domain Verification</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We check domain age, reputation, and registration details to assess legitimacy.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Content Inspection</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Our system analyzes webpage content for phishing indicators and malicious code.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Machine Learning</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      We use advanced ML models trained on thousands of phishing examples to detect new threats.
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className="mx-auto w-full max-w-sm space-y-2">
                <Link href="/prediction">
                  <Button className="w-full" size="lg">
                    Check URL Now
                  </Button>
                </Link>
              </div> */}
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

