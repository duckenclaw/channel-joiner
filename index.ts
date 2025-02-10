import { config } from "dotenv";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";
import fs from "fs";

config();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH!;
const stringSession = new StringSession(process.env.STRING_SESSION!);
const targetChannel = process.env.START_CHANNEL!;

const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

async function joinChannel(channelUsername: string) {
    try {
        console.log(`Joining channel: ${channelUsername}`);
        const entity = await client.getEntity(channelUsername);
        await client.invoke(new Api.channels.JoinChannel({ channel: entity }));
        console.log(`Joined ${channelUsername}`);
        return entity;
    } catch (error) {
        console.error(`Failed to join ${channelUsername}:`, error);
        return null;
    }
}

async function getSimilarChannels(channel: Api.TypeInputChannel) {
    try {
        console.log(`Fetching similar channels for: ${channel}`);
        const result = await client.invoke(new Api.channels.GetChannelRecommendations({ channel }));
        
        return result.chats.map((chat) => ({
            id: chat.id,
            username: chat.username ? `@${chat.username}` : null
        })).filter(chat => chat.username);
    } catch (error) {
        console.error("Error fetching similar channels:", error);
        return [];
    }
}

async function getChannelInfo(channelUsername: string) {
    try {
        console.log(`Fetching info for: ${channelUsername}`);
        const entity = await client.getEntity(channelUsername);
        const fullChannel = await client.invoke(new Api.channels.GetFullChannel({ channel: entity }));

        return {
            username: channelUsername,
            title: fullChannel.fullChat.about || "No description",
            memberCount: fullChannel.fullChat.participantsCount || 0,
            id: entity.id
        };
    } catch (error) {
        console.error(`Failed to fetch info for ${channelUsername}:`, error);
        return null;
    }
}

async function recursiveJoin(startChannel: string, depth: number = 15) {
    let queue = [startChannel];
    let visited = new Set<string>();
    let channelData = [];

    for (let i = 0; i < depth && queue.length > 0; i++) {
        const currentChannel = queue.shift();
        if (!currentChannel || visited.has(currentChannel)) continue;

        visited.add(currentChannel);

        // Join the channel
        const entity = await joinChannel(currentChannel);
        if (!entity) continue;

        // Get channel info
        const info = await getChannelInfo(currentChannel);
        if (info) channelData.push(info);

        // Fetch similar channels
        const similarChannels = await getSimilarChannels(entity);
        for (const { username } of similarChannels) {
            if (!visited.has(username)) queue.push(username);
        }

        // Wait a bit to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    fs.writeFileSync("channels.json", JSON.stringify(channelData, null, 2));
    console.log("Saved channel info to channels.json");
}

async function main() {
    await client.start();
    console.log("Logged in!");

    await recursiveJoin(targetChannel);
}

main().catch(console.error);