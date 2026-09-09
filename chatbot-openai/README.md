# AI Chatbot Application

This is a customized AI chatbot application, inspired by **ChatGPT**, built using the **MERN stack** and **OpenAI**. It allows users to interact with an intelligent chatbot while offering additional features for a better experience.

## Key Features:

- **Message Storage**: Every message sent by the user is stored in the database, allowing easy retrieval and deletion of messages.
  
- **Security**: The application is designed with robust security measures, including:
  - **JWT Tokens** for user authentication.
  - **HTTP-Only and Signed Cookies** for secure session management.
  - **Password Encryption** to protect user credentials.
  - **Middleware Chains** to secure API endpoints and ensure proper access control.

## Contributing

Contributions are welcome! If you want to enhance the functionality or improve the security of this project, feel free to submit a pull request.

---

**Tech Stack**:

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, Cookies
- **Chatbot Integration**: OpenAI

---

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- Node.js
- MongoDB (or a cloud-based instance like MongoDB Atlas)
- OpenAI API Key (for chatbot functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/ai-chatbot.git](https://github.com/venkatr95/chatbot-openai.git)
   ```
2. Set up environment variables for JWT secret, OpenAI API key, and MongoDB URI, .. in backend folder
   - Example File (.env) for backend

     COOKIE_SECRET=""

     PORT="5000"

     OPEN_AI_SECRET=""

     OPENAI_ORGANIZATION_ID=""

     MONGODB_URL=""

     JWT_SECRET=""

3. Backend
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The application will be running locally on http://localhost:5173

