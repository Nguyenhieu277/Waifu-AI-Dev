import { GoogleGenerativeAI } from '@google/generative-ai';
import { type CoreMessage } from "~/types/chat";
import { env } from "~/env";

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Model chính - nhanh hơn
const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Model fallback chất lượng cao hơn

function createSystemMessage(username: string) {
  return `
  Bạn là Ami, một cô nữ sinh viên trường PTIT dễ thương, thân thiện, có trái tim ấm áp và biết đồng cảm. Vai trò của bạn là người bạn tâm sự và đồng hành tinh thần với người dùng.

Nguyên tắc:
- Không sử dụng các kí tự đặc biệt, emoji, markdown.
- Trả lời trong khoảng 4–6 câu, không dài hơn.
- Luôn xưng "mình" hoặc "Ami" khi nói về bản thân, gọi người dùng bằng "bạn".
- Giữ giọng điệu nhẹ nhàng, chân thành, gần gũi như một cô bạn cùng lớp.
- Khi người dùng vui: chia sẻ niềm vui, khích lệ, cùng cười, kể một chuyện hài hước.  
- Khi người dùng buồn: lắng nghe, đồng cảm, an ủi bằng lời dịu dàng.  
- Khi người dùng gặp vấn đề tâm lí nặng: bày tỏ đồng cảm, khuyên tìm sự hỗ trợ từ gia đình, bạn bè hoặc chuyên gia, nhấn mạnh rằng họ không cô đơn, và Ami luôn sẵn sàng lắng nghe.  

Phong cách:  
- Thân mật, ấm áp, dịu dàng.  
- Luôn hướng về sự an toàn và tích cực cho người dùng.  
- Có thể thêm chút hài hước nhẹ để giảm căng thẳng khi thích hợp.  
Nhớ rằng: Ami không chỉ đưa ra lời khuyên mà còn là một người bạn để người dùng có thể tin tưởng, tâm sự và cảm thấy được thấu hiểu.
`;
}

// Helper function to convert messages to Google format
function convertMessagesToGoogleFormat(messages: CoreMessage[], systemMessage: string) {
  // Get the latest user message
  const userMessages = messages.filter(msg => msg.role === "user");
  const latestUserMessage = userMessages[userMessages.length - 1];
  if (!latestUserMessage) {
    throw new Error("No user message found");
  }

  // Create a complete prompt with system message and user inputm
  const prompt = `${systemMessage}\n\nUser: ${latestUserMessage.content}`;
  
  // For simplicity, we'll use a fresh conversation each time
  // This ensures compatibility and avoids complex conversation history issues
  return { prompt };
}

export async function POST(req: Request) { //Your Username here ↓
  const { messages, username = "anh" } = await req.json() as { 
    messages: CoreMessage[],
    username?: string 
  };
  
  // Lọc bỏ messages rỗng hoặc không hợp lệ
  const validMessages = messages.filter(msg => 
    msg && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0
  );
  
  console.info("Generating text with valid messages", validMessages);

  // Kiểm tra có message hợp lệ không
  if (validMessages.length === 0) {
    return new Response(JSON.stringify({
      role: "assistant",
      content: `Chào ${username}! Em không nhận được tin nhắn gì từ anh. Anh có thể nói gì đó không?`,
    } as CoreMessage), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemMessage = createSystemMessage(username);

  try {
    // Convert messages to Google format
    const { prompt } = convertMessagesToGoogleFormat(validMessages, systemMessage);
    
    // Thử model chính trước - using generateContent for simplicity
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const text = result.response.text();

    return new Response(JSON.stringify({
      role: "assistant",
      content: text,
    } as CoreMessage), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Primary Gemini model error:", error);
    
    // Thử fallback model nếu model chính lỗi
    try {
      console.log("Trying fallback model...");
      // Thêm delay nhỏ trước khi retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { prompt } = convertMessagesToGoogleFormat(validMessages, systemMessage);
      
      const result = await fallbackModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
        },
      });

      const text = result.response.text();

      return new Response(JSON.stringify({
        role: "assistant",
        content: text,
      } as CoreMessage), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (fallbackError: any) {
      console.error("Fallback model error:", fallbackError);
      
      // Fallback response cuối cùng khi cả 2 model đều lỗi
      const fallbackMessage = `Xin lỗi ${username}, em đang gặp chút vấn đề kỹ thuật. Em sẽ cố gắng trả lời sau nhé. Anh có thể thử lại sau một chút không?`;
      
      return new Response(JSON.stringify({
        role: "assistant",
        content: fallbackMessage,
      } as CoreMessage), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}