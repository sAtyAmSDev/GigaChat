let sendButton = document.getElementById("send-button");
let userInput = document.getElementById("user-input");
let chatMessages = document.getElementById("chat-messages");

let speech = new SpeechSynthesisUtterance();
let voices = [];
let isSpeaking = false; 

const voiceSelect = document.getElementById("voiceSelect");

function fetchApi() {
  let userText = userInput.value;

  if (userText !== "") {
    chatMessages.innerHTML += `
      <div class="message user-message">
        <strong>You:</strong> ${escapeHtml(userText)}
      </div>
    `;

    userInput.value = ""; 

    const API_KEY = "AIzaSyCtyNnfDRqSN3IoyvGUY_cSHop8ayoM8O8"; 

    if (API_KEY === "") {
      alert("Enter Your Api Key");
      return
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Please respond to the following conversation in a natural chatbot style using HTML tags for formatting. Structure the response as follows:
                      
                      1. Use <h1> for the main title.
                      2. Use <h2> for subtitles or key points.
                      3. Use <p> for paragraphs of text with proper spacing between them.
                      4. Use <strong> for bold text where you see double asterisks (**text**).
                      5. Ensure there is proper spacing between sections and elements.
                      6. If any code examples are necessary, place them inside <pre> and <code> tags.
                      
                      \n\n**You:** ${userText}\n**Chatbot:**`,
            },
          ],
        },
      ],
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network error");
        }
        return res.json();
      })
      .then((data) => {
        showDataInPage(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function voiceToText() {
  if (!window.webkitSpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-GB";
  recognition.onresult = function (event) {
    userInput.value = event.results[0][0].transcript;
    fetchApi(); 
  };
  recognition.start();
}


window.speechSynthesis.onvoiceschanged = () => {
  voices = window.speechSynthesis.getVoices();
  speech.voice = voices[0];

  voiceSelect.innerHTML = ""; 
  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = voice.name;
    voiceSelect.appendChild(option);
  });
};

function textToVoice() {
  const lastMessage = chatMessages.lastElementChild; 
  const chatbotResponse = lastMessage ? lastMessage.innerText : "";
  speech.text = chatbotResponse;
  speech.voice = voices[voiceSelect.value];
  window.speechSynthesis.speak(speech);
  isSpeaking = true;

  speech.onend = () => {
    isSpeaking = false;
  };
}

function pauseSpeech() {
  if (isSpeaking) {
    window.speechSynthesis.pause();
    isSpeaking = false; 
  }
}

function resetSpeech() {
  window.speechSynthesis.cancel(); 
  isSpeaking = false; 
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

function showDataInPage(data) {
  let chatbotResponse = data.candidates[0].content.parts[0].text;

  chatMessages.innerHTML += `
      <div class="message chatbot-message">
          <strong>Chatbot:</strong> ${chatbotResponse}
          <div class="buttons">
           <button onclick="textToVoice()"> <img src="/image/volume_up_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt="" srcset=""></button>
          <button onclick="pauseSpeech()"><img src="/image/stop_circle_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt="" srcset=""></button>
          <button onclick="resetSpeech()"> <img src="/image/replay_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png" alt="" srcset=""></button> <!-- Reset button -->
          </div>
         
      </div>
  `;

  chatMessages.scrollTop = chatMessages.scrollHeight;
}
