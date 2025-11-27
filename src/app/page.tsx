import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between p-8 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">NDAVault</div>
        <Link
          href="/login"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple NDA Management Software for Agencies
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop managing NDAs in Excel. Upload, track, and never miss an expiration date.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Tracking for Free
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free forever for up to 10 NDAs
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload PDFs</h3>
            <p className="text-gray-600">Drag and drop your NDA files. We accept PDFs up to 10MB.</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Deadlines</h3>
            <p className="text-gray-600">See all your NDAs in one place with expiration dates highlighted.</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h16v-2H4v2zM4 14h16v-2H4v2zM4 9h16V7H4v2zM4 4h16V2H4v2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Never Miss Alerts</h3>
            <p className="text-gray-600">Get email reminders 30 days before any NDA expires (Pro feature).</p>
          </div>
        </div>

        <div className="mt-24 bg-gray-50 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple, Transparent Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0<span className="text-lg font-normal text-gray-600">/month</span></div>
                <ul className="space-y-3 text-gray-600 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to 10 NDAs
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Upload & track PDFs
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Manual deadline tracking
                  </li>
                </ul>
                <Link
                  href="/signup?plan=free"
                  className="w-full block text-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              <div className="bg-blue-600 rounded-xl p-8 text-white relative">
                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-sm font-semibold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <h3 className="text-xl font-semibold mb-4">Pro</h3>
                <div className="text-4xl font-bold mb-4">$49<span className="text-lg font-normal text-blue-100">/month</span></div>
                <ul className="space-y-3 text-blue-100 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited NDAs
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Automatic email alerts
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/pricing?priceId=price_pro_plan_monthly"
                  className="w-full block text-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-32 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-500">
          <p>&copy; 2024 NDAVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
