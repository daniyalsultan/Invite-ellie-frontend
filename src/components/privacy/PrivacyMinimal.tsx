export function PrivacyMinimal(): JSX.Element {
  return (
    <div className="ie-legal space-y-8 lg:space-y-10">
      <div>
        <h2 className="font-display font-bold leading-[1.15] tracking-[-0.03em] mb-4 text-[1.5rem] lg:text-[1.8rem]">Privacy Basics</h2>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">What We Do With Your Meetings:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Record and transcribe when you ask us to</li>
          <li>Generate summaries and action items</li>
          <li>Store for time periods you control (defaults: 30 days audio / 90 days transcripts)</li>
          <li>Delete automatically or when you request</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">Recording Consent:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Our bot announces recording to all participants</li>
          <li>Participants consent by staying in the meeting</li>
          <li>Hosts are responsible for ensuring consent</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">What We DON'T Do:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>We don't use your meetings to train AI models</li>
          <li>We don't sell your data</li>
          <li>We don't share with anyone except our secure AI partners (OpenAI, Recall.ai)</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">Special Data Notice:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Voice recordings are biometric data</li>
          <li>Meetings may contain sensitive topics (health, politics, religion)</li>
          <li>We protect this data with encryption and strict access controls</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">Your Controls:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Set how long we keep your data (audio and transcripts)</li>
          <li>Download your data anytime (JSON export)</li>
          <li>Delete anytime (gone in 24 hours from production, 30 days from backups)</li>
          <li>Edit transcripts</li>
          <li>Stop using the service</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">AI Partners:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>OpenAI: Creates summaries (30-day retention for abuse monitoring)</li>
          <li>Recall.ai: Captures meetings (retention configured by us based on your settings)</li>
          <li>Both are GDPR-compliant with Data Processing Agreements</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">Security:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Everything encrypted (AES-256 at rest, TLS 1.3 in transit)</li>
          <li>Access requires multi-factor authentication</li>
          <li>24/7 monitoring</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">International Users:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Data stored in US (EU option available)</li>
          <li>GDPR-compliant for EU users</li>
          <li>Standard Contractual Clauses for transfers</li>
          <li>Cross-border meetings use "highest standard" rule</li>
        </ul>
      </div>

      <div className="mt-8 p-6 ie-callout">
        <h3 className="font-display font-bold leading-[1.2] tracking-[-0.02em] mb-3 text-[1.15rem] lg:text-[1.3rem]">Contact:</h3>
        <ul className="space-y-2 text-[16px] lg:text-[18px] list-none">
          <li>Privacy questions: <a href="mailto:privacy@inviteellie.com" className="ie-link">privacy@inviteellie.com</a></li>
          <li>Delete your data: <a href="https://inviteellie.com/privacy" className="ie-link">inviteellie.com/privacy</a></li>
          <li>EU users: You can complain to your local data protection authority</li>
        </ul>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
