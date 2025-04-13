
const restify = require('restify');
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
require('dotenv').config();

const { QnAMaker } = require('botbuilder-ai');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Define state store
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

// QnA Maker Setup
const qnaMaker = new QnAMaker({
    knowledgeBaseId: process.env.QNA_KB_ID,
    endpointKey: process.env.QNA_ENDPOINT_KEY,
    host: process.env.QNA_ENDPOINT_HOST
});

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            const qnaResults = await qnaMaker.getAnswers(context);
            if (qnaResults[0]) {
                await context.sendActivity(qnaResults[0].answer);
            } else {
                await context.sendActivity('Sorry, I do not have an answer for that.');
            }
        }
    });
});
