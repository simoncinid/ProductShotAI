export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-bold text-rich-black mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> January 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Email address and password when you create an account</li>
            <li>Product images you upload for processing</li>
            <li>Prompts and generation preferences</li>
            <li>Payment information (processed securely through third-party providers)</li>
            <li>Device ID and IP address for free tier tracking</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your image generation requests</li>
            <li>Manage your account and credits</li>
            <li>Track free tier usage limits</li>
            <li>Send you service-related communications</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">3. Image Storage and Processing</h2>
          <p className="text-gray-700 leading-relaxed">
            Your uploaded images and generated images are stored securely. We use your images solely for the purpose of generating the requested product photos. We do not use your images to train AI models or share them with third parties without your consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">5. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use third-party services that may collect information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>WaveSpeed AI:</strong> We use WaveSpeed's API to process your images. Their privacy policy applies to their processing.</li>
            <li><strong>Payment Processors:</strong> Payment information is handled by secure third-party payment processors. We do not store full credit card information.</li>
            <li><strong>Hosting Providers:</strong> Our services are hosted on third-party cloud providers with industry-standard security.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">6. Cookies and Tracking</h2>
          <p className="text-gray-700 leading-relaxed">
            We use localStorage to store your device ID and authentication token. We do not use cookies for tracking purposes. Your device ID is used solely to track free tier usage limits.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">7. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">8. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your account information and generation history as long as your account is active. You can request deletion of your account and associated data at any time. Some information may be retained for legal or business purposes as required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">9. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not intended for users under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at support@productshotai.com
          </p>
        </section>
      </div>
    </div>
  )
}
