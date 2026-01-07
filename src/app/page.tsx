import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  QrCode,
  Zap,
  BarChart3,
  Edit3,
  ArrowRight,
  Github,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <QrCode className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-xl font-bold text-white">dynQR</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full mb-8 border border-purple-500/30">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">100% Free & Open Source</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Dynamic QR Codes that
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Evolve</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Create QR codes that point to a redirect URL. Change the destination anytime without reprinting.
            Track scans and manage everything from one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-8 py-6 text-lg">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Traditional QR codes are static. dynQR codes are dynamic – the destination can change while the code stays the same.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <div className="absolute -top-4 left-6 px-3 py-1 bg-purple-600 rounded-full text-sm font-semibold text-white">1</div>
              <div className="pt-4">
                <QrCode className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Create a QR Code</h3>
                <p className="text-slate-400">
                  Enter your destination URL. We generate a QR that points to our redirect service, not directly to your URL.
                </p>
              </div>
            </div>

            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <div className="absolute -top-4 left-6 px-3 py-1 bg-purple-600 rounded-full text-sm font-semibold text-white">2</div>
              <div className="pt-4">
                <Edit3 className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Update Anytime</h3>
                <p className="text-slate-400">
                  Change where the QR points from your dashboard. No need to reprint stickers, posters, or marketing materials.
                </p>
              </div>
            </div>

            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <div className="absolute -top-4 left-6 px-3 py-1 bg-purple-600 rounded-full text-sm font-semibold text-white">3</div>
              <div className="pt-4">
                <BarChart3 className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Track Performance</h3>
                <p className="text-slate-400">
                  See how many times each QR is scanned and when. Make data-driven decisions about your marketing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Built for Simplicity</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Redirects', desc: 'Lightning-fast redirects with minimal latency' },
              { icon: QrCode, title: 'High-Quality QR', desc: 'PNG exports with error correction built-in' },
              { icon: Edit3, title: 'Real-time Updates', desc: 'Change destinations instantly from your dashboard' },
              { icon: BarChart3, title: 'Scan Analytics', desc: 'Track scan counts and last scan timestamps' },
              { icon: Github, title: 'Open Source', desc: 'MIT licensed, fork it, modify it, self-host it' },
              { icon: Sparkles, title: '100% Free', desc: 'No paywalls, no limits, no credit card required' },
            ].map((feature, i) => (
              <div key={i} className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                <feature.icon className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to create your first dynamic QR?</h2>
          <p className="text-slate-400 mb-8">No credit card required. Create unlimited QR codes for free.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-purple-400" />
            <span className="text-slate-400">dynQR - Open Source Dynamic QR Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <span className="text-sm">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
