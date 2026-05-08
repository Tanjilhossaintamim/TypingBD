let timer;
let timeLeft = 0;
let isTestRunning = false;

function startTest() {
  const source = document.getElementById("sourceText").value.trim();
  if (!source) return alert("অনুগ্রহ করে আগে টেক্সট পেস্ট করুন!");

  const minutes = parseInt(document.getElementById("timeInput").value) || 5;
  timeLeft = minutes * 60;

  // Show Reference Text
  document.getElementById("referenceBox").innerText = source;
  document.getElementById("reviewBox").innerHTML = "";

  // UI Update
  updateResultUI(
    `সময় বাকি: ${formatTime(timeLeft)} (টাইপ শুরু করলে সময় গণনা শুরু হবে)`,
  );

  const typingArea = document.getElementById("typingArea");
  typingArea.disabled = false;
  typingArea.value = "";
  typingArea.focus();

  isTestRunning = false;
  clearInterval(timer);

  // Start timer on first input
  typingArea.addEventListener("input", handleFirstInput);
}

function handleFirstInput() {
  if (!isTestRunning) {
    isTestRunning = true;
    timer = setInterval(updateTimer, 1000);
    document
      .getElementById("typingArea")
      .removeEventListener("input", handleFirstInput);
  }
}

function updateTimer() {
  timeLeft--;
  updateResultUI(`সময় বাকি: ${formatTime(timeLeft)}`);
  if (timeLeft <= 0) endTest();
}

function endTest() {
  clearInterval(timer);
  isTestRunning = false;
  document.getElementById("typingArea").disabled = true;
  calculateResult();
}

function updateResultUI(message) {
  document.getElementById("result").innerHTML = `
        <div style="margin-bottom: 10px;">${message}</div>
        <button onclick="endTest()" style="background-color: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">End Test</button>
    `;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// THIS IS THE NEW "TRY AGAIN" LOGIC
function resetTest() {
  clearInterval(timer);
  isTestRunning = false;

  // Clear only the typing and result areas
  document.getElementById("typingArea").value = "";
  document.getElementById("typingArea").disabled = true;
  document.getElementById("result").innerHTML = "WPM: 0 | Accuracy: 0%";
  document.getElementById("reviewBox").innerHTML = "";

  //   // Keep sourceText as it is, just refocus the start button
  //   alert("রেডি? আবার শুরু করতে Start Test বাটনে ক্লিক করুন।");
}

function calculateResult() {
  const sourceText = document.getElementById("sourceText").value.trim();
  const typedText = document.getElementById("typingArea").value.trim();
  const initialMinutes = parseInt(document.getElementById("timeInput").value);

  // ক্যালকুলেশন লজিক
  const sourceWords = sourceText.split(/\s+/);
  const typedWords = typedText.split(/\s+/);
  const totalCharsWithSpace = typedText.length;
  const totalCharsWithoutSpace = typedText.replace(/\s+/g, "").length;

  let correctWords = 0;
  let mistakes = 0;
  let reviewHTML = "";

  typedWords.forEach((word, i) => {
    if (word === sourceWords[i]) {
      correctWords++;
      reviewHTML += `<span >${word}</span> `;
    } else {
      mistakes++;
      reviewHTML += `<span class="wrong-word" data-title="${sourceWords[i]}">${word}</span> `;
    }
  });

  // সময় হিসাব
  const timeSpentSeconds = initialMinutes * 60 - timeLeft;
  const durationMin = Math.floor(timeSpentSeconds / 60);
  const durationSec = timeSpentSeconds % 60;
  const timeSpentMinutes = timeSpentSeconds / 60 || 0.1;

  // WPM এবং Accuracy
  const wpm = Math.round(correctWords / timeSpentMinutes);
  const accuracy = typedWords.length
    ? Math.round((correctWords / typedWords.length) * 100)
    : 0;

  // ছবির মতো রেজাল্ট ডিজাইন
  document.getElementById("result").innerHTML = `
        <div class="stat-item"><span class="stat-label">WPM (Word-based):</span> <span class="stat-value">${wpm}</span></div>
        <div class="stat-item"><span class="stat-label">Characters (With Space):</span> <span class="stat-value">${totalCharsWithSpace}</span></div>
        
        <div class="stat-item"><span class="stat-label">Accuracy:</span> <span class="stat-value">${accuracy}%</span></div>
        <div class="stat-item"><span class="stat-label">Characters (Without Space):</span> <span class="stat-value">${totalCharsWithoutSpace}</span></div>
        
        <div class="stat-item"><span class="stat-label">Total Typed Words:</span> <span class="stat-value">${typedWords.length}</span></div>
        <div class="stat-item"><span class="stat-label">Duration:</span> <span class="stat-value">${durationMin} min ${durationSec} sec</span></div>
        
        <div class="stat-item"><span class="stat-label">Correct Words:</span> <span class="stat-value">${correctWords}</span></div>
        <div class="stat-item"><span class="stat-label">Result:</span>
        ${accuracy > 95 && wpm >= 20 ? ` <span class="stat-value passed">PASSED</span>` : ` <span class="stat-value failed">FAILED</span></div>`}
       
        </div>
        <div class="stat-item"><span class="stat-label">Total Mistakes:</span> <span class="stat-value">${mistakes}</span></div>
        
        <button class="btn-reset" onclick="resetTest()">Try Again</button>
    `;

  document.getElementById("reviewBox").innerHTML = reviewHTML;
}
