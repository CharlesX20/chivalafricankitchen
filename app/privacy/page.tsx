
export const metadata = {
  title: 'Privacy Policy | CHIVAL African Kitchen and Bar',
  description: 'Privacy Policy for CHIVAL African Kitchen and Bar',
}

export default function PrivacyPage() {
  return (
    <>
      <main className="pt-16 md:pt-20 min-h-screen mt-12 mb-12 bg-background">
        <div className="container-custom py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At CHIVAL African Kitchen and Bar ("we", "our", "us"), we take your privacy seriously. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you visit our website or use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <div className="space-y-3">
                  <h3 className="font-medium">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Email Address:</strong> Used for account verification, order confirmations, and communication.</li>
                    <li><strong>Phone Number:</strong> Used for order notifications and customer support.</li>
                    <li><strong>Name:</strong> Used for order identification and personalized service.</li>
                    <li><strong>Order Details:</strong> Items ordered, pickup time, and payment information.</li>
                  </ul>

                  <h3 className="font-medium mt-4">Automatically Collected Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Device Information:</strong> Browser type, operating system, and device type.</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent, and interactions with our website.</li>
                    <li><strong>Cookies:</strong> Session data to maintain your login state and preferences.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>To create and manage your account</li>
                  <li>To process and fulfill your orders</li>
                  <li>To send you order confirmations and updates</li>
                  <li>To communicate with you about your orders</li>
                  <li>To improve our website and services</li>
                  <li>To send you promotional offers (only with your consent)</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. How We Store Your Information</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>We store your personal information securely using:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Supabase:</strong> Our database provider with enterprise-grade security</li>
                    <li><strong>Encryption:</strong> Your data is encrypted in transit and at rest</li>
                    <li><strong>Secure Cookies:</strong> Session tokens are stored in HTTP-only cookies</li>
                    <li><strong>60-Day Sessions:</strong> You stay logged in for convenience, but can log out anytime</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. 
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                  <li><strong>Stripe:</strong> Our payment processor to handle transactions securely</li>
                  <li><strong>Resend:</strong> Our email service provider to send verification codes for a seamless login experience</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  To exercise these rights, please contact us at <strong>647-704-0171</strong> or visit us in person.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                  <li>Keep you logged in (60-day session cookie)</li>
                  <li>Remember your shopping cart</li>
                  <li>Store your theme preference (light/dark mode)</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  You can disable cookies in your browser settings, but this may affect your experience.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not directed to children under 13. We do not knowingly collect personal 
                  information from children. If you are a parent or guardian and believe your child has provided 
                  us with personal information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>If you have questions about this Privacy Policy, please contact us:</p>
                  <p>
                    <strong>CHIVAL African Kitchen and Bar</strong><br />
                    53 Dunlop St E, Barrie, ON L4M 1A2<br />
                    Phone: <a href="tel:16477040171" className="text-primary hover:underline">647-704-0171</a><br />
                    Email: <a href="mailto:africannigerianrestaurant@gmail.com" className="text-primary hover:underline">africannigerianrestaurant@gmail.com</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}