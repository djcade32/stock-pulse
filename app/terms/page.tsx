"use client";

import React from "react";

const TermsAndConditions = () => {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-white">Terms & Conditions</h1>
      <p className="mb-6 text-sm text-gray-400">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-4">
        <p>
          Welcome to <strong>StockWisp</strong>. These Terms & Conditions (“Terms”) govern your use
          of our website and services. By accessing or using StockWisp, you agree to be bound by
          these Terms. If you do not agree, please do not use our services.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">1. Overview</h2>
        <p>
          StockWisp provides tools and insights that help users analyze financial data and sentiment
          related to publicly traded companies. The content and features we provide are for
          informational and educational purposes only — not for financial, investment, or trading
          advice.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">2. Eligibility</h2>
        <p>
          To use StockWisp, you must be at least 18 years old and capable of entering into legally
          binding agreements. By using the platform, you confirm that you meet these requirements.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">3. Account Registration</h2>
        <p>
          You may create an account using your Google, X (Twitter), or email credentials. You are
          responsible for maintaining the confidentiality of your login information and for all
          activities that occur under your account. StockWisp is not liable for any loss or damage
          arising from unauthorized account access.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">4. Use of the Service</h2>
        <p>
          You agree to use StockWisp only for lawful purposes and in accordance with these Terms.
          You may not:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Use the platform for any fraudulent, illegal, or unauthorized purpose.</li>
          <li>Access or attempt to access other users’ accounts without permission.</li>
          <li>Reverse engineer, modify, or decompile any part of the website or its systems.</li>
          <li>Scrape, harvest, or misuse any content or data from StockWisp.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 text-white">5. Financial Disclaimer</h2>
        <p>
          The insights, sentiment analysis, and financial data displayed on StockWisp are for
          informational and educational purposes only. StockWisp does <strong>not</strong> provide
          financial, investment, or trading advice. You should conduct your own research or consult
          a licensed financial advisor before making any investment decisions.
        </p>
        <p>
          We are not responsible for any financial loss, gain, or decision made based on information
          obtained through StockWisp.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">6. AI-Generated Content</h2>
        <p>
          Some insights on StockWisp are generated using artificial intelligence. While we strive
          for accuracy, these outputs may contain errors or inaccuracies and should not be relied
          upon as definitive statements. You assume all responsibility for how you interpret or use
          AI-generated content.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">7. Intellectual Property</h2>
        <p>
          All content, code, features, and design elements of StockWisp are the property of
          StockWisp and are protected under copyright, trademark, and other intellectual property
          laws. You may not copy, distribute, or create derivative works from our materials without
          written permission.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">8. Third-Party Services</h2>
        <p>
          StockWisp integrates with third-party services such as Google Analytics, Mixpanel, and
          Firebase. We are not responsible for the content, privacy practices, or reliability of
          these third-party providers. Your use of third-party services is subject to their
          respective terms and policies.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, StockWisp and its affiliates, officers, or
          employees are not liable for any indirect, incidental, special, or consequential damages
          resulting from your use of (or inability to use) our services, even if we were advised of
          the possibility of such damages.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">10. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to StockWisp at any time for
          violation of these Terms or for any behavior we deem harmful to the platform or other
          users.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">11. Changes to These Terms</h2>
        <p>
          We may update these Terms periodically. Any updates will be reflected in the “Last
          updated” date above. By continuing to use StockWisp after revisions are made, you agree to
          the updated Terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">12. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of the United States
          and the District of Columbia, without regard to its conflict of law principles.
        </p>

        <h2 className="text-xl font-semibold mt-8 text-white">13. Contact Us</h2>
        <p>
          If you have any questions about these Terms or our services, please contact us at{" "}
          <a href="mailto:support@stockwisp.com" className="text-blue-400 underline">
            support@stockwisp.com
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default TermsAndConditions;
