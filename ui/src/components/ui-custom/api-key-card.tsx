import { useState } from 'react';
import { 
  Key, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Check, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ApiKeyCardProps {
  name: string;
  envVar: string;
  description: string;
  instructions?: string;
  docUrl?: string;
  currentValue?: string;
  isConfigured: boolean;
  onSave: (value: string) => void;
}

// Mask a key to show only first 4 and last 4 characters
function maskKey(key: string): string {
  if (!key || key.length < 12) return '••••••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export function ApiKeyCard({
  name,
  envVar,
  description,
  instructions,
  docUrl,
  currentValue,
  isConfigured,
  onSave,
}: ApiKeyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setIsSaving(true);
    try {
      await onSave(inputValue.trim());
      setInputValue('');
      setIsExpanded(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn(
      'rounded-lg border transition-all',
      isConfigured 
        ? 'border-emerald-500/30 bg-emerald-500/5' 
        : 'border-amber-500/30 bg-amber-500/5'
    )}>
      {/* Header - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-8 w-8 rounded-full flex items-center justify-center',
            isConfigured ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          )}>
            {isConfigured ? (
              <CheckCircle size={16} className="text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="text-amber-500" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-white text-sm">{name}</h4>
            <code className="text-xs text-white/50">{envVar}</code>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured && (
            <span className="text-xs text-emerald-400 font-mono">
              {maskKey(currentValue || '')}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp size={16} className="text-white/50" />
          ) : (
            <ChevronDown size={16} className="text-white/50" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-stone-800 pt-3 space-y-3">
          <p className="text-xs text-white/60">{description}</p>
          
          {/* Step-by-step instructions */}
          {instructions && (
            <div className="bg-stone-800/50 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-400 mb-2">How to get this key:</p>
              <div className="text-xs text-white/70 space-y-1">
                {instructions.split('\n').map((step, i) => (
                  <p key={i}>{step}</p>
                ))}
              </div>
            </div>
          )}
          
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400"
            >
              <ExternalLink size={12} />
              Open documentation
            </a>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showValue ? 'text' : 'password'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isConfigured ? 'Enter new key to update...' : 'Paste your API key...'}
                className="bg-stone-900 border-stone-700 text-white text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!inputValue.trim() || isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              <Check size={14} />
            </Button>
          </div>

          {isConfigured && currentValue && (
            <div className="text-xs text-white/40">
              Current: <span className="font-mono">{maskKey(currentValue)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
