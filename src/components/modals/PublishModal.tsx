import React, { useState } from 'react';
import {
  X,
  GitBranch,
  GitPullRequest,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Code2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { LanguageCode } from '../../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, lang }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const repoName = 'hisap-kitap-store-ledger';

  const commands = [
    {
      title: '1. Initialize Git Repository (if not already initialized)',
      code: 'git init\ngit add .',
    },
    {
      title: '2. Commit your updated app files',
      code: `git commit -m "Update Hisap Kitap store ledger & billing app v1.0"`,
    },
    {
      title: '3. Add your remote GitHub or GitLab repository',
      code: `# For GitHub:\ngit remote add origin https://github.com/your-username/${repoName}.git\n\n# For GitLab:\ngit remote add origin https://gitlab.com/your-username/${repoName}.git`,
    },
    {
      title: '4. Push code to main branch',
      code: 'git branch -M main\ngit push -u origin main',
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26313B] bg-[#161C23]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#17D5B3]/10 border border-[#17D5B3]/30 text-[#17D5B3]">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB] flex items-center gap-2">
                Publish to GitHub or GitLab
              </h3>
              <p className="text-xs text-[#A8B5C2]">
                Push your updated Hisap Kitap app to your version control repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#A8B5C2] hover:text-[#F4F8FB] hover:bg-[#26313B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#A8B5C2]">
          {/* Quick Intro Banner */}
          <div className="p-4 rounded-xl bg-[#17D5B3]/10 border border-[#17D5B3]/30 text-[#F4F8FB] text-xs leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#17D5B3] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#17D5B3] block mb-1">Ready for Production Deployment</span>
              Your application contains a full-stack React Vite frontend and Express backend (`server.ts`), configured with TypeScript, Tailwind CSS, and local/cloud data persistence. Follow the simple terminal steps below to push your codebase to GitHub or GitLab.
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {commands.map((cmd, idx) => (
              <div key={idx} className="bg-[#161C23] border border-[#26313B] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F4F8FB] flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#17D5B3]" />
                    {cmd.title}
                  </span>
                  <button
                    onClick={() => handleCopy(cmd.code, idx)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/50 text-xs text-[#F4F8FB] font-medium transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#17D5B3]" />
                        <span className="text-[#17D5B3]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#A8B5C2]" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#050608] border border-[#26313B] text-[#17D5B3] font-mono text-xs overflow-x-auto whitespace-pre">
                  {cmd.code}
                </pre>
              </div>
            ))}
          </div>

          {/* Additional Platforms Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#17D5B3]/50 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <GitPullRequest className="w-5 h-5 text-[#F4F8FB]" />
                <span className="text-xs font-bold text-[#F4F8FB]">Create GitHub Repository</span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#A8B5C2] group-hover:text-[#17D5B3] transition-colors" />
            </a>

            <a
              href="https://gitlab.com/projects/new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#FF6F91]/50 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-5 h-5 text-[#FF6F91]" />
                <span className="text-xs font-bold text-[#F4F8FB]">Create GitLab Project</span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#A8B5C2] group-hover:text-[#FF6F91] transition-colors" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#26313B] bg-[#161C23]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#17D5B3] hover:bg-[#12bc9e] text-[#050608] text-xs font-bold transition-colors shadow-lg shadow-[#17D5B3]/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
