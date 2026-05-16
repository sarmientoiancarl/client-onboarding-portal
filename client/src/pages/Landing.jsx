import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 flex-1">
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Client Onboarding, Simplified
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 max-w-2xl leading-tight mb-6">
          Stop chasing clients for project details
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          OnboardKit lets you build a branded intake form, share a single link
          with your client, and receive a complete project brief — all in one
          place. No more back-and-forth on Messenger.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/portal/demo-001"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            See client view
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Provider login
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Build your form',
                description:
                  'Create a custom intake form with the questions that matter most for your projects.',
              },
              {
                step: '02',
                title: 'Share your link',
                description:
                  'Send your client a unique portal link. No account needed on their end.',
              },
              {
                step: '03',
                title: 'Receive the brief',
                description:
                  'Get a complete, organized project brief the moment your client submits.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-3xl font-bold text-gray-200">
                  {item.step}
                </span>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Custom intake forms',
                description:
                  'Add text fields, dropdowns, and text areas tailored to your service.',
              },
              {
                title: 'Shareable portal link',
                description:
                  'One unique URL per provider. Clients fill it out without signing up.',
              },
              {
                title: 'Client dashboard',
                description:
                  'See all your clients in one place with their submission status.',
              },
              {
                title: 'PDF export',
                description:
                  'Download any client brief as a PDF to keep on file or share with your team.',
              },
              {
                title: 'Progress tracking',
                description:
                  'Know exactly which clients have submitted and who still needs a nudge.',
              },
              {
                title: 'Demo mode',
                description:
                  'Try the full experience without signing up. No credit card, no account.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-900 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to streamline your onboarding?
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Try the demo now — no sign up required. See exactly what your clients
          will experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/portal/demo-001"
            className="bg-white text-gray-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            Try client view
          </Link>
          <Link
            to="/login"
            className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Provider login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-6 text-center text-xs text-gray-400">
        OnboardKit — Built with React, Express, and MongoDB.
      </footer>
    </div>
  );
}