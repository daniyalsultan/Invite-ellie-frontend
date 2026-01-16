import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrivacyConsumer } from './PrivacyConsumer';
import { PrivacyBusiness } from './PrivacyBusiness';
import { PrivacyGDPR } from './PrivacyGDPR';
import { PrivacyMinimal } from './PrivacyMinimal';
import { Footer } from '../landing/Footer';

type PrivacyVersion = 'consumer' | 'business' | 'gdpr' | 'minimal';

export function PrivacyPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const versionParam = searchParams.get('version') as PrivacyVersion | null;
  
  // Auto-detect EU users (simplified - you may want to use a more sophisticated detection)
  const isEU = Intl.DateTimeFormat().resolvedOptions().timeZone?.includes('Europe') || false;
  
  // Determine default version
  const getDefaultVersion = (): PrivacyVersion => {
    if (versionParam && ['consumer', 'business', 'gdpr', 'minimal'].includes(versionParam)) {
      return versionParam;
    }
    return isEU ? 'gdpr' : 'consumer';
  };

  const [activeVersion, setActiveVersion] = useState<PrivacyVersion>(getDefaultVersion());

  // Sync state with URL params
  useEffect(() => {
    const defaultVersion = getDefaultVersion();
    if (defaultVersion !== activeVersion) {
      setActiveVersion(defaultVersion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionParam]);

  const handleVersionChange = (version: PrivacyVersion): void => {
    setActiveVersion(version);
    setSearchParams({ version });
  };

  const versions = [
    { id: 'consumer' as PrivacyVersion, label: 'Consumer-Friendly', description: 'For general users' },
    { id: 'business' as PrivacyVersion, label: 'Business-Focused', description: 'For enterprise customers' },
    { id: 'gdpr' as PrivacyVersion, label: 'GDPR-Compliant', description: 'For EU/EEA/UK users' },
    { id: 'minimal' as PrivacyVersion, label: 'Minimalist', description: 'Quick reference' },
  ];

  const renderContent = (): JSX.Element => {
    switch (activeVersion) {
      case 'consumer':
        return <PrivacyConsumer />;
      case 'business':
        return <PrivacyBusiness />;
      case 'gdpr':
        return <PrivacyGDPR />;
      case 'minimal':
        return <PrivacyMinimal />;
      default:
        return <PrivacyConsumer />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container-ellie py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="font-spaceGrotesk text-[32px] lg:text-[48px] font-bold text-ellieBlack mb-4">
            Privacy Policy
          </h1>
          <p className="font-nunito text-[16px] lg:text-[18px] text-ellieGray">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Version Selector */}
        <div className="mb-8 border-b border-ellieGray/20">
          <div className="flex flex-wrap gap-4 lg:gap-6">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                onClick={() => handleVersionChange(version.id)}
                className={`px-4 py-2 font-nunito text-[14px] lg:text-[16px] font-semibold transition-colors border-b-2 ${
                  activeVersion === version.id
                    ? 'text-ellieBlue border-ellieBlue'
                    : 'text-ellieGray border-transparent hover:text-ellieBlack'
                }`}
              >
                <span className="block">{version.label}</span>
                <span className="text-[12px] font-normal opacity-75">{version.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
