# Setup Instructions

This guide will help you set up and run the FloraLens application locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Clone or Extract the Project**

   If you have the project as a zip file, extract it to a folder.
   If you are cloning from a repository:

   ```bash
   git clone <repository-url>
   cd plant-app
   ```

2. **Install Dependencies**

   Run the following command in the project root directory to install the required packages:

   ```bash
   npm install
   ```

## Configuration

1. **Environment Variables**

   Create a file named `.env` in the root directory of the project.
   Add the following variables to the `.env` file. You will need API keys for OpenAI and Supabase.

   ```env
   VITE_OPENAI_API_KEY="your_openai_api_key_here"
   VITE_SUPABASE_URL="your_supabase_url_here"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
   ```

   > **Note:** Never commit your `.env` file to version control if it contains real secrets.

## Running the Application

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

2. **Open in Browser**

   Once the server is running, you should see a URL in the terminal (usually `http://localhost:5173`). Open this URL in your web browser.

## Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Linting

To check for code issues:

```bash
npm run lint
```
