import React, { useState } from 'react';

export interface GroupedAdminTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface GroupedAdminPageProps {
  tabs: GroupedAdminTab[];
}

const GroupedAdminPage: React.FC<GroupedAdminPageProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-[#DDEAF7]" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-[#3B82F6] text-[#0A192F]'
                : 'border-transparent text-[#64748B] hover:text-[#1E3A8A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeContent}</div>
    </section>
  );
};

export default GroupedAdminPage;
