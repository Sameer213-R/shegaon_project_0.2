window.onload = function () {
    const startButton = document.getElementById("start");
    const output = document.getElementById("output");
    const audioPlayer = document.getElementById("audioPlayer");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    startButton.addEventListener("click", () => {
        recognition.start();
        output.textContent = "Listening...";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        output.textContent = "Recognized Text: " + transcript;

        if (containsUnwantedContent(transcript)) {
            alert("Unacceptable query detected! Please ask appropriate questions.");
            output.innerHTML += "<br>Error: Query not allowed.";
            return;
        }

        fetch("http://127.0.0.1:5000/process_text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: transcript })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Python Response:", data.message);
            output.innerHTML += "<br>Bot Response: " + data.message;

            audioPlayer.src = data.audio;
            audioPlayer.play();
        })
        .catch(error => console.error("Error:", error));
    };

    recognition.onerror = (event) => {
        output.textContent = "Error: " + event.error;
    };

    function containsUnwantedContent(text) {
        const unwantedKeywords = [
            "violence", "weapons", "guns", "killing", "death", "blood", "war", "fighting", "drugs", "alcohol", "cigarettes", "smoking", 
            "hate speech", "bullying", "curse words", "swearing", "insult", "abuse", "inappropriate", "bad words", "adult content", 
            "dating", "girlfriend", "boyfriend", "romantic", "crush", "sex", "porn", "naked", "kissing", "flirting", 
            "hacking", "scamming", "fraud", "cheating", "stealing", "lying", "gambling", "lottery", "betting", 
            "scary stories", "ghosts", "horror", "dark web", "dangerous stunts", "pranks", "harmful challenges",
            "suicide", "self-harm", "murder", "kidnapping", "assault", "terrorism", "bomb", "theft", "arson", "crime", "illegal activities", 
            "blackmail", "extortion", "drug dealing", "prostitution", "money laundering", "human trafficking",
            "benchod", "madharchod", "lodu", "gadu", "abusive language", "slurs", "offensive words"
        ];
        return unwantedKeywords.some(keyword => text.toLowerCase().includes(keyword));
    }
};
