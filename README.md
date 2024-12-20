# WikiChat
A RAG (retrieval augmented generation) app for chatting with Wikipedia articles.

## Overview
RAG is a method of interacting with LLMs by providing context from specific sources that is relevant to the user's query. In or case, that context will be content from Wikipedia articles fetched via semantic similarity search from a vector database.

RAG apps let you take advantage of powerful LLM capabilities (like question answering and content summarization), with less chance of hallucination and the ability to reference the source material.

The core functionality of our app is built with Langchain, an open-source framework for building AI-powered apps. The app currently interacts with OpenAI APIs for text embeddings and LLM completion, but all major AI services are supported.

Our vector database provide is Chroma, but the app could be made to work with any number of providers.

The frontend is an Expo React Native App.

## Installation
1. Run `npm install` in apps/react-native and apps/server
2. Install the chromadb Python library with your method of choice (e.g. `pip install chromadb`)

## Running the server for development
1. Start the Chroma server with `chroma run`
2. Start the node server e.g. `npm run dev`

## Runnint the react-native app for development
1. Run `npm run start` in apps/react-native