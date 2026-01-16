export function PrivacyGDPR(): JSX.Element {
  return (
    <div className="space-y-8 lg:space-y-12 font-nunito text-ellieBlack">
      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">1. Identity and Contact Details of the Controller (Article 13(1)(a))</h2>
        <div className="space-y-2 text-[16px] lg:text-[18px]">
          <p><strong>Controller:</strong> Invite Ellie, Inc.</p>
          <p><strong>Address:</strong> 1825 Sonterra Court, CA, Santa Rosa, 95403, United States</p>
          <p><strong>Email:</strong> <a href="mailto:privacy@inviteellie.com" className="text-ellieBlue hover:underline">privacy@inviteellie.com</a></p>
          <p><strong>Website:</strong> inviteellie.com</p>
        </div>
        <div className="mt-4">
          <p className="text-[16px] lg:text-[18px]"><strong>Data Protection Officer (if appointed):</strong></p>
          <p className="text-[16px] lg:text-[18px]">Email: <a href="mailto:dpo@inviteellie.com" className="text-ellieBlue hover:underline">dpo@inviteellie.com</a></p>
        </div>
        <div className="mt-4">
          <p className="text-[16px] lg:text-[18px]"><strong>EU Representative (Article 27 - if applicable):</strong></p>
          <p className="text-[16px] lg:text-[18px]">[Company Name]</p>
          <p className="text-[16px] lg:text-[18px]">[Address]</p>
          <p className="text-[16px] lg:text-[18px]">[Contact Details]</p>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">2. Purposes of Processing and Legal Basis (Article 13(1)(c))</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">We process your personal data for the following purposes:</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">A. Meeting Recording, Transcription, and Summarization</h3>
            <p className="text-[16px] lg:text-[18px] mb-2"><strong>Legal Basis:</strong> Contract Performance - Article 6(1)(b)</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Data Processed: Audio recordings, video recordings, transcripts, meeting metadata, participant information</li>
              <li>Necessity: Required to deliver the core service you contracted for</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">B. Service Improvement and Analytics</h3>
            <p className="text-[16px] lg:text-[18px] mb-2"><strong>Legal Basis:</strong> Legitimate Interest - Article 6(1)(f)</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Data Processed: Platform usage patterns (feature clicks, error rates, session duration) - NOT your meeting content (audio, transcripts, summaries)</li>
              <li>Legitimate Interest: Improving service quality, user experience optimization, bug detection</li>
              <li>Balancing Test: Our interest in improving service quality is balanced through data minimization - we do NOT use meeting content without explicit consent</li>
              <li>Your Rights: You may object to this processing at any time (Article 21)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">C. Security Monitoring and Abuse Prevention</h3>
            <p className="text-[16px] lg:text-[18px] mb-2"><strong>Legal Basis:</strong> Legitimate Interest - Article 6(1)(f)</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Data Processed: Access logs, authentication events, API usage patterns</li>
              <li>Legitimate Interest: Protecting our service from unauthorized access, fraud prevention, maintaining service integrity</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">D. Compliance with Legal Obligations</h3>
            <p className="text-[16px] lg:text-[18px] mb-2"><strong>Legal Basis:</strong> Legal Obligation - Article 6(1)(c)</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Data Processed: Audit logs, compliance documentation, data subject rights request records</li>
              <li>Legal Obligations: GDPR, e-Privacy Directive, sector-specific regulations</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">E. Marketing Communications</h3>
            <p className="text-[16px] lg:text-[18px] mb-2"><strong>Legal Basis:</strong> Consent - Article 6(1)(a) OR Legitimate Interest for existing customers</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Data Processed: Name, email address, service usage information</li>
              <li>Your Rights: Withdraw consent at any time; object to processing for direct marketing (Article 21(2))</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">3. Processing of Special Categories of Personal Data (Article 9)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Your meeting recordings may contain special categories of personal data as defined in Article 9(1) GDPR:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Special Categories Potentially Processed:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Biometric data: Voice recordings constitute biometric data for the purpose of uniquely identifying a natural person</li>
            <li>Health data: Meeting transcripts may inadvertently contain information concerning health</li>
            <li>Data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs: May be discussed in meetings</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Legal Basis for Processing Special Category Data:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Article 9(2)(a): You have given explicit consent to the processing of those personal data for one or more specified purposes (meeting recording consent)</li>
            <li>Article 9(2)(f): Processing is necessary for the establishment, exercise or defense of legal claims</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Safeguards Implemented (Article 9(2)):</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Encryption: AES-256 encryption at rest, TLS 1.3 in transit</li>
            <li>Access controls: Strict role-based access control with audit logging</li>
            <li>Data minimization: Special category data not used for analytics or service improvement</li>
            <li>Purpose limitation: Processed only for meeting transcription and summarization</li>
            <li>Contractual protections: Sub-processors bound by strict data protection obligations</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Meeting Host Responsibilities:</h3>
          <p className="text-[16px] lg:text-[18px]">
            Meeting hosts are responsible for ensuring all participants are informed that special category data may be processed when meetings are recorded.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">4. Meeting Recording Consent Mechanism</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">We obtain consent from all meeting participants before recording begins:</p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Consent Implementation:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Bot announcement: Our AI assistant joins the meeting and announces: "This meeting is being recorded and transcribed by Invite Ellie"</li>
            <li>Visual notice: Clear recording indicators visible to all participants</li>
            <li>Implicit consent model: Continued participation after notice constitutes consent</li>
            <li>Right to object: Participants may leave the meeting or request cessation of recording</li>
            <li>Documentation: Consent events logged with timestamps and participant lists</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Consent Validity (Article 7 GDPR):</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Freely given: Participants can choose whether to remain in the recorded meeting</li>
            <li>Specific: Consent is specific to recording and transcription for this meeting</li>
            <li>Informed: Participants are informed of the recording purpose and data controller</li>
            <li>Unambiguous: Consent is indicated through clear affirmative action (remaining in meeting)</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Withdrawal of Consent:</h3>
          <p className="text-[16px] lg:text-[18px]">
            Participants may withdraw consent at any time by leaving the meeting or requesting the host to stop recording. Withdrawal does not affect the lawfulness of processing based on consent before its withdrawal.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Compliance Notes:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Applies to all data subjects in the meeting (including non-customers)</li>
            <li>Complies with Article 6(1)(a) and Article 9(2)(a) GDPR</li>
            <li>Meeting hosts bear primary responsibility for obtaining valid consent</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">5. Recipients of Personal Data (Article 13(1)(e))</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">Your personal data may be disclosed to the following categories of recipients:</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">A. Sub-Processors (Article 28 GDPR):</h3>
            
            <div className="space-y-4 ml-4">
              <div>
                <h4 className="text-[18px] font-semibold mb-2">OpenAI (United States)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li>Purpose: Natural language processing, summarization generation</li>
                  <li>Data Transferred: Meeting transcripts, user prompts</li>
                  <li>Safeguards: Standard Contractual Clauses (SCCs), 30-day retention for abuse monitoring</li>
                  <li>Legal Basis for Transfer: SCCs approved by European Commission</li>
                </ul>
              </div>

              <div>
                <h4 className="text-[18px] font-semibold mb-2">Recall.ai / Hyperdoc Inc. (United States)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li>Purpose: Meeting audio/video capture from third-party platforms</li>
                  <li>Data Transferred: Real-time audio/video streams, participant metadata</li>
                  <li>Safeguards: Standard Contractual Clauses (SCCs), customer-controlled retention via API, GDPR-compliant Data Processing Addendum</li>
                  <li>Legal Basis for Transfer: SCCs approved by European Commission (Commission Decision 2021/914)</li>
                  <li>UK Transfers: UK International Data Transfer Addendum incorporated</li>
                  <li>Retention: Configurable by Invite Ellie based on customer requirements - no fixed retention period imposed by processor</li>
                </ul>
              </div>

              <div>
                <h4 className="text-[18px] font-semibold mb-2">Supabase (PostgreSQL)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li>Purpose: Application database, structured data storage</li>
                  <li>Data Transferred: User account data, meeting metadata, application data</li>
                  <li>Safeguards: Standard Contractual Clauses (SCCs), AES-256 encryption</li>
                  <li>Location: EU region available (eu-central-1)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-[18px] font-semibold mb-2">Stripe (United States)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li>Purpose: Payment processing</li>
                  <li>Data Transferred: Billing information, payment card data (PCI-DSS compliant)</li>
                  <li>Safeguards: Standard Contractual Clauses (SCCs), PCI-DSS Level 1 certification</li>
                  <li>Legal Basis for Transfer: SCCs approved by European Commission</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">B. Legal Obligations and Legitimate Interests:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Competent supervisory authorities: When required by law</li>
              <li>Courts and tribunals: For legal proceedings</li>
              <li>Law enforcement: When legally obligated to do so</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Sub-Processor Changes (Article 28(2)):</h3>
            <p className="text-[16px] lg:text-[18px]">
              We will inform you of any intended changes concerning the addition or replacement of sub-processors at least 10 days in advance (Recall.ai) or 30 days in advance (other sub-processors), giving you the opportunity to object to such changes. Current sub-processor list: <a href="https://inviteellie.com/subprocessors" target="_blank" rel="noopener noreferrer" className="text-ellieBlue hover:underline">inviteellie.com/subprocessors</a>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">6. International Data Transfers (Article 13(1)(f), Chapter V)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Your personal data may be transferred to and processed in countries outside the European Economic Area (EEA):
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Transfer Destinations:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>United States: Primary data processing location (AWS us-east-1, us-west-2)</li>
            <li>United Kingdom: Available upon request for EU customers</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Legal Basis for Transfers:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Standard Contractual Clauses (SCCs): We use the European Commission's Standard Contractual Clauses (Commission Implementing Decision 2021/914) for transfers to third countries</li>
            <li>Supplementary Measures (Schrems II): Additional technical and organizational measures implemented:
              <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                <li>AES-256 encryption in transit and at rest</li>
                <li>Strict access controls minimizing access to personal data</li>
                <li>Contractual obligations on processors to resist unlawful government access requests</li>
                <li>Transfer impact assessments conducted for all transfer destinations</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Cross-Border Meeting Scenarios:</h3>
          <p className="text-[16px] lg:text-[18px]">
            When meeting participants are located in different countries, we apply the "highest standard" rule and comply with the most restrictive data protection and consent requirements applicable to any participant.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">EU Data Residency Option:</h3>
          <p className="text-[16px] lg:text-[18px]">
            Enterprise customers may request EU-only data residency (data processed and stored exclusively in EU data centers).
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">7. Retention Periods (Article 13(2)(a))</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">We retain your personal data for the following periods:</p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Meeting Content Data:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Audio recordings: Customer-configurable (default: 30 days if not specified by meeting host)</li>
            <li>Transcripts and summaries: Customer-configurable (default: 90 days if not specified by meeting host)</li>
            <li>Retention controls: Meeting hosts can configure retention periods via account settings or API</li>
            <li>Rationale: Flexible retention allows users to keep important meetings longer while automatically deleting routine content for data minimization</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Meeting Metadata:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Participant lists, timestamps, meeting IDs: Subscription duration + 90 days</li>
            <li>Rationale: Required for service delivery, billing reconciliation, and compliance obligations</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Account Data:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>User account information: Subscription duration + 365 days</li>
            <li>Rationale: Legal obligations, potential legal claims (statute of limitations)</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Audit and Compliance Logs:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Access logs, consent records, deletion confirmations: 7 years</li>
            <li>Rationale: Legal obligations, audit requirements, establishment/defense of legal claims</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Automated Deletion:</h3>
          <p className="text-[16px] lg:text-[18px]">
            All data is automatically deleted at the end of its configured or default retention period. Users may request earlier deletion (Right to Erasure - Article 17).
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Backup Data:</h3>
          <p className="text-[16px] lg:text-[18px]">
            Deleted data is removed from encrypted backups within 30 days (backup retention cycle). Backup data is encrypted and inaccessible for operational use.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">8. Data Subject Rights (Articles 15-22)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">You have the following rights under GDPR:</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right of Access (Article 15):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Obtain confirmation of whether we process your personal data</li>
              <li>Receive a copy of your personal data</li>
              <li>Receive information about processing purposes, categories, recipients, retention periods</li>
              <li>Exercise: Contact privacy@inviteellie.com or use self-service data export</li>
              <li>Response time: Within 1 month (may be extended by 2 months for complex requests)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Rectification (Article 16):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Correct inaccurate personal data</li>
              <li>Complete incomplete personal data</li>
              <li>Exercise: Update via dashboard or contact privacy@inviteellie.com</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Erasure / "Right to be Forgotten" (Article 17):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Request deletion of your personal data when:
                <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                  <li>No longer necessary for the purposes collected</li>
                  <li>You withdraw consent and no other legal basis applies</li>
                  <li>You object and no overriding legitimate grounds exist</li>
                  <li>Processed unlawfully</li>
                  <li>Required for compliance with legal obligation</li>
                </ul>
              </li>
              <li>Deletion timeline: 24 hours (production systems), 30 days (backups)</li>
              <li>Limitations: We may retain data when required by law or for establishment/defense of legal claims</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Restriction of Processing (Article 18):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Request restriction when:
                <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                  <li>Contesting accuracy of personal data</li>
                  <li>Processing is unlawful but you oppose erasure</li>
                  <li>We no longer need data but you need it for legal claims</li>
                  <li>You have objected to processing pending verification</li>
                </ul>
              </li>
              <li>Exercise: Contact privacy@inviteellie.com</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Data Portability (Article 20):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Receive your personal data in structured, commonly used, machine-readable format (JSON)</li>
              <li>Transmit data to another controller (where technically feasible)</li>
              <li>Applies to: Data provided by you and processed based on consent or contract</li>
              <li>Exercise: Use self-service data export or contact privacy@inviteellie.com</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Object (Article 21):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Object to processing based on legitimate interests (Article 6(1)(f))</li>
              <li>Absolute right to object to direct marketing</li>
              <li>We will cease processing unless we demonstrate compelling legitimate grounds that override your interests</li>
              <li>Exercise: Contact privacy@inviteellie.com or use opt-out links in marketing emails</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right Not to Be Subject to Automated Decision-Making (Article 22):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>We do not make decisions based solely on automated processing that produce legal effects or similarly significantly affect you</li>
              <li>Meeting summaries and action items are AI-assisted but subject to human review and editing</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-ellieBlue/10 rounded-lg">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Exercising Your Rights:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Email: privacy@inviteellie.com</li>
            <li>Online portal: inviteellie.com/privacy</li>
            <li>Response time: Within 1 month (may be extended by 2 months for complex requests)</li>
            <li>No fee: Exercising rights is free of charge (unless requests are manifestly unfounded or excessive)</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">9. Right to Lodge a Complaint (Article 13(2)(d))</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          You have the right to lodge a complaint with a supervisory authority:
        </p>
        <p className="text-[16px] lg:text-[18px] mb-4">
          If you believe we have processed your personal data in violation of GDPR, you may lodge a complaint with:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Your Local Supervisory Authority:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>The supervisory authority in the EU/EEA member state of your habitual residence, place of work, or place of alleged infringement</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Our Lead Supervisory Authority:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>[To be determined based on main establishment location]</li>
            <li>If EU establishment: Supervisory authority in member state of main establishment</li>
            <li>If no EU establishment but Article 3(2) applies: Supervisory authority in member state where data subjects are located</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Finding Your Supervisory Authority:</h3>
          <p className="text-[16px] lg:text-[18px]">
            Complete list: <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-ellieBlue hover:underline">https://edpb.europa.eu/about-edpb/board/members_en</a>
          </p>
        </div>

        <p className="mt-4 text-[16px] lg:text-[18px]">
          This right exists without prejudice to administrative or judicial remedies.
        </p>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">10. Data Protection Impact Assessment (Article 35)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          We have conducted a Data Protection Impact Assessment (DPIA) for processing meeting recordings containing special category data:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">DPIA Conclusion:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Systematic description of processing operations: Documented</li>
            <li>Assessment of necessity and proportionality: Conducted</li>
            <li>Assessment of risks to rights and freedoms: High risk identified and mitigated</li>
            <li>Measures to address risks: Implemented (encryption, access controls, data minimization)</li>
            <li>Consultation with DPO: Completed (if appointed)</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">High-Risk Processing:</h3>
          <p className="text-[16px] lg:text-[18px] mb-2">
            Processing meeting recordings is considered high-risk under Article 35(3) because:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Systematic monitoring of publicly accessible areas (meeting platforms)</li>
            <li>Processing special categories of data on a large scale (biometric data - voice)</li>
            <li>Use of new technologies (AI-powered transcription and analysis)</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Risk Mitigation Measures:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Explicit consent obtained from all meeting participants</li>
            <li>AES-256 encryption at rest and TLS 1.3 in transit</li>
            <li>Strict access controls with audit logging</li>
            <li>Data minimization (content not used for analytics)</li>
            <li>Customer-controlled retention periods</li>
            <li>Sub-processor DPAs with Article 28 guarantees</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">11. Records of Processing Activities (Article 30)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          We maintain records of processing activities in accordance with Article 30 GDPR. These records include:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
          <li>Name and contact details of the controller (and DPO if applicable)</li>
          <li>Purposes of the processing</li>
          <li>Description of categories of data subjects and personal data</li>
          <li>Categories of recipients of personal data</li>
          <li>Transfers to third countries and safeguards</li>
          <li>Envisaged time limits for erasure</li>
          <li>General description of technical and organizational security measures</li>
        </ul>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          These records are available to supervisory authorities upon request.
        </p>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">12. Security of Processing (Article 32)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Technical Measures:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Encryption: AES-256 at rest, TLS 1.3 in transit</li>
            <li>Pseudonymization: Where feasible for meeting metadata</li>
            <li>Access controls: Role-based access control (RBAC) with MFA</li>
            <li>Monitoring: 24/7 security monitoring and intrusion detection</li>
            <li>Incident response: Documented incident response procedures</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Organizational Measures:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Staff training: Data protection training for all personnel</li>
            <li>Confidentiality obligations: Contractual confidentiality requirements</li>
            <li>Security audits: Regular third-party security assessments (SOC 2)</li>
            <li>Vendor management: Due diligence on all sub-processors</li>
            <li>Business continuity: Disaster recovery and backup procedures</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Risk Assessment:</h3>
          <p className="text-[16px] lg:text-[18px]">
            We regularly assess risks to rights and freedoms of data subjects and adjust security measures accordingly.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">13. Personal Data Breach Notification (Articles 33-34)</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          In the event of a personal data breach:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Notification to Supervisory Authority (Article 33):</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Timeline: Within 72 hours of becoming aware of the breach</li>
            <li>Content: Nature of breach, categories and number of data subjects affected, likely consequences, measures taken</li>
            <li>Documentation: We maintain records of all personal data breaches</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Communication to Data Subjects (Article 34):</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>When required: If breach likely to result in high risk to rights and freedoms</li>
            <li>Timeline: Without undue delay</li>
            <li>Content: Clear and plain language describing nature of breach, contact point, likely consequences, measures taken</li>
            <li>Exemptions: When data encrypted, measures taken to mitigate risk, or disproportionate effort</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Contact for Breach Notifications:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Email: <a href="mailto:security@inviteellie.com" className="text-ellieBlue hover:underline">security@inviteellie.com</a></li>
            <li>Emergency hotline: [Phone number]</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-ellieBlue/5 rounded-lg">
        <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Contact Information</h3>
        <ul className="space-y-2 text-[16px] lg:text-[18px]">
          <li>Privacy inquiries: <a href="mailto:privacy@inviteellie.com" className="text-ellieBlue hover:underline">privacy@inviteellie.com</a></li>
          <li>Data Protection Officer: <a href="mailto:dpo@inviteellie.com" className="text-ellieBlue hover:underline">dpo@inviteellie.com</a></li>
          <li>Data subject rights portal: inviteellie.com/privacy</li>
        </ul>
        <p className="mt-4 text-[16px] lg:text-[18px]">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
