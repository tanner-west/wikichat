import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

export async function query(question, articleURL) {
  const filter = {
    source: articleURL,
  };

  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    {
      collectionName: "first-collection",
      persistDirectory: "./chroma_data_two",
    }
  );

  const retriever = vectorStore.asRetriever(3, filter);
  const ragPrompt = await pull("rlm/rag-prompt");

  // Check existing documents
  let context;
  context = await retriever.pipe(formatDocumentsAsString).invoke(question);
  if (context === "") {
    // If no documents are found, load the article from the web
    const loader = new CheerioWebBaseLoader(articleURL);

    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splits = await textSplitter.splitDocuments(docs);

    const docVectorStore = await Chroma.fromDocuments(
      splits,
      new OpenAIEmbeddings(),
      {
        collectionName: "first-collection",
        persistDirectory: "./chroma_data_two",
      }
    );
    const docRetriever = docVectorStore.asRetriever(3, filter);
    context = await docRetriever.pipe(formatDocumentsAsString).invoke(question);
  }

  const runnableRagChain = RunnableSequence.from([
    {
      context: () => context,
      question: new RunnablePassthrough(),
    },
    ragPrompt,
    llm,
    new StringOutputParser(),
  ]);
  const answer = await runnableRagChain.invoke(question);
  return { answer, context };
}
