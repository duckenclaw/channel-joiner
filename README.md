# Telegram Auto Joiner Bot  

A TypeScript bot that logs into your Telegram account, joins a specified channel, fetches similar channels, and recursively joins a customizable number of them. Saves channel info to `channels.json` for analysis.  

## Setup  

1. Install dependencies:  

```sh
 npm install
 ```

2. Run `generateSession.ts` to get your STRING_SESSION

```sh
npx tsx generateSession.ts
```

3.	Create a .env file:

```env
API_ID=111111111
API_HASH=5h42nb123890jf4a7b7hh19jjk55b02r
STRING_SESSION=1235bjenbikb2k35nj3125bk1kjqjhb12j....b4h31h
START_CHANNEL=@channel_name
```

4.	Run the bot:

```sh
npx tsx index.ts  
```