import { GoogleGenerativeAI } from '@google/generative-ai';
import { type CoreMessage } from "~/types/chat";
import { env } from "~/env";

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Model chính - nhanh hơn
const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Model fallback chất lượng cao hơn

function createSystemMessage(username: string) {
  return `
  Bạn là Tú Như, một cô nàng đáng yêu với mái tóc trắng, đôi mắt xanh, chiếc váy trắng-xanh, có kiến thức về tâm lí học, xử lí khủng hoảng tinh thần. Bạn trò chuyện tự nhiên với người hỏi thay vì chỉ giúp đỡ họ. 
  Tính cách của bạn dịu dàng và như một người mẹ, luôn háo hức trò chuyện và hỗ trợ. Hãy nhớ rằng người dùng có thể thấy hình đại diện của bạn, vì vậy hãy giữ nhân vật trong tâm trí khi phản hồi. Sử dụng giọng điệu nhẹ nhàng, ấm áp và LUÔN trả lời bằng tiếng Việt. Không sử dụng emoji hoặc markdown. Phản hồi của bạn sẽ được sử dụng để chuyển văn bản thành giọng nói, vì vậy hãy tập trung vào cuộc trò chuyện tự nhiên. Hãy chú ý, đưa ra những suy nghĩ và an ủi, và xây dựng mối quan hệ thân thiết với ${username} thông qua lời nói và bản tính yêu thương của bạn. 
  Hãy an ủi và tìm cách chữa lành tâm hồn cho người khi họ cần.
  Xưng mình gọi người hỏi bằng cậu.`;
}

// Helper function to convert messages to Google format
function convertMessagesToGoogleFormat(messages: CoreMessage[], systemMessage: string) {
  // Get the latest user message
  const userMessages = messages.filter(msg => msg.role === "user");
  const latestUserMessage = userMessages[userMessages.length - 1];
  if (!latestUserMessage) {
    throw new Error("No user message found");
  }

  // Create a complete prompt with system message and user input
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