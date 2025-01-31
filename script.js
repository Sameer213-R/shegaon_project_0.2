window.onload = function () {
    const startButton = document.getElementById("start");
    const output = document.getElementById("output");
    const audioPlayer = document.getElementById("audioPlayer"); // Add an audio player element

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

        // Send the recognized text to Flask backend
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

            // Play the generated audio
            audioPlayer.src = data.audio;
            audioPlayer.play();
        })
        .catch(error => console.error("Error:", error));
    };

    recognition.onerror = (event) => {
        output.textContent = "Error: " + event.error;
    };
};
