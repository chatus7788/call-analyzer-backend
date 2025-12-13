const { AssemblyAI } = require("assemblyai");

const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

module.exports = assemblyAI;
