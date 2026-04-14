/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");









// Cloudflare Worker endpoint - replace with your actual worker URL
const WORKER_URL = "https://loreal-chatbot.vpreap1.workers.dev/";

const SYSTEM_PROMPT = "You are a L'Oréal beauty assistant. Only answer questions about L'Oréal products, routines, and recommendations. If the user asks about anything else, politely say you can only help with L'Oréal beauty topics and invite them to ask about skincare, makeup, haircare, fragrance, or routines. Keep responses concise, friendly, and practical.";

const TYPE_SPEED = 18;

function scrollChatToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createMessageElement(role, text = "") {
  const message = document.createElement("div");
  message.className = `msg ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  scrollChatToBottom();
  return message;
}

function createTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "msg assistant typing-indicator";
  indicator.innerHTML = `
    <span class="typing-label">Assistant is typing</span>
    <span class="typing-dots" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  chatWindow.appendChild(indicator);
  scrollChatToBottom();
  return indicator;
}

function typeMessage(element, text) {
  return new Promise((resolve) => {
    let index = 0;

    element.textContent = "";

    function typeNextCharacter() {
      element.textContent += text[index];
      scrollChatToBottom();
      index += 1;

      if (index < text.length) {
        setTimeout(typeNextCharacter, TYPE_SPEED);
      } else {
        resolve();
      }
    }

    typeNextCharacter();
  });
}

// Set initial message
createMessageElement("assistant", "👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display user message
  createMessageElement("user", userMessage);
  userInput.value = "";

  try {
    const typingIndicator = createTypingIndicator();

    // Make request to Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    // Parse response
    const data = await response.json();

    // Display AI response
    const aiMessage = data.choices[0].message.content;
    typingIndicator.remove();

    const assistantMessage = createMessageElement("assistant", "");
    await typeMessage(assistantMessage, aiMessage);

  } catch (error) {
    const typingIndicator = chatWindow.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }

    createMessageElement("assistant", `Error: ${error.message}`);
  }
});
