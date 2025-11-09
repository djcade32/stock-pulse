"use client";

import React from "react";

const PrivacyPolicy = () => {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
      <p className="mb-6 text-sm text-gray-400">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-4">
        <p>
          Welcome to <strong>StockWisp</strong>. This Privacy Policy explains how we collect, use,
          and protect your information when you use our website and services. By using StockWisp,
          you agree to the terms outlined in this policy.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">1. Information We Collect</h2>
        <p>We collect the following types of information when you use StockWisp:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>Account Information:</strong> When you sign in using Google, X (Twitter), or
            email and password, we collect your name, email address, and authentication information
            to create and manage your account.
          </li>
          <li>
            <strong>Usage Data:</strong> We collect non-identifiable information about how you use
            StockWisp, such as which pages you visit and interactions you make. This helps us
            improve our product.
          </li>
          <li>
            <strong>Analytics Data:</strong> We use Google Analytics and Mixpanel to collect usage
            data and help us understand how users interact with StockWisp. This data may include
            your device type, browser, operating system, session duration, actions taken within the
            app (such as searches or feature usage), and general location (city-level). This
            information helps us improve product performance, user experience, and new feature
            development.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 text-white">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Provide and maintain the functionality of StockWisp.</li>
          <li>Analyze stock sentiment and financial reports using AI.</li>
          <li>Improve user experience and platform performance.</li>
          <li>Respond to user inquiries and support requests.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 text-white">3. Data Storage and Security</h2>
        <p>
          Your account information and preferences are securely stored using Firebase. We implement
          reasonable administrative and technical safeguards to protect your data from unauthorized
          access, disclosure, or misuse. However, please remember that no method of transmission
          over the Internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">4. Data Sharing</h2>
        <p>
          We do not sell or rent your personal data to anyone. We may share limited information only
          in the following cases:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            With service providers that help us operate our website (e.g., Firebase, Google
            Analytics).
          </li>
          <li>
            With Mixpanel, which helps us analyze how users engage with the platform. Mixpanel
            processes data on our behalf in accordance with their{" "}
            <a
              href="https://mixpanel.com/legal/privacy-policy/"
              className="text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            .
          </li>
          <li>When required by law, legal process, or government request.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 text-white">5. Cookies and Tracking</h2>
        <p>
          StockWisp uses cookies through Google Analytics to understand how users interact with our
          site. Cookies help us analyze web traffic and usage patterns but do not identify you
          personally.
        </p>
        <p>
          You can control or delete cookies through your browser settings. Disabling cookies may
          limit certain features of StockWisp.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">6. AI-Generated Insights</h2>
        <p>
          StockWisp uses AI to analyze financial reports and generate sentiment insights about
          companies and stocks. These analyses are automated and not based on personal information.
          No user data is processed for AI training or third-party AI use.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">7. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, or delete your
          personal information. To exercise these rights or request data deletion, please contact us
          at{" "}
          <a href="mailto:support@stockwisp.com" className="text-blue-400 underline">
            support@stockwisp.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">8. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide
          services. You may delete your account at any time through your profile settings or by
          contacting us directly.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">9. Children’s Privacy</h2>
        <p>
          StockWisp is not intended for use by children under 18 years of age. We do not knowingly
          collect personal information from children. If we learn that a child has provided personal
          data, we will delete it promptly.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the “Last
          updated” date above. Your continued use of StockWisp after changes are made constitutes
          acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">11. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or your data, please
          contact us at{" "}
          <a href="mailto:support@stockwisp.com" className="text-blue-400 underline">
            support@stockwisp.com
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
