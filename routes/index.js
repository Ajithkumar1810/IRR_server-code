var express = require('express');
require('dotenv').config()
var router = express.Router();

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');


const creditionals = JSON.parse(process.env.DIALOGFLOW_CREDITIONALS)


// Configuration for the client
const CONFIGURATION = {
    credentials: {
        private_key: creditionals['private_key'],
        client_email: creditionals['client_email']
    }
}

const detectIntent = async ({ query }) => {
    try {
        const sessionId = uuid.v4();

        // Create a new session
        const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);
        const sessionPath = sessionClient.projectAgentSessionPath(
            creditionals.project_id,
            sessionId
        )

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: query,
                    // The language used by the client (en-US)
                    languageCode: "en-US",
                },
            },
        };

        // Send request and log result
        const responses = await sessionClient.detectIntent(request);
        return responses[0].queryResult;

    } catch (error) {
        return error.message
    }
}


router.post('/getintentmessage', async (req, res) => {
    try {
        const result = await detectIntent({
            query: req.body.message,
        })

        // console.log(`  Query: ${result.queryText}`);
        // console.log(`  Response: ${result.fulfillmentText}`);

        // if (result.intent) {
        //     console.log(`  Intent: ${result.intent.displayName}`);
        // } else {
        //     console.log('  No intent matched.');
        // }
        return res.json({

            intentname: result.intent.displayName,

            data: result.fulfillmentText

        })
    } catch (error) {
        return res.json({
            error: error.message
        })
    }
})

module.exports = router;
