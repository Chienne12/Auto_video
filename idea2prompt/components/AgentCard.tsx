import React, { useState } from 'react';
import { AgentStatus, WorkflowStep } from '../types';
import { CheckCircle2, CircleDashed, Loader2, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AgentCardProps {
  step: WorkflowStep;
  isLast: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ step, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (step.status) {
      case AgentStatus.COMPLETED:
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case AgentStatus.WORKING:
        return <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />;
      case AgentStatus.ERROR:
        return <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 font-bold">!</div>;
      default:
        return <CircleDashed className="w-6 h-6 text-slate-600" />;
    }
  };

  const getStatusText = () => {
    switch (step.status) {
      case AgentStatus.IDLE: return "Đang chờ...";
      case AgentStatus.WORKING: return "Đang xử lý...";
      case AgentStatus.COMPLETED: return "Hoàn thành";
      case AgentStatus.ERROR: return "Lỗi";
    }
  };

  return (
    <div className={`relative flex gap-4 ${step.status === AgentStatus.IDLE ? 'opacity-50 grayscale' : 'opacity-100'}`}>
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-[-20px] w-[2px] bg-slate-800" />
      )}

      <div className="flex flex-col items-center">
        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-dark-900 border border-slate-700 ${step.status === AgentStatus.WORKING ? 'ring-2 ring-brand-500/50' : ''}`}>
          {getIcon()}
        </div>
      </div>

      <div className="flex-1 pb-8">
        <div className="bg-dark-800 border border-slate-700 rounded-lg p-4 shadow-lg transition-all duration-300 hover:border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {step.title}
              </h3>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono mt-1">{getStatusText()}</p>
            </div>
            {step.output && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-slate-700 rounded-md transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
            )}
          </div>
          
          <p className="text-sm text-slate-400 mb-3">{step.description}</p>

          {/* Real-time Logs simulation */}
          {step.status === AgentStatus.WORKING && step.logs.length > 0 && (
            <div className="font-mono text-xs text-brand-400 mt-2 bg-dark-950 p-2 rounded border border-brand-900/30">
              <p className="animate-pulse">> {step.logs[step.logs.length - 1]}</p>
            </div>
          )}

          {/* Result preview */}
          {step.output && isExpanded && (
             <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-300 prose prose-invert max-w-none prose-pre:bg-dark-950 prose-pre:border prose-pre:border-slate-800">
                <ReactMarkdown>{step.output}</ReactMarkdown>
             </div>
          )}
           {step.output && !isExpanded && step.status === AgentStatus.COMPLETED && (
             <div className="mt-2 text-xs text-slate-500 italic">
               Nhấn mũi tên để xem chi tiết nội dung agent đã tạo.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
