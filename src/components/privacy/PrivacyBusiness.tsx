export function PrivacyBusiness(): JSX.Element {
  return (
    <div className="space-y-8 lg:space-y-12 font-nunito text-ellieBlack">
      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">1. Data Collection and Processing</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Invite Ellie processes the following categories of data to deliver meeting intelligence services:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Meeting Content Data:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Audio recordings (WAV/MP3 format)</li>
              <li>Video recordings (where applicable)</li>
              <li>Transcripts (text format, UTF-8 encoded)</li>
              <li>AI-generated summaries and action items</li>
              <li>Speaker identification metadata</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Meeting Metadata:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Meeting identifiers (UUID)</li>
              <li>Timestamp data (start time, end time, duration)</li>
              <li>Participant information (names, email addresses, roles)</li>
              <li>Platform integration metadata (Zoom/Teams/Google Meet identifiers)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Account and Usage Data:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>User account information (name, email, organization)</li>
              <li>Authentication credentials (hashed and salted)</li>
              <li>Service usage patterns (feature utilization, API calls)</li>
              <li>Billing and subscription information</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-ellieBlue/10 rounded-lg">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Processing Purpose:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li><strong>Contract performance:</strong> Delivering core transcription and summarization services</li>
            <li><strong>Legitimate interest:</strong> Service improvement using platform usage patterns (feature clicks, error rates, session duration) - NOT your meeting content</li>
            <li><strong>Legal obligation:</strong> Compliance with data protection laws and regulations</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">2. Meeting Recording Consent and Legal Compliance</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Invite Ellie implements a comprehensive consent mechanism to ensure compliance with recording consent laws across jurisdictions:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Technical Implementation:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Bot announcement: Our AI assistant announces presence in the meeting: "This meeting is being recorded and transcribed by Invite Ellie"</li>
            <li>Visual indicators: Prominent recording indicators displayed to all participants</li>
            <li>
              Implicit consent model: Continued participation after notice constitutes consent. <span className="text-red-600 border-b border-red-600 pb-1">In all jurisdictions requiring affirmative consent (e.g., California, Florida), meeting hosts must obtain express written or recorded verbal consent before recording begins.</span>
            </li>
            <li>Opt-out mechanism: Participants can leave the meeting or request recording cessation</li>
            <li>Consent documentation: Timestamps, participant lists, and consent events logged for compliance</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Legal Framework:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Complies with U.S. two-party consent states (CA, CT, DE, FL, IL, MD, MA, MT, NH, PA, WA)</li>
            <li>GDPR Article 6(1)(a) consent requirements</li>
            <li>Cross-jurisdictional "highest standard" approach</li>
            <li>Meeting hosts retain primary responsibility for obtaining participant consent</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">3. Data Retention and Lifecycle Management</h2>
        
        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Production Data Retention:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Audio recordings: Customer-configurable retention period (default: 30 days if not specified)</li>
            <li>Transcripts and summaries: Customer-configurable retention period (default: 90 days if not specified)</li>
            <li>Meeting metadata: Retained for subscription duration + 90 days</li>
            <li>Account data: Retained for subscription duration + 365 days (compliance requirements)</li>
            <li>Retention controls: Available via dashboard and API for programmatic configuration</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Automated Deletion:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Scheduled deletion jobs run daily at 00:00 UTC</li>
            <li>Hard deletion (no soft delete/archival for meeting content)</li>
            <li>Cryptographic erasure for encrypted data stores</li>
            <li>Deletion confirmation logs maintained for audit purposes</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Backup Retention:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Encrypted backups: 30-day retention cycle</li>
            <li>Deleted data removed from backups within 30 days</li>
            <li>Immutable snapshots: Data encrypted and inaccessible for operational use</li>
            <li>Geographic redundancy: Multi-region backup storage</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">User-Initiated Deletion:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Immediate deletion from production systems: Within 24 hours</li>
            <li>Backup purge: Within 30 days (backup retention cycle)</li>
            <li>Deletion verification: Available via API or dashboard</li>
            <li>Compliance: GDPR Article 17 (Right to Erasure), CCPA deletion rights</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">4. Sub-Processor Data Processing</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Invite Ellie engages the following sub-processors under Data Processing Agreements (DPAs):
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">AI Services:</h3>
            
            <div className="ml-4 space-y-4">
              <div>
                <h4 className="text-[18px] font-semibold mb-2">OpenAI (GPT-4)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li><strong>Purpose:</strong> Natural language processing, summarization, action item extraction</li>
                  <li><strong>Data Processed:</strong> Meeting transcripts, user prompts</li>
                  <li><strong>Retention:</strong> 30 days for abuse and misuse monitoring only. Data never used for model training (OpenAI Business tier)</li>
                  <li><strong>Compliance:</strong> SOC 2 Type II, ISO 27001, GDPR DPA executed</li>
                  <li><strong>Location:</strong> United States (primary), EU-available upon request</li>
                </ul>
              </div>

              <div>
                <h4 className="text-[18px] font-semibold mb-2">Recall.ai (Hyperdoc Inc.)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li><strong>Purpose:</strong> Meeting audio/video capture from third-party platforms</li>
                  <li><strong>Data Processed:</strong> Real-time audio/video streams, participant metadata</li>
                  <li><strong>Retention:</strong> Customer-controlled via API. Invite Ellie configures retention settings based on customer requirements. No fixed retention period imposed by Recall.ai.</li>
                  <li><strong>Compliance:</strong> SOC 2 Type II, GDPR-compliant, DPA executed with Standard Contractual Clauses</li>
                  <li><strong>Location:</strong> Cloud infrastructure (AWS/GCP), configurable US or EU data residency</li>
                  <li><strong>Data Processing Addendum:</strong> Recall.ai operates under executed DPA incorporating EU Standard Contractual Clauses and UK Addendum</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Infrastructure Services:</h3>
            
            <div className="ml-4 space-y-4">
              <div>
                <h4 className="text-[18px] font-semibold mb-2">Supabase (PostgreSQL)</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li><strong>Purpose:</strong> Application database, user authentication</li>
                  <li><strong>Data Processed:</strong> Structured application data, authentication tokens</li>
                  <li><strong>Security:</strong> Row-level security, encrypted at rest (AES-256)</li>
                  <li><strong>Location:</strong> Configurable (US/EU regions available)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-[18px] font-semibold mb-2">Stripe</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li><strong>Purpose:</strong> Payment processing</li>
                  <li><strong>Data Processed:</strong> Billing information, subscription status (PCI-DSS compliant)</li>
                  <li><strong>Security:</strong> PCI-DSS Level 1 certified</li>
                  <li><strong>Location:</strong> United States, EU-compliant</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">All sub-processors:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Operate under executed Data Processing Agreements</li>
              <li>Implement appropriate technical and organizational measures (Article 32 GDPR)</li>
              <li>Provide sub-processor change notification (10-day advance notice per Recall.ai DPA, 30-day for others)</li>
              <li>Submit to third-party security audits (SOC 2, ISO 27001)</li>
              <li>Comply with data localization requirements where applicable</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">5. Special Category Data Processing</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Invite Ellie processes special category data as defined under GDPR Article 9:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Categories Processed:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Biometric data: Voice recordings constitute biometric data for unique identification purposes</li>
            <li>Health data: Meeting transcripts may inadvertently contain health information</li>
            <li>Political opinions, religious beliefs: May be discussed in meetings and captured in transcripts</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Legal Basis (Article 9(2)):</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Article 9(2)(a): Explicit consent obtained through meeting recording consent mechanism</li>
            <li>Article 9(2)(f): Processing necessary for establishment, exercise, or defense of legal claims (audit logs, compliance)</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Technical Safeguards:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Enhanced encryption: AES-256 for special category data at rest</li>
            <li>Access controls: Role-based access control (RBAC) with audit logging</li>
            <li>Data minimization: Special category data not used for analytics or service improvement</li>
            <li>Segregation: Logical segregation of special category data where feasible</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Organizational Measures:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Staff training: Data protection training for all personnel with data access</li>
            <li>Contractual obligations: Third-party processors bound by confidentiality obligations</li>
            <li>Incident response: Dedicated procedures for special category data breaches</li>
            <li>Documentation: Records of processing activities maintained (Article 30 GDPR)</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">6. Data Subject Rights Implementation</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Invite Ellie provides comprehensive data subject rights management:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right of Access (GDPR Article 15, CCPA § 1798.110):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Self-service data export: JSON format via dashboard</li>
              <li>API endpoint: Programmatic data access for enterprise customers</li>
              <li>Response timeline: Within 30 days (GDPR), 45 days (CCPA)</li>
              <li>Data categories: All personal data processed, including metadata</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Rectification (GDPR Article 16):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Transcript editing: In-app correction of transcription errors</li>
              <li>Account information updates: Self-service via dashboard</li>
              <li>Verification: User authentication required for all modifications</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Erasure (GDPR Article 17, CCPA § 1798.105):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>User-initiated deletion: Meeting-level or account-level</li>
              <li>Deletion timeline: 24 hours (production), 30 days (backups)</li>
              <li>Exceptions documented: Legal obligations, legitimate interests</li>
              <li>Confirmation provided: Deletion receipt available on request</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Data Portability (GDPR Article 20):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Structured format: JSON export of all meeting data</li>
              <li>Machine-readable: Standard data formats (JSON, CSV)</li>
              <li>Transfer capability: Direct download or API integration</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Object (GDPR Article 21):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Processing objection: Opt-out of analytics, marketing</li>
              <li>Legitimate interest balancing: Documented balancing test performed</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Right to Restrict Processing (GDPR Article 18):</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Temporary restriction: Account suspension without deletion</li>
              <li>Limited processing: Minimal data retention during restriction period</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">7. Security Architecture</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">Enterprise-grade security controls:</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Encryption:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Transport: TLS 1.3 with perfect forward secrecy</li>
              <li>At rest: AES-256-GCM with hardware security modules (HSMs)</li>
              <li>Key management: AWS KMS / Google Cloud KMS with automatic rotation</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Access Controls:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Authentication: Multi-factor authentication (MFA) required</li>
              <li>Authorization: Role-based access control (RBAC) with principle of least privilege</li>
              <li>Session management: Token-based authentication with expiration</li>
              <li>Audit logging: Comprehensive access logs retained for 90 days</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Network Security:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Infrastructure: Virtual Private Cloud (VPC) with network segmentation</li>
              <li>DDoS protection: CloudFlare enterprise tier</li>
              <li>Intrusion detection: AWS GuardDuty / Google Cloud Armor</li>
              <li>Vulnerability management: Quarterly penetration testing</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] lg:text-[24px] font-semibold mb-2">Application Security:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>OWASP Top 10: Comprehensive coverage</li>
              <li>Dependency scanning: Automated vulnerability detection</li>
              <li>Code review: Security-focused code review process</li>
              <li>Incident response: 24/7 security operations center (SOC)</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">8. International Data Transfers and Cross-Border Compliance</h2>
        <p className="text-[16px] lg:text-[18px] mb-4">
          Invite Ellie implements compliant international data transfer mechanisms:
        </p>

        <div>
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Legal Mechanisms:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Standard Contractual Clauses (SCCs): European Commission-approved SCCs (2021) for EU transfers</li>
            <li>UK Addendum: International Data Transfer Addendum for UK GDPR</li>
            <li>Swiss-U.S. Privacy Framework: Compliant for Swiss data transfers</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Supplementary Measures (Schrems II):</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Transfer impact assessments: Documented assessments for each jurisdiction</li>
            <li>Encryption: AES-256 encryption in transit and at rest</li>
            <li>Access controls: Strict access controls, U.S. government data minimization</li>
            <li>Contractual obligations: Enhanced contractual protections on all processors</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Data Localization Options:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>EU data residency: Available for enterprise customers</li>
            <li>Regional deployment: Data processed and stored in customer-specified region</li>
            <li>Geo-fencing: Prevents data from leaving specified geographic boundaries</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Cross-Border Meeting Compliance:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
            <li>Highest standard rule: Apply most restrictive participant jurisdiction requirements</li>
            <li>Multi-jurisdictional consent: Obtain consent from all participants regardless of location</li>
            <li>Compliance matrix: Maintain jurisdiction-specific compliance documentation</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">9. Limitation of Liability</h2>
        <p className="text-[16px] lg:text-[18px]">
          To the fullest extent permitted by applicable law, Invite Ellie disclaims any liability for damages arising out of unauthorized access, use, or disclosure of meeting content, except where such access results from Invite Ellie's gross negligence, willful misconduct, or material breach of this Privacy Policy.
        </p>
      </div>

      <div className="mt-8 p-6 bg-ellieBlue/5 rounded-lg">
        <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">Compliance Contacts</h3>
        <ul className="space-y-2 text-[16px] lg:text-[18px]">
          <li>Privacy inquiries: <a href="mailto:privacy@inviteellie.com" className="text-ellieBlue hover:underline">privacy@inviteellie.com</a></li>
          <li>Data Protection Officer: <a href="mailto:dpo@inviteellie.com" className="text-ellieBlue hover:underline">dpo@inviteellie.com</a></li>
          <li>Security incidents: <a href="mailto:security@inviteellie.com" className="text-ellieBlue hover:underline">security@inviteellie.com</a></li>
        </ul>
      </div>
    </div>
  );
}
