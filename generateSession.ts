import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input"; 

const apiId = 25243163; 
const apiHash = "2b64da730801da4b7a7cd19eeb56b05f"; 
const stringSession = new StringSession("");

const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

async function main() {
    console.log("Starting Telegram login...");
    await client.start({
        phoneNumber: async () => await input.text("Enter your phone number:"),
        phoneCode: async () => await input.text("Enter the code you received:"),
        password: async () => await input.text("Enter your 2FA password (if enabled):"),
        onError: (err) => console.log("Error:", err),
    });

    console.log("Logged in successfully!");
    console.log("Your session string:", client.session.save());

    await client.disconnect();
}

main().catch(console.error);