import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
      <Navbar />

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-32 flex-1"
        style={{ backgroundColor: '#0F0F0F' }}
      >
        <span
          className="text-xs font-medium px-3 py-1 rounded-full mb-8 tracking-widest uppercase"
          style={{
            backgroundColor: '#6CE9FE15',
            color: '#6CE9FE',
            border: '1px solid #6CE9FE30',
          }}
        >
          Client Onboarding, Simplified
        </span>
        <h1
          className="text-6xl sm:text-7xl mb-6 leading-tight max-w-3xl"
          style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
        >
          Stop chasing clients for{' '}
          <span style={{ color: '#6CE9FE', fontStyle: 'italic' }}>project details</span>
        </h1>
        <p className="text-base max-w-xl mb-10 leading-relaxed" style={{ color: '#FEFEFE66' }}>
          OnboardKit lets you build a branded intake form, share a single link
          with your client, and receive a complete project brief — all in one
          place. No more back-and-forth on Messenger.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/portal/demo-001"
            className="px-6 py-3 rounded-lg text-sm font-medium transition"
            style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
          >
            See client view
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg text-sm font-medium transition"
            style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
          >
            Provider login
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24" style={{ backgroundColor: '#161616' }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-medium text-center mb-4"
            style={{ color: '#FEFEFE' }}
          >
            How it works
          </h2>
          <p
            className="text-sm text-center mb-16 max-w-md mx-auto"
            style={{ color: '#FEFEFE44' }}
          >
            Three simple steps to replace your messy client back-and-forth.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              <div
                key={item.step}
                className="flex flex-col gap-3 p-6 rounded-xl"
                style={{ backgroundColor: '#1C1C1C', border: '1px solid #FEFEFE08' }}
              >
                <span
                  className="text-4xl font-light"
                  style={{ fontFamily: 'Cormorant, serif', color: '#6CE9FE' }}
                >
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold" style={{ color: '#FEFEFE' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#FEFEFE44' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24" style={{ backgroundColor: '#0F0F0F' }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-medium text-center mb-4"
            style={{ color: '#FEFEFE' }}
          >
            Everything you need
          </h2>
          <p
            className="text-sm text-center mb-16 max-w-md mx-auto"
            style={{ color: '#FEFEFE44' }}
          >
            Built specifically for freelancers and small business owners who
            want to look professional from day one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="rounded-xl p-6 transition"
                style={{ backgroundColor: '#161616', border: '1px solid #FEFEFE08' }}
              >
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: '#6CE9FE' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#FEFEFE44' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-24" style={{ backgroundColor: '#161616' }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-medium text-center mb-16"
            style={{ color: '#FEFEFE' }}
          >
            Built for people like you
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                quote:
                  'I used to spend hours chasing clients for their project details. Now they fill out the form and I get everything I need in one go.',
                name: 'Maria Santos',
                role: 'Freelance Graphic Designer',
              },
              {
                quote:
                  'Our print shop handles dozens of orders a week. OnboardKit made our intake process look professional and saved us so much time.',
                name: 'Juan Reyes',
                role: 'Owner, Reyes Print Shop',
              },
              {
                quote:
                  'As a photographer, first impressions matter. Sending clients a clean portal link instead of a Messenger thread changed everything.',
                name: 'Anna Lim',
                role: 'Portrait Photographer',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-4 p-6 rounded-xl"
                style={{ backgroundColor: '#1C1C1C', border: '1px solid #FEFEFE08' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: '#FEFEFE66' }}>
                  "{item.quote}"
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-medium" style={{ color: '#FEFEFE' }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#FEFEFE44' }}>
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-24 text-center"
        style={{ backgroundColor: '#0F0F0F', borderTop: '1px solid #FEFEFE08' }}
      >
        <h2
          className="text-4xl mb-4"
          style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
        >
          Ready to streamline your onboarding?
        </h2>
        <p
          className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
          style={{ color: '#FEFEFE44' }}
        >
          Try the demo now — no sign up required. See exactly what your clients
          will experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/portal/demo-001"
            className="px-6 py-3 rounded-lg text-sm font-medium transition"
            style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
          >
            Try client view
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg text-sm font-medium transition"
            style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
          >
            Provider login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-6 text-center text-xs"
        style={{
          backgroundColor: '#0F0F0F',
          borderTop: '1px solid #FEFEFE08',
          color: '#FEFEFE22',
        }}
      >
        OnboardKit — Built with React, Express, and MongoDB.
      </footer>
    </div>
  );
}