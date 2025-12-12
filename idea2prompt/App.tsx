import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Sparkles, Code2, Play, Copy, RefreshCcw, Lightbulb, Globe2, Rocket, Layers, PenTool } from 'lucide-react';
import { AgentStatus, StepType, WorkflowStep, OutputLanguage } from './types';
import AgentCard from './components/AgentCard';
import { evaluateIdea, analyzeIdea, architectSystem, strategizeImplementation, synthesizePrompt } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const INITIAL_STEPS: WorkflowStep[] = [
  {
    id: StepType.EVALUATION,
    title: "Visionary & Psychologist (DeepSeek R1)",
    description: "Giả lập vòng đời người dùng (Lifecycle Simulation) để tìm điểm gãy. Phân tích sâu tâm lý (Deep Insight) để biến ý tưởng thô thành một hệ sinh thái sản phẩm hoàn chỉnh.",
    status: AgentStatus.IDLE,
    logs: []
  },
  {
    id: StepType.ANALYSIS,
    title: "Lead Business Analyst (DeepSeek R1)",
    description: "Chuyển đổi Concept thành 'Flow-based Requirements'. Xác định luồng dữ liệu và logic nghiệp vụ cốt lõi để đảm bảo tính liên kết chặt chẽ.",
    status: AgentStatus.IDLE,
    logs: []
  },
  {
    id: StepType.ARCHITECTURE,
    title: "System Architect (Llama 3.3)",
    description: "Thiết kế Tech Stack tối ưu & Database Schema. Xác định kiến trúc giao tiếp giữa các service (Microservices vs Monolith).",
    status: AgentStatus.IDLE,
    logs: []
  },
  {
    id: StepType.STRATEGY,
    title: "Engineering Manager (Mistral Nemotron)",
    description: "Lập kế hoạch triển khai (Implementation Strategy), phân tích rủi ro (Risk Analysis) và tiêu chuẩn bảo mật (Security Standards).",
    status: AgentStatus.IDLE,
    logs: []
  },
  {
    id: StepType.SYNTHESIS,
    title: "Chief Product Officer (DeepSeek V3.1)",
    description: "Tổng hợp tất cả thành Super System Prompt chuẩn học thuật. Xây dựng Algorithmic Strategy và định hình Core Logic của ứng dụng.",
    status: AgentStatus.IDLE,
    logs: []
  }
];

function App() {
  const [idea, setIdea] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [language, setLanguage] = useState<OutputLanguage>('vi');
  const finalRef = useRef<HTMLDivElement>(null);

  const updateStepStatus = (id: StepType, status: AgentStatus, log?: string, output?: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === id) {
        const newLogs = log ? [...step.logs, log] : step.logs;
        return { ...step, status, logs: newLogs, output: output || step.output };
      }
      return step;
    }));
  };

  const handleReset = () => {
    setIdea('');
    setSteps(INITIAL_STEPS);
    setFinalPrompt('');
    setIsProcessing(false);
  };

  const handleCopy = () => {
    // Clean markdown code fences if present
    const cleanText = finalPrompt.replace(/^```markdown\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    navigator.clipboard.writeText(cleanText);
    alert('Đã sao chép System Prompt!');
  };

  const runWorkflow = async () => {
    if (!idea.trim()) return;
    setIsProcessing(true);
    setFinalPrompt('');
    
    // Reset steps
    setSteps(INITIAL_STEPS.map(s => ({...s, status: AgentStatus.IDLE, logs: [], output: undefined})));

    try {
      // Step 1: Evaluate
      updateStepStatus(StepType.EVALUATION, AgentStatus.WORKING, "Đang mổ xẻ ý tưởng và giả lập vòng đời người dùng...");
      const evaluation = await evaluateIdea(idea);
      updateStepStatus(StepType.EVALUATION, AgentStatus.COMPLETED, "Đã hoàn thành tái cấu trúc concept.", evaluation);

      // Step 2: Analysis
      updateStepStatus(StepType.ANALYSIS, AgentStatus.WORKING, "Đang phân tích luồng dữ liệu và logic nghiệp vụ...", evaluation);
      const analysis = await analyzeIdea(evaluation);
      updateStepStatus(StepType.ANALYSIS, AgentStatus.COMPLETED, "Đã hoàn tất đặc tả kỹ thuật.", analysis);

      // Step 3: Architecture
      updateStepStatus(StepType.ARCHITECTURE, AgentStatus.WORKING, "Đang thiết kế kiến trúc hệ thống và Database...", analysis);
      const architecture = await architectSystem(analysis);
      updateStepStatus(StepType.ARCHITECTURE, AgentStatus.COMPLETED, "Đã hoàn tất thiết kế kiến trúc.", architecture);

      // Step 4: Strategy
      updateStepStatus(StepType.STRATEGY, AgentStatus.WORKING, "Đang lập kế hoạch triển khai và bảo mật...", architecture);
      const strategy = await strategizeImplementation(architecture);
      updateStepStatus(StepType.STRATEGY, AgentStatus.COMPLETED, "Đã hoàn tất chiến lược dev.", strategy);

      // Step 5: Synthesis
      updateStepStatus(StepType.SYNTHESIS, AgentStatus.WORKING, "Đang viết System Prompt học thuật...", strategy);
      const finalResult = await synthesizePrompt(idea, evaluation, analysis, architecture, strategy, language);
      
      // Clean up markdown block markers for display
      const cleanResult = finalResult.replace(/^```markdown\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
      
      updateStepStatus(StepType.SYNTHESIS, AgentStatus.COMPLETED, "Hoàn tất.", cleanResult);
      setFinalPrompt(cleanResult);
      
      setTimeout(() => {
        finalRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      console.error(error);
      const currentStep = steps.find(s => s.status === AgentStatus.WORKING);
      if (currentStep) {
        updateStepStatus(currentStep.id, AgentStatus.ERROR, "Đã xảy ra lỗi kết nối AI.");
      }
      alert("Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Idea2Prompt <span className="text-brand-500">AI</span></h1>
              <p className="text-xs text-slate-400 font-mono">Powered by DeepSeek, Llama & Mistral</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Docs</a>
             <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Github</a>
             <div className="h-4 w-[1px] bg-slate-700"></div>
             <span className="px-2 py-1 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-400 text-xs font-mono">v2.1.0 (Academic Edition)</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-tight">
            Biến ý tưởng thành <br/> <span className="text-brand-500">System Prompt</span> đẳng cấp chuyên gia
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Không chỉ là công cụ viết prompt. Đây là <span className="text-white font-semibold">AI Co-founder</span> giúp bạn mổ xẻ, hoàn thiện và xây dựng cấu trúc dự án phần mềm chuẩn mực từ A-Z.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-dark-800/50 border border-slate-700 rounded-2xl p-1 shadow-xl">
          <div className="bg-dark-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-brand-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Mô tả ý tưởng của bạn
              </label>
              
              <div className="flex items-center gap-3 bg-dark-950 rounded-lg p-1 border border-slate-800">
                 <button 
                   onClick={() => setLanguage('vi')}
                   className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'vi' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                 >
                   Tiếng Việt
                 </button>
                 <button 
                   onClick={() => setLanguage('en')}
                   className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'en' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                 >
                   English (Global)
                 </button>
              </div>
            </div>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ví dụ: Tôi muốn xây dựng một nền tảng học tập AI giúp sinh viên học các môn lý thuyết khô khan thông qua kể chuyện và hình ảnh trực quan..."
              className="w-full h-40 bg-dark-950 text-slate-200 p-4 rounded-lg border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none placeholder:text-slate-600 font-mono text-sm"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={handleReset}
                disabled={isProcessing || !idea}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw className="w-4 h-4" />
                Làm mới
              </button>
              <button 
                onClick={runWorkflow}
                disabled={isProcessing || !idea.trim()}
                className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all transform hover:scale-[1.02] active:scale-95 text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang suy nghĩ...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Khởi chạy Đội ngũ AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="space-y-8 relative">
          <div className="flex items-center gap-2 mb-6">
             <Layers className="w-5 h-5 text-brand-500" />
             <h3 className="text-xl font-bold text-white">Quy trình xử lý (Workflow)</h3>
          </div>
          
          <div className="pl-4">
             {steps.map((step, index) => (
                <AgentCard key={step.id} step={step} isLast={index === steps.length - 1} />
              ))}
          </div>
        </div>

        {/* Final Output */}
        {finalPrompt && (
          <div ref={finalRef} className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <PenTool className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">System Prompt Hoàn Chỉnh</h3>
                    <p className="text-slate-400 text-sm">Sẵn sàng để sử dụng cho dự án</p>
                  </div>
               </div>
               <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors text-slate-300 text-sm font-medium group"
                >
                  <Copy className="w-4 h-4 group-hover:text-brand-400" />
                  Sao chép
                </button>
            </div>
            
            <div className="bg-dark-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Prompt Header Decoration */}
              <div className="h-2 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500"></div>
              
              <div className="p-8 overflow-x-auto">
                <div className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:text-brand-400 prose-h2:text-xl prose-h2:text-slate-200 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-8 prose-p:text-slate-300 prose-code:text-brand-300 prose-pre:bg-dark-950 prose-pre:border prose-pre:border-slate-800 prose-th:text-brand-200 prose-td:text-slate-300">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-6 rounded-lg border border-slate-700">
                          <table className="min-w-full divide-y divide-slate-700" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => (
                        <thead className="bg-slate-800/50" {...props} />
                      ),
                      tbody: ({node, ...props}) => (
                        <tbody className="divide-y divide-slate-800 bg-dark-900/30" {...props} />
                      ),
                      tr: ({node, ...props}) => (
                        <tr className="hover:bg-slate-800/30 transition-colors" {...props} />
                      ),
                      th: ({node, ...props}) => (
                        <th className="px-6 py-3 text-left text-xs font-medium text-brand-200 uppercase tracking-wider" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed" {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-brand-500 pl-4 italic text-slate-400 my-4 bg-slate-800/20 py-2 pr-2 rounded-r" {...props} />
                      )
                    }}
                  >
                    {finalPrompt}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;