// db/scripts/test-navigation-and-search.js
const { handleChat } = require('../../backend/controllers/chatController');

async function testQuery(userMessage) {
    console.log(`\n====================================================`);
    console.log(`🧪 Testing User Message: "${userMessage}"`);
    console.log(`====================================================`);

    const req = {
        body: { message: userMessage }
    };

    let responseData = null;
    let statusCode = 200;

    const res = {
        status: (code) => {
            statusCode = code;
            return res;
        },
        json: (data) => {
            responseData = data;
            return res;
        }
    };

    await handleChat(req, res);

    console.log(`Status Code: ${statusCode}`);
    console.log(`🧭 Detected Navigation:`, responseData?.navigation || 'None');
    console.log(`📚 Sources Retrieved:`, responseData?.sources?.map(s => `${s.title} (${s.url})`));
    console.log(`🤖 Answer Preview:\n${(responseData?.response || '').substring(0, 300)}...`);

    return responseData;
}

async function run() {
    await testQuery("i need to go to the page were this staffs profile is available");
    await testQuery("i need to go to the page where syllub is available");
    await testQuery("take me to admissions page");
}

run().catch(console.error);
