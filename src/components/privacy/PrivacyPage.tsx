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
    <div className="ie-page min-h-screen">
      <main className="ie-wrap max-w-[880px] pb-16 pt-8 lg:pb-24 lg:pt-14">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="ie-title mb-4">
            Privacy Policy
          </h1>
          <p className="ie-lede">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Version Selector */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                onClick={() => handleVersionChange(version.id)}
                aria-pressed={activeVersion === version.id}
                className={`rounded-[16px] px-4 py-2.5 text-left font-dmSans text-[0.93rem] font-semibold leading-snug transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ie-blue ${
                  activeVersion === version.id
                    ? 'bg-ie-indigo text-white'
                    : 'bg-white text-ie-text ring-1 ring-inset ring-ie-line hover:bg-ie-bgAlt'
                }`}
              >
                <span className="block">{version.label}</span>
                <span className="text-[0.8rem] font-normal opacity-75">{version.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="ie-legal">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
