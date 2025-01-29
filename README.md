# AI Voice Agent - Research Prototype

This is the first implementation of an AI voice bot designed for research purposes. This version will explore how users interact with a general AI voice agent. Users will engage in conversation with a witty [redacted] AI agent, providing insights into user behavior and interaction patterns.

## Setup Instructions

### 1. Start the Backend Server
Before running the frontend, start the backend server by executing:

```bash
npm start
```

This will launch `server.js`, which handles communication with the OpenAI API.
Open [http://localhost:3000](http://localhost:3000) in your browser to view request.

### 2. Start the Frontend
Once the backend is running, start the frontend using:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to interact with the AI voice agent.

### 3. Set Up Your OpenAI API Key
Ensure you have your `OPENAI_API_KEY` configured in the `.env` file before running the project.

## About This Project
This project is built with [Next.js](https://nextjs.org), bootstrapped using [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It utilizes WebRTC for real-time communication with OpenAI's API.

## Learn More
To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - Your feedback and contributions are welcome!

## Deployment
The easiest way to deploy your Next.js app is through [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Enjoy experimenting with this AI voice agent, and let us know your thoughts!