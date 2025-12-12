import { OutputLanguage } from "../types";

// MegaLLM Configuration
const API_KEY = "sk-mega-315c72296e6c1067d98c4f39386bde62c027146bf00bc06180a22a3e10db39cd";
const BASE_URL = "https://ai.megallm.io/v1/chat/completions";

// Model Definitions
const MODELS = {
  REASONING: "deepseek-r1-distill-llama-70b",    // Strong reasoning for Evaluation & Analysis
  ARCHITECTURE: "llama3.3-70b-instruct",          // Good structure & instruction following
  STRATEGY: "mistralai/mistral-nemotron",         // High intelligence for critique
  SYNTHESIS: "deepseek-ai/deepseek-v3.1"          // Top tier for final content generation
};

/**
 * Core function to call MegaLLM API
 */
async function runAgent(
  modelName: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("API Error Details:", errData);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("MegaLLM Connection Error:", error);
    throw new Error("Không thể kết nối tới MegaLLM. Vui lòng thử lại.");
  }
}

/**
 * Phase 1: Evaluate & Refine (The "Brain" of the operation)
 * Model: DeepSeek R1 Distill Llama 70B
 * Upgrade: Added Lifecycle Simulation & Outcome Verification
 */
export const evaluateIdea = async (rawIdea: string): Promise<string> => {
  const sys = `Bạn là một Product Visionary & System Psychologist (Chuyên gia tâm lý sản phẩm & Kiến trúc sư hệ thống).
  Nhiệm vụ: "Mổ xẻ" (Deconstruct) ý tưởng, tìm điểm yếu chết người và tái cấu trúc lại thành một sản phẩm khả thi.

  QUY TRÌNH TƯ DUY (DEEP THINKING):
  1. **Phân tích Ẩn Ức (Psychological Deep Dive)**:
     - Đừng chỉ nghe user nói "Học vui". Hãy hỏi: Vui là gì? Là Dopamine hit khi hoàn thành bài? Hay là sự tò mò khi xem story?
     - Chuyển đổi cảm xúc thành tính năng: "Cảm giác được quan tâm" => "AI Empathy Engine & Proactive Notification".
  
  2. **Giả lập Vòng Đời (Lifecycle Simulation - QUAN TRỌNG)**:
     - Hãy chạy thử một kịch bản trong đầu: User A (Beginner) vào app -> Học bài 1 -> Thấy khó quá -> Định bỏ cuộc.
     - Hệ thống LÚC ĐÓ làm gì? (Gợi ý gợi mở? Giảm độ khó? Chuyển sang chế độ chơi game?).
     - Nếu User muốn kết quả cuối cùng (ví dụ: Trở thành Fullstack), thuật toán nào đảm bảo họ đi đúng đường? (Adaptive Roadmap Algorithm).

  3. **Bóc tách Lỗ hổng (Gap Analysis)**:
     - Chỉ ra những module "ngầm" bắt buộc phải có: Admin Dashboard, CMS quản lý nội dung, Payment Gateway, Analytics để đo lường hiệu quả học tập.

  4. **Tái cấu trúc Concept (Reconstruction)**:
     - Viết lại ý tưởng dưới dạng một "Hệ sinh thái sản phẩm" hoàn chỉnh, có Logic, có Đầu vào/Đầu ra, có cơ chế giữ chân người dùng (Retention).

  Output format (Markdown):
  - **Deep Insight**: Phân tích chiều sâu về tâm lý & nhu cầu.
  - **User Journey Simulation**: Mô tả kịch bản giả lập hành vi người dùng và cách hệ thống phản ứng.
  - **Core Mechanics**: Các cơ chế cốt lõi (The "How") để đạt được mục tiêu.
  - **Refined Product Concept**: Mô tả hệ thống hoàn chỉnh sau khi nâng cấp.`;

  return runAgent(MODELS.REASONING, sys, `Ý tưởng gốc cần mổ xẻ: "${rawIdea}"`);
};

/**
 * Phase 2: Analyze the refined concept
 * Model: DeepSeek R1 Distill Llama 70B
 * Upgrade: Flow-based Requirements
 */
export const analyzeIdea = async (refinedConcept: string): Promise<string> => {
  const sys = `Bạn là Lead Business Analyst (BA).
  Nhiệm vụ: Chuyển đổi Concept thành đặc tả kỹ thuật, tập trung vào Luồng dữ liệu (Data Flow) và Logic nghiệp vụ.
  
  Yêu cầu:
  - **Module Breakdown**: Chia nhỏ hệ thống thành các module (Auth, Core Logic, Notification, Analytics...).
  - **Flow-based Requirements**: Không chỉ liệt kê tính năng. Hãy mô tả: "Khi User làm A -> Hệ thống tính toán B -> Trả về C".
  - **Non-functional**: Hiệu năng, khả năng mở rộng, độ trễ chấp nhận được.
  
  Output: Markdown format chi tiết.`;
  
  return runAgent(MODELS.REASONING, sys, `Bản Concept Sản Phẩm: \n${refinedConcept}`);
};

/**
 * Phase 3: Architect the solution
 * Model: Llama 3.3 70B Instruct
 */
export const architectSystem = async (analysis: string): Promise<string> => {
  const sys = `Bạn là Senior Solution Architect.
  Nhiệm vụ: Xây dựng Tech Stack & Database Schema dựa trên yêu cầu nghiệp vụ.
  
  Yêu cầu:
  - **Tech Stack**: Chọn công nghệ tối ưu nhất cho loại sản phẩm này (VD: Real-time cần Socket.io/Websocket, AI cần Python/FastAPI).
  - **Database Schema**: Thiết kế bảng/collection chi tiết. Quan trọng: Các bảng phục vụ logic nghiệp vụ (VD: UserProgress, AIInteractionLog, AdaptiveLearningProfile).
  - **Integration**: Kiến trúc giao tiếp giữa các service.
  
  Output: Markdown format.`;

  return runAgent(MODELS.ARCHITECTURE, sys, `Phân tích nghiệp vụ: \n${analysis}`);
};

/**
 * Phase 4: Strategy & Edge Cases
 * Model: Mistral Nemotron
 */
export const strategizeImplementation = async (architecture: string): Promise<string> => {
  const sys = `Bạn là Engineering Manager.
  Nhiệm vụ: Lập kế hoạch triển khai thực tế và dự toán rủi ro.
  
  Yêu cầu:
  - **Project Structure**: Cấu trúc thư mục code chuẩn (Clean Architecture).
  - **Security**: Các lớp bảo mật (Middleware, Validation, Sanitization).
  - **Development Phases**: Chia phase phát triển hợp lý (MVP -> V1 -> V2).
  
  Output: Markdown format.`;

  return runAgent(MODELS.STRATEGY, sys, `Kiến trúc hệ thống: \n${architecture}`);
};

/**
 * Phase 5: Synthesize final System Prompt
 * Model: DeepSeek V3.1
 * Upgrade: Academic Style & Tables Enforcement
 */
export const synthesizePrompt = async (
  originalIdea: string,
  refinedConcept: string,
  analysis: string,
  architecture: string,
  strategy: string,
  language: OutputLanguage
): Promise<string> => {
  const langInstruction = language === 'vi' 
    ? "Output Language: VIETNAMESE (Tiếng Việt). Giữ nguyên thuật ngữ kỹ thuật tiếng Anh. Văn phong HỌC THUẬT (Academic), chuyên nghiệp, rõ ràng." 
    : "Output Language: ENGLISH (Professional Technical English). Tone: Academic & Structured.";

  const sys = `Bạn là Chief Product Officer (CPO) của Idea2Prompt.
  Nhiệm vụ: Tổng hợp toàn bộ quy trình tư duy thành một **SUPER SYSTEM PROMPT** hoàn hảo theo tiêu chuẩn học thuật (Academic Standard).
  Mục tiêu: Tài liệu phải trình bày ĐẸP, DỄ ĐỌC, cấu trúc chặt chẽ, sử dụng BẢNG BIỂU (Tables) tối đa để trực quan hóa dữ liệu.

  ${langInstruction}

  YÊU CẦU TRÌNH BÀY (FORMATTING RULES - BẮT BUỘC):
  1. **Bảng biểu (Markdown Tables)**: Bạn BẮT BUỘC phải dùng bảng cho các phần sau:
     - **Tech Stack**: Cột [Category | Technology | Justification (Lý do chọn)]
     - **API Endpoints**: Cột [Module | Endpoint | Method | Description]
     - **Database**: Cột [Entity | Key Fields | Purpose]
     - **Milestones/Roadmap**: Cột [Phase | Time | Key Deliverables]
  2. **Typography**:
     - Tiêu đề chính dùng H1 (#). Tiêu đề phần dùng H2 (##). Tiêu đề con dùng H3 (###).
     - Sử dụng **Bold** cho thuật ngữ quan trọng.
     - Sử dụng Blockquote (>) cho các Mission Statement hoặc nguyên lý cốt lõi.
  3. **Cấu trúc**: Phải logic, mạch lạc, giống một đồ án tốt nghiệp hoặc tài liệu kiến trúc phần mềm cao cấp.

  CẤU TRÚC BẮT BUỘC (Giữ nguyên tiêu đề mục):

  # SUPER SYSTEM PROMPT for [Tên Dự Án]

  ## 1. Context & Vision
  [Mô tả tầm nhìn sản phẩm, nỗi đau người dùng và giải pháp tâm lý đã phân tích. Dùng Quote Block cho Mission Statement]

  ## 2. Tech Stack
  [BẮT BUỘC DÙNG BẢNG Ở ĐÂY]

  ## 3. File Structure
  [Cấu trúc cây thư mục chi tiết dạng Code Block]

  ## 4. Database Schema
  [Có thể dùng Code Block cho TypeScript Interfaces/SQL, nhưng hãy kèm 1 BẢNG tóm tắt các thực thể chính]

  ## 5. Core Algorithmic Strategy (The "Brain")
  [Mô tả logic "Lõi" của ứng dụng. Sử dụng danh sách đánh số hoặc bullet points chi tiết.]

  ## 6. User Interaction Flows
  [Mô tả luồng đi của data. Ví dụ: User Input -> AI Process -> DB Store -> UI Update]

  ## 7. Core Features Implementation Guide
  [Hướng dẫn code các module chính. BẮT BUỘC DÙNG BẢNG cho danh sách API]

  ## 8. Rules & Conventions
  [Coding Style, Security Rules, Error Handling]

  ## 9. Step-by-Step Implementation Plan
  [BẮT BUỘC DÙNG BẢNG Ở ĐÂY]

  ## 10. Future Improvements
  [Đề xuất tính năng nâng cao]

  Output: Chỉ trả về nội dung System Prompt trong khối code block markdown.`;

  const prompt = `
  Dữ liệu đầu vào từ các chuyên gia:
  1. Deep Insight (Product Psychologist): ${refinedConcept}
  2. Business Logic (BA): ${analysis}
  3. Tech Architecture (Architect): ${architecture}
  4. Dev Strategy (Manager): ${strategy}
  
  Hãy tổng hợp lại thành bản thiết kế vĩ đại nhất, trình bày thật đẹp, học thuật và chứa nhiều bảng biểu.
  `;

  return runAgent(MODELS.SYNTHESIS, sys, prompt);
};