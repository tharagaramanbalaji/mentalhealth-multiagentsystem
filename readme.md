# Multi-Agent Mental Health Assistant

This project is a conversational AI application built with Streamlit and LangChain. It features a multi-agent system designed to provide targeted mental health support. An intelligent router analyzes user input and directs queries to one of four specialized AI agents: a therapist, a mindfulness coach, a knowledge expert, or a journaling companion.

## ✨ Features

-   **Multi-Agent System**: Four distinct agents, each with a unique persona and area of expertise.
-   **Intelligent Routing**: A router agent uses an LLM to analyze user input and delegate the task to the most appropriate specialized agent.
-   **Conversational UI**: A clean and simple chat interface powered by Streamlit.
-   **Specialized Personas**: Each agent is prompted to respond in a specific tone and style, from a supportive therapist to a knowledgeable friend.
-   **Powered by LangChain & Google Gemini**: Leverages modern LLM frameworks for robust and context-aware conversations.

## 🚀 How to Run Locally

1.  **Clone the Repository**
    ```sh
    git clone <your-repository-url>
    cd multi-agent
    ```

2.  **Create a Virtual Environment**
    ```sh
    # For Windows
    python -m venv venv
    venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```sh
    pip install -r requirements.txt
    ```

4.  **Set Up Your API Key**
    -   Create a file named `.env` in the root directory.
    -   Add your Google API key to it like this:
        ```env
        GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```

5.  **Run the Streamlit App**
    ```sh
    streamlit run app.py
    ```
    The application will open in your web browser.

## 📂 Project Structure

```
.
├── agents/
│   ├── therapist.py      # Logic for the therapist agent
│   ├── mindfulness.py    # Logic for the mindfulness agent
│   ├── knowledge.py      # Logic for the knowledge agent
│   └── journal.py        # Logic for the journaling agent
├── .env                  # For storing the API key (not in git)
├── .gitignore            # Specifies files for git to ignore
├── app.py                # The main Streamlit application file
├── router.py             # The agent selection logic
└── requirements.txt      # Python package dependencies
```

## 🛠️ Technology Stack

-   **Framework**: Streamlit, LangChain
-   **Language**: Python
-   **Language Model**: Google Gemini (`gemini-2.5-flash-lite`)
-   **Key Libraries**: `python-dotenv`, `google-generativeai`