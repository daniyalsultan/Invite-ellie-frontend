import { Footer } from '../landing/Footer';

export function TermsOfServicePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-ellie py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="font-spaceGrotesk text-[32px] lg:text-[48px] font-bold text-ellieBlack mb-4">
            Terms of Service
          </h1>
          <p className="font-nunito text-[16px] lg:text-[18px] text-ellieGray mb-6">
            Effective Date: January 1, 2026
          </p>
        </div>

        {/* Introductory Paragraphs */}
        <div className="mb-8 lg:mb-12 space-y-4 font-nunito text-[16px] lg:text-[18px] text-ellieBlack">
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Volkinator Enterprises, Inc., a California corporation ("Company," "we," "us," or "our") governing your access to and use of the Invite Ellie platform, including our website at InviteEllie.ai, web application, and desktop applications for Windows and Mac (collectively, the "Service").
          </p>
          <p>
            <strong>PLEASE READ THESE TERMS CAREFULLY.</strong> By clicking "I Accept," creating an account, or otherwise accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference. If you are accepting these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms. If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <p className="p-4 bg-ellieBlue/10 rounded-lg">
            <strong>IMPORTANT NOTICE:</strong> These Terms contain a binding arbitration clause and class action waiver in Section 13, which affect your legal rights. Please read this section carefully.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 lg:space-y-12 font-nunito text-ellieBlack">
          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">1. DESCRIPTION OF SERVICE</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">1.1 Service Overview</h3>
                <p className="text-[16px] lg:text-[18px]">
                  Invite Ellie is an AI-powered meeting assistant that provides automated meeting recording, transcription, and AI-generated summaries. The Service utilizes third-party providers for meeting recording, transcription, and AI processing.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">1.2 Beta Services</h3>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  From time to time, the Company may offer beta, preview, early access, or other pre-release features ("Beta Services"). Beta Services are provided "as is" and "as available" without warranty of any kind. The Company may discontinue Beta Services at any time without notice. Your use of Beta Services is at your sole risk, and you acknowledge that Beta Services may contain bugs, errors, or other issues that could cause system failures or data loss. The limitations of liability in these Terms apply with full force to Beta Services.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">1.3 Service Not Professional Advice</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Service provides AI-generated meeting summaries and related content for informational and convenience purposes only. The Service does not provide legal, financial, medical, tax, or other professional advice. You should consult qualified professionals for advice specific to your situation. Any reliance on AI-generated content is at your own risk.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">2. ACCOUNT REGISTRATION AND ELIGIBILITY</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">2.1 Eligibility</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13 in accordance with the Children's Online Privacy Protection Act (COPPA). If we learn that we have collected personal information from a child under 13, we will delete that information promptly.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">2.2 Account Registration</h3>
                <p className="text-[16px] lg:text-[18px]">
                  To use the Service, you must create an account and provide accurate, current, and complete information. You agree to update your account information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">2.3 Account Security</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You are solely responsible for maintaining the security of your account credentials. The Company will not be liable for any loss or damage arising from your failure to protect your account credentials. You may not share your account credentials with any third party or allow any third party to access your account.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">2.4 Consent to Electronic Communications</h3>
                <p className="text-[16px] lg:text-[18px]">
                  By creating an account, you consent to receive all communications, agreements, disclosures, and notices from the Company electronically, including via email or through the Service. You agree that all agreements, notices, disclosures, and other communications provided electronically satisfy any legal requirement that such communications be in writing. You may withdraw this consent by terminating your account, but doing so will prevent you from using the Service.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">3. SUBSCRIPTION AND PAYMENT</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">3.1 Subscription Plans</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Service is offered on a freemium basis with paid subscription options. Free accounts are subject to usage limitations as described on our website. Paid subscription plans and pricing are available at InviteEllie.ai/pricing.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">3.2 Automatic Renewal</h3>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  <strong>AUTOMATIC RENEWAL NOTICE:</strong> Your paid subscription will automatically renew at the end of each billing period (monthly or annually, as applicable) at the then-current subscription rate, and your designated payment method will be charged, unless you cancel your subscription before the renewal date. You may cancel your subscription at any time through your account settings or by contacting us at the email address provided in Section 20.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">3.3 Cancellation</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You may cancel your subscription at any time by accessing your account settings and following the cancellation instructions. Cancellation will take effect at the end of your current billing period. You will continue to have access to the Service until the end of your paid period. We do not provide refunds or credits for partial subscription periods, except as required by applicable law.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">3.4 Price Changes</h3>
                <p className="text-[16px] lg:text-[18px]">
                  We reserve the right to change subscription prices at any time. For existing subscribers, we will provide at least thirty (30) days' prior notice of any price increase, and the new price will take effect at the start of the next billing period following such notice. Your continued use of the Service after the price change becomes effective constitutes your agreement to pay the modified subscription amount. If you do not agree to a price change, you may cancel your subscription before the price change takes effect.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">3.5 Payment Authorization</h3>
                <p className="text-[16px] lg:text-[18px]">
                  By providing a payment method, you authorize us to charge your designated payment method for all applicable subscription fees. You represent and warrant that you are authorized to use the payment method you provide. If your payment method fails or your account is past due, we may suspend or terminate your access to the Service. We may use third-party payment processors to process payments, and your use of such processors is subject to their terms and privacy policies.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">3.6 Taxes</h3>
                <p className="text-[16px] lg:text-[18px]">
                  All fees are exclusive of applicable taxes (including sales tax, use tax, VAT, and GST), and you are responsible for paying all applicable taxes associated with your subscription. If we are required to collect or pay taxes on your behalf, such taxes will be charged to you.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">4. AI-GENERATED CONTENT AND HUMAN VERIFICATION REQUIREMENT</h2>
            <p className="text-[16px] lg:text-[18px] mb-4">
              <strong>IMPORTANT --- PLEASE READ CAREFULLY:</strong> The Service uses artificial intelligence to generate meeting summaries, action items, and other content derived from meeting recordings. You acknowledge and agree that:
            </p>

            <ul className="list-disc list-inside space-y-3 ml-4 text-[16px] lg:text-[18px]">
              <li>
                <strong>AI-generated content may contain errors, omissions, or inaccuracies.</strong> AI systems, including those provided by OpenAI, may occasionally produce incorrect information, misinterpret spoken content, omit important details, or generate summaries that do not accurately reflect what was discussed in a meeting (commonly referred to as "hallucinations"). AI technology is inherently imperfect and continues to evolve.
              </li>
              <li>
                <strong>You are solely responsible for verifying all AI-generated content before relying on it or taking any action based on it.</strong> This includes, without limitation, any deal terms, pricing, commitments, action items, deadlines, names, dates, figures, contractual obligations, or other business-critical information contained in AI-generated summaries. You must independently verify all information before relying on it.
              </li>
              <li>
                <strong>The Company accepts no liability for any losses, damages, or adverse consequences</strong> arising from your reliance on unverified AI-generated content, including but not limited to lost revenue, lost profits, missed opportunities, incorrect commitments, failed deals, damaged business relationships, reputational harm, or any other direct, indirect, incidental, consequential, or punitive damages.
              </li>
              <li>
                <strong>Human review is required.</strong> AI-generated summaries are provided solely as a convenience tool to assist --- not replace --- human decision-making. You must maintain appropriate human oversight of all AI-generated content. No AI-generated content should be treated as a definitive record of any meeting or conversation.
              </li>
              <li>
                <strong>AI-generated content does not constitute professional advice.</strong> AI-generated summaries do not constitute legal, financial, medical, tax, accounting, or other professional advice. You should consult qualified professionals before making decisions based on meeting content.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">5. RECORDING CONSENT AND USER INDEMNIFICATION</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">5.1 Your Obligation to Obtain Consent</h3>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  Recording laws vary significantly by jurisdiction. Many U.S. states (including California, Florida, Illinois, and others) and many countries require all-party consent before recording a conversation ("two-party consent" or "all-party consent" jurisdictions). Violation of recording consent laws may result in civil liability and, in some jurisdictions, criminal penalties. <strong>You are solely responsible for understanding and complying with all applicable federal, state, local, and international laws regarding recording consent in your jurisdiction and the jurisdictions of all meeting participants.</strong>
                </p>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  Before using the Service to record any meeting, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
                  <li>Research and determine the applicable consent requirements for your meeting based on the locations of all participants</li>
                  <li>Clearly notify all participants that the meeting is being recorded and obtain their affirmative consent</li>
                  <li>Obtain such consent in compliance with all applicable laws, i.e., if any participant is located in California, express written or recorded verbal consent in accordance with California Penal Code § 632</li>
                  <li>Provide participants the opportunity to leave the meeting if they do not consent to recording</li>
                  <li>Maintain records of consent obtained, including the date, time, method of consent, and identity of consenting parties</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">5.2 Indemnification for Recording Violations</h3>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  <strong>You agree to indemnify, defend, and hold harmless</strong> Volkinator Enterprises, Inc., its parent, subsidiaries, affiliates, officers, directors, employees, agents, licensors, and suppliers (collectively, the "Indemnified Parties") from and against any and all claims, demands, actions, suits, proceedings, damages, losses, liabilities, judgments, settlements, costs, and expenses (including reasonable attorneys' fees and court costs) arising out of or related to: (i) your failure to obtain proper consent for recording; (ii) your violation of any federal, state, local, or international recording, wiretapping, eavesdropping, or privacy laws; (iii) claims arising out of any unauthorized access, use, or disclosure of meeting recordings, whether due to your conduct or failure to implement reasonable security measures, (iv) any claim by a third party that their rights were violated by your use of the recording features of the Service; or (v) your violation of any third party's privacy rights, publicity rights, or other legal rights.
                </p>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  <strong>Defense and Control.</strong> Your indemnification obligations include the obligation to defend the Indemnified Parties at your sole cost and expense with counsel reasonably acceptable to the Indemnified Parties. The Indemnified Parties reserve the right, at their own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will cooperate with the Indemnified Parties in asserting any available defenses. You will not settle any claim that adversely affects the Indemnified Parties or imposes any obligation on the Indemnified Parties without their prior written consent.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">5.3 Company Not Responsible for User Compliance</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Company provides recording technology but does not and cannot monitor whether you have obtained appropriate consent for any recording. The Company is not responsible for your compliance with recording consent laws or any other laws. The Company does not provide legal advice. The availability of recording features does not constitute legal advice, a legal opinion, or a representation that recording is lawful in any particular circumstance. You should consult with a qualified attorney regarding recording consent requirements in your jurisdiction.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">6. DATA PROCESSING AND THIRD-PARTY SERVICES</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">6.1 Role as Data Processor</h3>
                <p className="text-[16px] lg:text-[18px]">
                  With respect to meeting content (recordings, transcripts, and AI-generated summaries), the Company acts as a data processor on your behalf under applicable data protection laws, including the General Data Protection Regulation ("GDPR") and the California Consumer Privacy Act ("CCPA"). You remain the data controller and are responsible for: (i) determining the purposes and means of processing meeting content; (ii) ensuring that your use of the Service complies with applicable data protection laws; (iii) obtaining any necessary consents or authorizations from meeting participants; and (iv) responding to data subject requests related to meeting content.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">6.2 Our Obligations as Processor</h3>
                <p className="text-[16px] lg:text-[18px]">
                  As your data processor, the Company commits to: (i) process meeting content only in accordance with your documented instructions and as necessary to provide the Service; (ii) ensure that personnel authorized to process meeting content are bound by appropriate confidentiality obligations; (iii) implement appropriate technical and organizational security measures to protect meeting content; (iv) assist you, upon request, in responding to data subject requests to the extent we are able; (v) notify you without undue delay upon becoming aware of a personal data breach affecting your meeting content; and (vi) delete or return meeting content upon termination of your account, subject to applicable legal retention requirements.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">6.3 Sub-Processors</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Service utilizes third-party sub-processors to provide core functionality. A current list of sub-processors is available upon request. By using the Service, you authorize the Company to engage these sub-processors for the processing of meeting content. The Company has entered into data processing agreements with these sub-processors that include appropriate safeguards for personal data. A current list of sub-processors is available upon request. We will provide at least thirty (30) days' prior notice via email or in-Service notification before engaging any new sub-processor. If you object to a new sub-processor, you may terminate your account before the new sub-processor begins processing your data, and we will provide a pro-rata refund of any prepaid fees for the unused portion of your subscription.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">6.4 Data Retention and Deletion</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Company does not retain raw audio recordings after processing is complete. Meeting transcripts and AI-generated summaries are stored in accordance with our Privacy Policy. You may request deletion of your data by contacting us at the email address provided in Section 20. We will respond to deletion requests in accordance with applicable law, typically within 30 days.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">6.5 California Consumer Privacy Rights</h3>
                <p className="text-[16px] lg:text-[18px]">
                  If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), including the right to know what personal information we collect, the right to delete your personal information, the right to opt-out of the sale or sharing of your personal information, and the right to non-discrimination for exercising your privacy rights. We do not sell personal information. For more information about your California privacy rights and how to exercise them, please see our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">6.6 International Data Transfers</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Service is operated from the United States. If you are located outside the United States, please be aware that your data may be transferred to, stored, and processed in the United States, where our servers are located and our central database is operated. The data protection laws in the United States may differ from those in your country. By using the Service, you consent to the transfer of your data to the United States. For transfers of personal data from the European Economic Area, we rely on appropriate transfer mechanisms as described in our Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">7. ACCEPTABLE USE POLICY</h2>
            <p className="text-[16px] lg:text-[18px] mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-[16px] lg:text-[18px]">
              <li>Record meetings without proper consent from all participants as required by applicable law</li>
              <li>Violate any applicable federal, state, local, or international law, regulation, or third-party rights</li>
              <li>Record or process content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Transmit malicious code, viruses, or any code designed to interfere with the Service's operation</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or related computer systems or networks</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Use the Service for any illegal, fraudulent, or unauthorized purpose</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service</li>
              <li>Resell, sublicense, or redistribute the Service without express written authorization</li>
              <li>Use automated means (bots, scrapers, etc.) to access the Service except as expressly permitted</li>
            </ul>
            <p className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-[16px] lg:text-[18px]">
              <strong>Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account without prior notice and without refund of any prepaid fees.</strong>
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">8. INTELLECTUAL PROPERTY</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">8.1 Company Intellectual Property</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Service, including its software, algorithms, design, user interface, graphics, features, documentation, and all content provided by the Company (collectively, "Company IP"), is owned by the Company or its licensors and is protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, sell, lease, or create derivative works of any Company IP without our express written permission.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">8.2 User Content License</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You retain all ownership rights in your meeting content ("User Content"). By using the Service, you grant the Company a non-exclusive, worldwide, royalty-free, sublicensable (solely to sub-processors as necessary to provide the Service) license to use, process, store, reproduce, and display your User Content solely to the extent necessary to provide, maintain, and improve the Service. This license is transferable solely in connection with a merger, acquisition, or sale of all or substantially all of the Company's assets. This license terminates when you delete your User Content or your account, except to the extent necessary for backup, archival, or legal compliance purposes.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">8.3 Feedback</h3>
                <p className="text-[16px] lg:text-[18px]">
                  If you provide any suggestions, ideas, enhancement requests, recommendations, or other feedback regarding the Service ("Feedback"), you grant the Company a perpetual, irrevocable, worldwide, royalty-free license to use, modify, create derivative works from, and otherwise exploit such Feedback for any purpose without attribution or compensation to you.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">8.4 Trademarks</h3>
                <p className="text-[16px] lg:text-[18px]">
                  "Invite Ellie," the Invite Ellie logo, and other Company trademarks, service marks, and logos are trademarks of the Company. You may not use any Company trademarks without our prior written permission.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">9. LIMITATION OF LIABILITY</h2>
            <p className="text-[16px] lg:text-[18px] mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AND EXCEPT IN CASES OF GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR FRAUD, IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, REVENUE, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE, THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-[16px] lg:text-[18px] mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AND EXCLUDING CLAIMS ARISING FROM GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR FRAUD, THE COMPANY'S TOTAL CUMULATIVE LIABILITY FOR ANY AND ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNTS YOU ACTUALLY PAID TO THE COMPANY IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B) ONE HUNDRED DOLLARS ($100 USD).
            </p>
            <p className="text-[16px] lg:text-[18px] mb-4">
              THE COMPANY SPECIFICALLY DISCLAIMS ALL LIABILITY FOR ANY DAMAGES ARISING FROM: (I) YOUR RELIANCE ON AI-GENERATED CONTENT WITHOUT INDEPENDENT HUMAN VERIFICATION; (II) YOUR FAILURE TO OBTAIN PROPER RECORDING CONSENT AS REQUIRED BY APPLICABLE LAW; (III) ERRORS, INACCURACIES, OR OMISSIONS IN AI-GENERATED CONTENT; OR (IV) ANY ACTIONS OR DECISIONS YOU MAKE BASED ON AI-GENERATED CONTENT.
            </p>
            <p className="text-[16px] lg:text-[18px]">
              THE LIMITATIONS IN THIS SECTION APPLY REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF ANY REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">10. DISCLAIMER OF WARRANTIES</h2>
            <p className="text-[16px] lg:text-[18px] mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL CODE.
            </p>
            <p className="text-[16px] lg:text-[18px] mb-4">
              WITHOUT LIMITING THE FOREGOING, THE COMPANY DOES NOT WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; (B) THE RESULTS OBTAINED FROM THE SERVICE WILL BE ACCURATE, RELIABLE, OR COMPLETE; (C) THE QUALITY OF ANY INFORMATION OR OTHER MATERIAL OBTAINED THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS; (D) AI-GENERATED CONTENT WILL BE ACCURATE, COMPLETE, OR FREE FROM ERRORS; OR (E) ANY ERRORS IN THE SERVICE WILL BE CORRECTED.
            </p>
            <p className="text-[16px] lg:text-[18px] mb-4">
              YOU ACKNOWLEDGE THAT AI TECHNOLOGY IS INHERENTLY IMPERFECT AND THAT THE COMPANY MAKES NO GUARANTEE REGARDING THE ACCURACY OR RELIABILITY OF AI-GENERATED CONTENT. ANY MATERIAL DOWNLOADED OR OTHERWISE OBTAINED THROUGH THE SERVICE IS DONE AT YOUR OWN DISCRETION AND RISK.
            </p>
            <p className="text-[16px] lg:text-[18px]">
              NOTHING IN THIS SECTION AFFECTS ANY NON-WAIVABLE STATUTORY RIGHTS YOU MAY HAVE UNDER APPLICABLE LAW, INCLUDING YOUR RIGHTS UNDER CONSUMER PROTECTION LAWS SUCH AS THE CALIFORNIA CONSUMER LEGAL REMEDIES ACT (CLRA).
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">11. TERMINATION</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">11.1 Termination by You</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You may terminate your account at any time by following the account deletion process in your account settings or by contacting us at the email address provided in Section 20.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">11.2 Termination by Company</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Company may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice, including without limitation if we reasonably believe that you have violated these Terms or any applicable law. The Company may also terminate the Service entirely at any time.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">11.3 Effect of Termination</h3>
                <p className="text-[16px] lg:text-[18px]">
                  Upon termination: (a) your right to access and use the Service ceases immediately; (b) you remain liable for all charges incurred prior to termination; (c) we may delete your User Content in accordance with our data retention policies. Termination does not limit any other rights or remedies available to either party.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">11.4 Survival</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The following sections shall survive termination of these Terms: Section 4 (AI-Generated Content), Section 5 (Recording Consent and Indemnification), Section 6 (Data Processing), Section 7 (Acceptable Use), Section 8 (Intellectual Property), Section 9 (Limitation of Liability), Section 10 (Disclaimer of Warranties), Section 11.4 (Survival), Section 12 (Governing Law), Section 13 (Dispute Resolution and Arbitration), Section 14 (Export Compliance), and Section 17 (General Provisions).
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">12. GOVERNING LAW</h2>
            <p className="text-[16px] lg:text-[18px]">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Subject to Section 13 (Dispute Resolution and Arbitration), any dispute arising from these Terms or your use of the Service that is not subject to arbitration shall be resolved exclusively in the state or federal courts located in Sonoma County, California, and you hereby consent to the personal jurisdiction and venue of such courts.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">13. DISPUTE RESOLUTION AND ARBITRATION</h2>
            <p className="text-[16px] lg:text-[18px] mb-4 p-4 bg-ellieBlue/10 rounded-lg">
              <strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT AND TO HAVE A JURY TRIAL.</strong>
            </p>
            <p className="text-[16px] lg:text-[18px] mb-4">
              If a dispute arises under this Agreement, you and the Company agree to resolve it exclusively by final and binding arbitration administered under the Applicable Arbitration Rules, except as provided in this Section. This arbitration agreement includes a waiver of your right to pursue any claim on a class-action or representative basis.
            </p>
            <p className="text-[16px] lg:text-[18px] mb-4">
              You may opt out of this arbitration agreement by providing written notice to the Company within 30 days after first becoming subject to this Agreement.
            </p>
            <p className="text-[16px] lg:text-[18px] mb-6">
              Arbitration shall be conducted on an individual basis only. If any portion of this Section 13 (e.g., class-action waiver) is deemed unenforceable, the remainder of this arbitration provision and of this Agreement shall remain in full force and effect.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.1 Informal Dispute Resolution</h3>
                <p className="text-[16px] lg:text-[18px]">
                  Before initiating any formal dispute resolution proceeding, you agree to first contact us at the email address provided in Section 20 and attempt to resolve the dispute informally for at least thirty (30) days. During this period, both parties agree to negotiate in good faith to resolve the dispute. If we cannot resolve the dispute informally within thirty (30) days, either party may proceed with arbitration as described below.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.2 Agreement to Arbitrate</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You and the Company agree that any dispute, claim, or controversy arising out of or relating to these Terms, your use of the Service, or the relationship between you and the Company (collectively, "Disputes") that cannot be resolved through informal dispute resolution shall be resolved exclusively through final and binding individual arbitration, rather than in court, except that: (i) you may assert claims in small claims court if your claims qualify and remain in small claims court; and (ii) either party may seek injunctive or other equitable relief in court to prevent the actual or threatened infringement, misappropriation, or violation of intellectual property rights.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.3 Arbitration Rules and Forum</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The arbitration shall be administered by JAMS pursuant to its Comprehensive Arbitration Rules and Procedures (or, for claims under $250,000, the JAMS Streamlined Arbitration Rules and Procedures), as modified by this Section 13. The JAMS rules are available at www.jamsadr.com. The arbitration shall be conducted by a single arbitrator. The arbitration shall be held in Sonoma County, California, or at another mutually agreed location. If you reside outside the United States, the arbitration shall be conducted via videoconference unless otherwise agreed.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.4 Arbitration Fees</h3>
                <p className="text-[16px] lg:text-[18px]">
                  If you initiate arbitration, you will be responsible for paying the initial JAMS filing fee. However, for claims of $10,000 or less, if you can demonstrate that the costs of arbitration would be prohibitive compared to the costs of litigation, the Company will reimburse you for the filing fee upon written request. If the arbitrator finds that your claim or requested relief was frivolous or brought in bad faith, fees and costs may be allocated in accordance with applicable law. All other fees and costs will be allocated in accordance with the JAMS rules.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.5 Class Action Waiver</h3>
                <p className="text-[16px] lg:text-[18px] mb-3">
                  <strong>YOU AND THE COMPANY AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION OR PROCEEDING.</strong> The arbitrator may not consolidate more than one person's claims and may not otherwise preside over any form of a representative, class, or collective proceeding. If the class action waiver is found unenforceable with respect to particular claims, those claims shall proceed in court, while all other claims subject to arbitration shall proceed in arbitration.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.6 Waiver of Jury Trial</h3>
                <p className="text-[16px] lg:text-[18px]">
                  <strong>YOU AND THE COMPANY HEREBY WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY.</strong> You and the Company are instead electing that all Disputes shall be resolved by arbitration. In the event that this Section 13 is found not to apply to you or a particular Dispute, you still agree to waive your right to a jury trial.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">13.7 Opt-Out</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You have the right to opt out of this arbitration agreement by sending written notice of your decision to opt out to team@inviteellie.ai or by mail to Volkinator Enterprises, Inc., Attn: Arbitration Opt-Out, 1825 Sonterra Court, Santa Rosa, CA 95403, within thirty (30) days after first becoming subject to these Terms. We recommend using a delivery method that provides confirmation of receipt. Your notice must include your name, address, email address associated with your account, and an unequivocal statement that you want to opt out of this arbitration agreement. If you opt out, neither you nor the Company can require the other to participate in an arbitration proceeding. The opt-out notice does not affect any other provisions of these Terms.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">14. EXPORT COMPLIANCE</h2>
            <p className="text-[16px] lg:text-[18px]">
              The Service may be subject to U.S. export control laws and regulations. You agree to comply with all applicable export and re-export control laws and regulations, including the Export Administration Regulations maintained by the U.S. Department of Commerce, trade and economic sanctions maintained by the Treasury Department's Office of Foreign Assets Control, and the International Traffic in Arms Regulations maintained by the Department of State. You represent and warrant that you are not located in, under the control of, or a national or resident of any country to which the United States has embargoed goods or services, and that you are not a denied party as specified in any applicable export or re-export laws or regulations.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">15. GOVERNMENT USERS</h2>
            <p className="text-[16px] lg:text-[18px]">
              If you are a U.S. government user or accessing the Service on behalf of a U.S. government entity, the Service is provided as "Commercial Computer Software" and "Commercial Computer Software Documentation" as those terms are defined in 48 C.F.R. § 2.101, and the rights of the U.S. Government with respect to the Service are limited to those specifically granted in these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">16. FORCE MAJEURE</h2>
            <p className="text-[16px] lg:text-[18px]">
              The Company shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond the Company's reasonable control, including but not limited to: acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, earthquakes, accidents, strikes, labor disputes, shortages of transportation, facilities, fuel, energy, labor, or materials, failure of third-party providers, telecommunications or internet service disruptions, cyberattacks, government actions, or any other event beyond the Company's reasonable control. During such events, the Company's obligations under these Terms will be suspended to the extent affected by the force majeure event.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">17. GENERAL PROVISIONS</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.1 Entire Agreement</h3>
                <p className="text-[16px] lg:text-[18px]">
                  These Terms, together with our Privacy Policy and any other policies or agreements referenced herein, constitute the entire agreement between you and the Company regarding the Service and supersede all prior and contemporaneous agreements, proposals, representations, and understandings, whether written or oral.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.2 Severability</h3>
                <p className="text-[16px] lg:text-[18px]">
                  If any provision of these Terms is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, the validity, legality, and enforceability of the remaining provisions shall not be affected or impaired, and such provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable while preserving its original intent and the remainder of this Agreement will remain in full force and effect.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.3 Waiver</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The Company's failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of the Company to be effective.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.4 Assignment</h3>
                <p className="text-[16px] lg:text-[18px]">
                  You may not assign or transfer these Terms or your rights or obligations hereunder, in whole or in part, by operation of law or otherwise, without the Company's prior written consent. The Company may assign or transfer these Terms, in whole or in part, without restriction. Any attempted assignment in violation of this section shall be null and void. Subject to the foregoing, these Terms will bind and inure to the benefit of the parties, their successors, and permitted assigns.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.5 No Third-Party Beneficiaries</h3>
                <p className="text-[16px] lg:text-[18px]">
                  These Terms are for the sole benefit of you and the Company and do not create any third-party beneficiary rights. No third party, including any meeting participant, shall have any right to enforce any provision of these Terms.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.6 Relationship of Parties</h3>
                <p className="text-[16px] lg:text-[18px]">
                  Nothing in these Terms shall be construed to create a joint venture, partnership, employment, or agency relationship between you and the Company. Neither party has any right or authority to assume or create any obligations of any kind or to make any representations or warranties on behalf of the other party.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] lg:text-[24px] font-semibold mb-3">17.7 Headings</h3>
                <p className="text-[16px] lg:text-[18px]">
                  The section headings in these Terms are for convenience only and have no legal or contractual effect.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">18. CHANGES TO TERMS</h2>
            <p className="text-[16px] lg:text-[18px]">
              We may modify these Terms at any time by posting the revised Terms on the Service with an updated "Effective Date." For material changes, we will provide at least thirty (30) days' prior notice through the Service, by email to the address associated with your account, or by other means as required by applicable law. Your continued use of the Service after such changes become effective constitutes your acceptance of the modified Terms. If you do not agree to any modified Terms, you must discontinue your use of the Service before the changes take effect. We encourage you to review these Terms periodically.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">19. NOTICES</h2>
            <p className="text-[16px] lg:text-[18px] mb-4">
              All notices to the Company under these Terms shall be in writing and sent to:
            </p>
            <div className="ml-4 mb-4 text-[16px] lg:text-[18px]">
              <p className="font-semibold">Volkinator Enterprises, Inc.</p>
              <p>Attn: Legal Department</p>
              <p>1825 Sonterra Court, Santa Rosa, CA 95403</p>
              <p>Email: team@inviteellie.ai</p>
              <p>Website: InviteEllie.ai</p>
            </div>
            <p className="text-[16px] lg:text-[18px]">
              Notices to you may be sent to the email address associated with your account or posted on the Service. Notice shall be deemed given: (a) if by email, when sent (provided no bounce-back or error message is received); (b) if by mail, three (3) business days after mailing; or (c) if posted on the Service, when posted.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] lg:text-[32px] font-bold mb-4">20. CONTACT INFORMATION</h2>
            <p className="text-[16px] lg:text-[18px] mb-4">
              For general questions about these Terms or the Service, please contact:
            </p>
            <div className="ml-4 mb-6 text-[16px] lg:text-[18px]">
              <p className="font-semibold">Volkinator Enterprises, Inc.</p>
              <p>Email: team@inviteellie.ai</p>
              <p>Website: InviteEllie.ai</p>
            </div>
            <p className="text-[16px] lg:text-[18px] p-4 bg-ellieBlue/10 rounded-lg">
              <strong>BY CLICKING "I ACCEPT," CREATING AN ACCOUNT, OR OTHERWISE USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM, INCLUDING THE BINDING ARBITRATION CLAUSE AND CLASS ACTION WAIVER IN SECTION 13.</strong>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
