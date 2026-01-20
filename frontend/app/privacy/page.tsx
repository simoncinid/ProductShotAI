export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-bold text-rich-black mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> January 2026
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">1. Controller and Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            ProductShotAI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the data controller. For privacy matters, data subject requests, and any questions about this policy, contact us exclusively at: <strong>reservationwebbitz@gmail.com</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">2. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Account data: email, password (hashed), and account metadata</li>
            <li>Images you upload: the files themselves and associated URLs</li>
            <li>Generation data: prompts, preferences, input/output image URLs, resolution, aspect ratio</li>
            <li>Payment data: processed by third‑party payment providers; we do not store full card numbers</li>
            <li>Usage and technical data: device ID, IP address (including for free‑tier limits), and analytics (see Analytics)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">3. How We Process Your Images — Storage, CloudFront, and WaveSpeed</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Important:</strong> Your uploaded and generated images are processed as follows:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Database:</strong> We store references to your images (e.g. URLs, file identifiers) and generation metadata in our database.</li>
            <li><strong>Cloud storage and CDN:</strong> Image files are stored in cloud storage and served via a content delivery network (e.g. Amazon CloudFront or equivalent) so they can be accessed by our systems and by the AI processing service.</li>
            <li><strong>WaveSpeed (AI processing):</strong> To generate product photos, we send your image URLs to WaveSpeed. WaveSpeed receives and processes your images according to their own terms and privacy policy.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <strong>Do not upload private, confidential, or sensitive images</strong> if you are not willing to accept the risks of this processing. Images are stored, delivered via CDN, and transmitted to third‑party AI services. Although we use reasonable technical and organizational measures, we cannot eliminate all risks of unauthorized access, disclosure, or use. By uploading images, you acknowledge this and assume responsibility for the content you provide.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">4. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Provide, maintain, and improve the service (including image storage, CDN delivery, and AI processing)</li>
            <li>Process generations and manage credits</li>
            <li>Enforce free‑tier limits (device ID, IP)</li>
            <li>Send service‑related and, where permitted, marketing communications</li>
            <li>Detect and prevent fraud, abuse, and security incidents</li>
            <li>Comply with legal obligations and defend our rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">5. Legal Basis (Where Applicable)</h2>
          <p className="text-gray-700 leading-relaxed">
            Where the GDPR or similar laws apply: we process your data (i) to perform our contract with you (account, generations, payments), (ii) for our legitimate interests (security, analytics, improving the service), and (iii) where required, with your consent. You may withdraw consent where it is the sole basis, without affecting the lawfulness of prior processing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">6. Third‑Party Services and International Transfers</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>WaveSpeed:</strong> AI image processing; their privacy policy and terms govern their use of your images and data.</li>
            <li><strong>Cloud / CDN (e.g. AWS S3, CloudFront):</strong> Storage and delivery of images and static assets.</li>
            <li><strong>Payment processors:</strong> To handle payments; we do not store full payment card data.</li>
            <li><strong>Hosting and infrastructure:</strong> Our app and database are hosted on third‑party providers with industry‑standard security.</li>
            <li><strong>Vercel Analytics:</strong> To analyze usage (see Analytics).</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Some of these providers may process or store data outside your country. We rely on appropriate safeguards (e.g. Standard Contractual Clauses, adequacy decisions, or equivalent mechanisms) where required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">7. Cookies, Local Storage, and Analytics</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use localStorage (and similar technologies) for authentication tokens and device ID (for free‑tier limits). We may use essential cookies for the operation of the service.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Analytics:</strong> We use Vercel Analytics to understand how the site is used (e.g. page views, interactions). This helps us improve the service. Vercel’s practices are described in their privacy documentation. By using the site, you acknowledge this analytics processing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">8. Your Rights (Including GDPR and CCPA)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Request deletion of your account and associated data (subject to legal retention)</li>
            <li>Restrict or object to certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Lodge a complaint with a supervisory authority (e.g. in the EU/EEA)</li>
            <li>In certain jurisdictions (e.g. California): know, delete, correct, limit the sale/sharing of personal information, and non‑discrimination. We do not sell your personal information as traditionally understood.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise these rights, contact us at <strong>reservationwebbitz@gmail.com</strong>. We will respond within the timeframes required by applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">9. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain account and generation data (including image URLs and metadata) while your account is active and as needed for the service. After account deletion, we delete or anonymize data within a reasonable period, except where we must retain it for legal, tax, or legitimate business purposes (e.g. fraud prevention, dispute resolution). Deletion requests can be sent to <strong>reservationwebbitz@gmail.com</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">10. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We use appropriate technical and organizational measures (e.g. encryption in transit, access controls, secure storage) to protect your data. No transmission or storage over the internet is completely secure; we cannot guarantee absolute security. You are responsible for keeping your credentials safe and for not uploading content you are not willing to have processed as described in this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">11. Children&apos;s Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            The service is not directed to individuals under the age of 16 (or higher if required in your jurisdiction). We do not knowingly collect personal data from children. If you believe we have collected such data, please contact <strong>reservationwebbitz@gmail.com</strong> and we will delete it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">12. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy. We will post the revised version on this page and update the &quot;Last updated&quot; date. Material changes may be communicated by email or a prominent notice on the service where required by law. Continued use after the effective date constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">13. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            For any questions about this Privacy Policy or our data practices: <strong>reservationwebbitz@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
