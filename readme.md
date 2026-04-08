# Multi-Agent Mental Health Assistant

A conversational AI application with a **React frontend** and **FastAPI backend**. It features a multi-agent system designed to provide targeted mental health support. An intelligent router analyzes user input and directs queries to one of four specialized AI agents: a therapist, a mindfulness coach, a knowledge expert, or a journaling companion.

## ✨ Features

- **Multi-Agent System**: Four distinct agents, each with a unique persona and area of expertise.
- **Intelligent Routing**: A router agent uses an LLM to analyze user input and delegate the task to the most appropriate specialized agent.
- **React Frontend**: A modern, responsive chat UI built with React + Vite.
- **FastAPI Backend**: A REST API backend that handles routing and agent responses.
- **Specialized Personas**: Each agent is prompted to respond in a specific tone and style, from a supportive therapist to a knowledgeable friend.
- **Powered by LangChain & Google Gemini**: Leverages modern LLM frameworks for robust and context-aware conversations.

## 🚀 How to Run Locally

### 1. Clone the Repository
```sh
git clone <your-repository-url>
cd multi-agent
```

### 2. Set Up the Python Backend

```sh
# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Set Up Your API Key

- Copy `.env.example` to `.env`:
  ```sh
  cp .env.example .env
  ```
- Fill in your Google API key inside `.env`:
  ```env
  GOOGLE_API_KEY="YOUR_API_KEY_HERE"
  ```

### 4. Run the FastAPI Backend
```sh
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 5. Run the React Frontend
```sh
cd frontend
npm install
npm run dev
```
The app will open at `http://localhost:5173`.

## 📂 Project Structure

```
.
├── agents/
│   ├── therapist.py      # Therapist agent logic
│   ├── mindfulness.py    # Mindfulness coach agent logic
│   ├── knowledge.py      # Knowledge expert agent logic
│   └── journal.py        # Journaling companion agent logic
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Main chat UI component
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Global styles
│   └── package.json
├── .env                  # API keys (not in git)
├── .env.example          # Example env file (safe to commit)
├── .gitignore
├── main.py               # FastAPI application entry point
├── router.py             # Agent selection / routing logic
└── requirements.txt      # Python dependencies
```

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite |
| **Backend** | FastAPI, Python |
| **AI Framework** | LangChain |
| **Language Model** | Google Gemini (`gemini-2.5-flash-lite`) |
| **Key Libraries** | `python-dotenv`, `google-generativeai`, `uvicorn` |