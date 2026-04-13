/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");









// Cloudflare Worker endpoint - replace with your actual worker URL
const WORKER_URL = "https://YOUR_PROJECT.YOUR_ACCOUNT.workers.dev";

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display user message
  chatWindow.innerHTML += `\n\nYou: ${userMessage}`;
  userInput.value = "";

  try {
    // Make request to Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
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
    chatWindow.innerHTML += `\n\nAssistant: ${aiMessage}`;

  } catch (error) {
    chatWindow.innerHTML += `\n\nError: ${error.message}`;
  }
});
