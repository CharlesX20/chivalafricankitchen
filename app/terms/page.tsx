import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service | CHIVAL African Kitchen and Bar',
  description: 'Terms of Service for CHIVAL African Kitchen and Bar',
}

export default function TermsPage() {
  return (
    <>
      <main className="pt-16 md:pt-20 min-h-screen mt-12 mb-12 bg-background">
        <div className="container-custom py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
                Terms of Service
              </h1>
              <p className="text-muted-foreground text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By using the CHIVAL African Kitchen and Bar website and services, you agree to be bound 
                  by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CHIVAL African Kitchen and Bar provides:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                  <li>Online ordering for in-person pickup</li>
                  <li>Menu browsing and item selection</li>
                  <li>Account creation and order tracking</li>
                  <li>Secure payment processing via Stripe</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>When you create an account, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Keep your account credentials secure</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>Be responsible for all activities under your account</li>
                    <li>You must be at least 18 years old to create an account</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Ordering and Payment</h2>
                <div className="space-y-3 text-muted-foreground">
                  <h3 className="font-medium">Order Process</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All orders are for <strong>in-person pickup only</strong></li>
                    <li>Pickup time must be at least 30 minutes from order placement</li>
                    <li>Orders are confirmed after successful payment</li>
                    <li>You will receive order confirmation via email</li>
                  </ul>

                  <h3 className="font-medium mt-4">Payment</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment is processed securely through <strong>Stripe</strong></li>
                    <li>We accept major credit and debit cards</li>
                    <li>All prices are in <strong>Canadian Dollars (CAD)</strong></li>
                    <li>Prices are subject to change without notice</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Order Cancellations and Refunds</h2>
                <div className="space-y-3 text-muted-foreground">
                  <h3 className="font-medium">Cancellations</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Orders can be cancelled before preparation begins</li>
                    <li>Contact us directly for cancellation requests</li>
                    <li>If your order has already started preparation, we may not be able to cancel</li>
                  </ul>

                  <h3 className="font-medium mt-4">Refunds</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Refunds are handled on a case-by-case basis</li>
                    <li>If there is an issue with your order, please contact us immediately</li>
                    <li>Refunds will be processed through Stripe to the original payment method</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Pickup Policy</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Please arrive at the scheduled pickup time</li>
                  <li>If you are late, your order will be held for up to 15 minutes</li>
                  <li>After 15 minutes, we cannot guarantee your order will still be available</li>
                  <li>Please bring your order confirmation number</li>
                  <li>Pickup location: 53 Dunlop St E, Barrie, ON L4M 1A2</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Restaurant Hours</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>Our operating hours are subject to change. Please check our website or contact us for current hours.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Default Hours:</strong> 12:00 PM – 11:59 PM Daily</li>
                    <li>We reserve the right to close early or modify hours</li>
                    <li>During closed hours, the website will display a "Closed" message</li>
                    <li>Orders cannot be placed during closed hours</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, images, logos, and graphics, is the property 
                  of CHIVAL African Kitchen and Bar and is protected by copyright laws. You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                  <li>Copy, distribute, or modify any content without permission</li>
                  <li>Use our trademarks or logos without authorization</li>
                  <li>Republish any content from this website</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>Our services are provided "as is" without warranties of any kind. We do not guarantee:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>That the website will be uninterrupted or error-free</li>
                    <li>That all menu items will be available at all times</li>
                    <li>That your use of the website will meet your expectations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, CHIVAL African Kitchen and Bar shall not be liable 
                  for any indirect, incidental, special, consequential, or punitive damages arising from your 
                  use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify and hold harmless CHIVAL African Kitchen and Bar from any claims, 
                  damages, or expenses arising from your use of our services or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of Ontario, Canada.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be posted on this page 
                  with an updated date. Continued use of our services constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>If you have questions about these Terms of Service, please contact us:</p>
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