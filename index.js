const TelegramAPI = require('node-telegram-bot-api');



const token = "1832225272:AAFqSy4ab_k2grtFyRa0TT3-F04MeSO3Jdg"


const bot = new TelegramAPI(token,{polling: true})
const chats = {}
const {gameOption, againOption} = require('./options')

const startGame = async (chatId, msgid) => {
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'попробуй угадай число которое я загадал, оно от 0 до 9', gameOption)
    //return bot.sendMessage(chatId, 'пробуй', gameOption)
}


const start = () => {
    bot.setMyCommands([
        {command: '/start', description: "Приветствие"},
        {command: '/info', description: "краткий курс что тут происходит"},
        {command: '/game', description: "Загадка Жака Фреско"},

    ])
    
    bot.on("message", async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const msgid = msg.message_id;
        if(text === "/start"){
            return bot.sendMessage(chatId, `Привет привет`)
        }
        if(text === "/info"){
            return bot.sendMessage(chatId, `Это бот который поможет тебе скрасить немного времени и он достаточно прост для освоения`)
        }
        if(text === '/game'){
            return startGame(chatId, msgid);
        }
        return bot.sendMessage(chatId, 'Я не совсем понял что ты хочешь от меня')
        //await bot.sendMessage(chatId, `You say me: ${text}`)
    })
    bot.on('callback_query', async msg =>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const msgid = msg.message.message_id;
        //bot.sendMessage(chatId, `You choice: ${data}`)
        if(data === '/again'){
            bot.deleteMessage(chatId, msgid);
            return startGame(chatId, msgid);
        }
        if(data == chats[chatId]){
            return bot.editMessageText(`Ты угадал число которое я загадал: ${chats[chatId]}`,{
                chat_id: chatId,
                message_id: msgid,
                reply_markup: againOption.reply_markup
            })
        }
        if(data != chats[chatId]){
            return bot.editMessageText(`Я загадывал число: ${chats[chatId]}`,{
                chat_id: chatId,
                message_id: msgid,
                reply_markup: againOption.reply_markup
            })
        }
    })
}
start()