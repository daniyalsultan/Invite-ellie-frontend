export function PrivacyConsumer(): JSX.Element {
  return (
    <div className="space-y-8 lg:space-y-12 font-nunito text-ellieBlack">
      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">1. How We Collect and Use Your Meeting Data</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          When you use Invite Ellie to record and transcribe your meetings, here's what happens with your data:
        </p>
        
        <h3 className="text-[20px] lg:text-[24px] font-semibold mt-6 mb-3">What We Collect:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Audio recordings of your meetings</li>
          <li>Transcripts (text versions of what was said)</li>
          <li>AI-generated summaries and action items</li>
          <li>Meeting metadata (date, time, duration, participants)</li>
        </ul>

        <h3 className="text-[20px] lg:text-[24px] font-semibold mt-6 mb-3">How We Use It:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>To provide the core service you signed up for: recording, transcribing, and summarizing your meetings</li>
          <li>To send you your meeting summaries and action items</li>
          <li>To improve our service quality using platform usage patterns (like which features you use most)</li>
        </ul>

        <p className="mt-4 p-4 bg-ellieBlue/10 rounded-lg text-[16px] lg:text-[18px]">
          <strong>Important:</strong> We do NOT use your meeting content to train AI models. We only use platform usage patterns (clicks, error rates, feature usage) to improve our service.
        </p>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">2. Meeting Recording Consent</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">Before recording begins, all meeting participants must consent:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Our AI assistant joins the meeting and announces: "This meeting is being recorded and transcribed by Invite Ellie"</li>
          <li>All participants see a clear notice explaining the recording</li>
          <li>By remaining in the meeting, participants consent to recording</li>
          <li>Participants who don't consent can leave or ask the host to stop recording</li>
          <li>We document consent with timestamps and participant lists for compliance</li>
        </ul>
        <p className="mt-4 p-4 bg-ellieBlue/10 rounded-lg text-[16px] lg:text-[18px]">
          <strong>Important:</strong> Meeting hosts are responsible for ensuring all participants are aware of and consent to recording before enabling Invite Ellie.
        </p>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">3. How Long We Keep Your Data</h2>
        
        <h3 className="text-[20px] lg:text-[24px] font-semibold mt-6 mb-3">Data Retention:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Audio recordings: You control retention periods through your account settings</li>
          <li>Transcripts and summaries: You control retention periods through your account settings</li>
          <li>Default retention if not configured: Audio for 30 days, transcripts for 90 days</li>
          <li>You can delete your data anytime from your dashboard</li>
        </ul>

        <h3 className="text-[20px] lg:text-[24px] font-semibold mt-6 mb-3">User-Initiated Deletion:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Immediate deletion from production systems within 24 hours</li>
          <li>Deleted data is removed from encrypted backups within 30 days (our backup retention period)</li>
          <li>Data in backups is encrypted and inaccessible for operational use</li>
        </ul>

        <h3 className="text-[20px] lg:text-[24px] font-semibold mt-6 mb-3">Why we offer flexible retention:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>You can keep important meetings longer for reference</li>
          <li>You can automatically delete routine meetings quickly for privacy</li>
          <li>Your data retention preferences are respected across all our systems</li>
        </ul>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">4. Third-Party AI Services We Use</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          We use trusted AI services to provide transcription and analysis:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">OpenAI (GPT Models):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li><strong>Used for:</strong> Generating meeting summaries and action items</li>
              <li><strong>Security:</strong> OpenAI Business tier retains data for 30 days for abuse and misuse monitoring only, then permanently deletes it. Your meeting data is never used to train AI models.</li>
              <li><strong>Compliance:</strong> SOC 2 Type II certified, GDPR-compliant</li>
              <li><strong>Location:</strong> Data processed in secure U.S. data centers</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Recall.ai (Meeting Capture):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li><strong>Used for:</strong> Capturing audio and video from meeting platforms</li>
              <li><strong>Security:</strong> Recall.ai processes meeting data according to retention settings we configure. We control how long audio is retained based on your account settings. Recall.ai is GDPR-compliant and operates under a Data Processing Agreement.</li>
              <li><strong>Compliance:</strong> Enterprise-grade security, GDPR-compliant, EU data residency available</li>
              <li><strong>Location:</strong> Data processed in secure cloud infrastructure (US or EU based on configuration)</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-[16px] lg:text-[18px]">
          All third-party services operate under strict Data Processing Agreements that require:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2 text-[16px] lg:text-[18px]">
          <li>Processing data only according to our instructions</li>
          <li>Implementing appropriate security measures</li>
          <li>Deleting data when we request it</li>
          <li>Notifying us of any security incidents</li>
        </ul>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">5. Special Category Data and Biometric Information</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Meeting recordings may inadvertently contain sensitive information:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Voice recordings are biometric data under GDPR and other privacy laws</li>
          <li>Transcripts may contain health information, political opinions, religious beliefs, or other sensitive topics discussed in meetings</li>
          <li>We implement strict access controls and encryption to protect any sensitive data captured in meetings</li>
          <li>Meeting hosts are responsible for ensuring participants are aware that sensitive data may be processed</li>
        </ul>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          <strong>Legal Basis:</strong> We process special category data based on your explicit consent (obtained through meeting recording consent) and for contract performance purposes (Article 9(2)(a) and 9(2)(f) GDPR).
        </p>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">6. Your Privacy Rights and Controls</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">You have complete control over your meeting data:</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Access Your Data:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Download all your meeting recordings, transcripts, and summaries anytime</li>
              <li>Export your data in JSON format</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Delete Your Data:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Delete individual meetings or all your data from your dashboard</li>
              <li>We'll permanently delete it from all systems within 24 hours (30 days from backups)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Correct Your Data:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Edit transcripts if our AI made mistakes</li>
              <li>Update your account information anytime</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Control Retention:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Configure how long we keep your audio and transcripts</li>
              <li>Set different retention for different types of meetings</li>
              <li>Override retention for specific important meetings</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Stop Recording:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Pause or stop Invite Ellie during any meeting</li>
              <li>Disable auto-recording in your settings</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Withdraw Consent:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>You can stop using Invite Ellie at any time</li>
              <li>Request complete deletion of your account and all associated data</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">7. Data Security</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">How we protect your meeting data:</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Encryption:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Data encrypted in transit (TLS 1.3)</li>
              <li>Data encrypted at rest (AES-256)</li>
              <li>End-to-end encryption for sensitive data</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Access Controls:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Only authorized personnel can access your data</li>
              <li>Multi-factor authentication required</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Monitoring:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>24/7 security monitoring</li>
              <li>Automated threat detection</li>
              <li>Immediate response to security incidents</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">8. International Data Transfers</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">Where your data is stored:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Primary storage: United States or European Union (based on your plan)</li>
          <li>Your data may be processed in: United States, European Union</li>
          <li>We use Standard Contractual Clauses (SCCs) approved by the European Commission for EU data transfers</li>
          <li>Additional safeguards: Encryption, access controls, contractual obligations on processors</li>
        </ul>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          <strong>Cross-Border Meetings:</strong> When meeting participants are in different countries, we apply the "highest standard" rule: We comply with the most restrictive data protection and consent requirements applicable to any participant in the meeting.
        </p>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          If you're in the European Union, your data is protected by GDPR regardless of where it's processed.
        </p>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          Your rights apply no matter where your data is stored.
        </p>
      </div>

      <div className="mt-8 p-6 bg-ellieBlue/5 rounded-lg">
        <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Contact Us</h3>
        <p className="text-[16px] lg:text-[18px]">
          For privacy inquiries, please contact us at:{' '}
          <a href="mailto:privacy@inviteellie.com" className="text-ellieBlue hover:underline">
            privacy@inviteellie.com
          </a>
        </p>
      </div>
    </div>
  );
}
