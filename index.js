const TelegramAPI = require('node-telegram-bot-api');
const ENV = require('dotenv').config();


const token = process.env.TOKEN


const bot = new TelegramAPI(token,{polling: true})
const chats = {}
const boss = {}
const game = {}
const hit = {}
const {gameOption, againOption, KeyboardgameOption} = require('./options')

const startGame = async (chatId, msgid) => {
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    game[chatId] = 1
    await bot.deleteMessage(chatId, msgid);
    return bot.sendMessage(chatId, 'попробуй угадай число которое я загадал, оно от 0 до 9', gameOption)
    //return bot.sendMessage(chatId, 'пробуй', gameOption)
}
const BossFight = async (chatId, msgid) => {
    const BossHP = Random(10, 15);
    boss[chatId] = BossHP;
    game[chatId] = 2
    await bot.deleteMessage(chatId, msgid);
    return bot.sendMessage(chatId, `Попробуй завалить босса качалки(Его ХП - ${boss[chatId]})`, KeyboardgameOption);
}
function Random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


const start = () => {
    bot.setMyCommands([
        {command: '/start', description: "Приветствие"},
        {command: '/info', description: "краткий курс что тут происходит"},
        {command: '/game', description: "Загадка Жака Фреско"},
        {command: '/boss', description: "Попробуй одолеть босса качалки"}

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
            await startGame(chatId, msgid);
            return bot.deleteMessage(chatId, msgid);
        }
        if(text === '/boss'){
            await BossFight(chatId, msgid);
            return bot.deleteMessage(chatId, msgid);
        }
/*         if(text === 'Отступить'){
            await bot.deleteMessage(chatId, msgid);
            return bot.sendMessage(chatId, 'Хорошо, давай пока закончим на этом', {
                reply_markup: {
                    remove_keyboard: true
                }
            });
        } */
        return bot.sendMessage(chatId, 'Я не совсем понял что ты хочешь от меня')
        //await bot.sendMessage(chatId, `You say me: ${text}`)

    })
    bot.on('callback_query', async msg =>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const msgid = msg.message.message_id;
        //bot.sendMessage(chatId, `You choice: ${data}`)
        if(data === '/again' & game[chatId] != 0){
            if(game[chatId] === 1){
                return startGame(chatId, msgid);
            }
            if(game[chatId] === 2){
                return BossFight(chatId, msgid);
            }
            return bot.deleteMessage(chatId, msgid);
        }
        if(data === '/stop'){
            game[chatId] = 0;
            await bot.deleteMessage(chatId, msgid);
            return bot.sendMessage(chatId, 'Хорошо, давай пока закончим на этом');
        }
        if(data == chats[chatId]){
            return bot.editMessageText(`Ты угадал число которое я загадал: ${chats[chatId]}`,{
                chat_id: chatId,
                message_id: msgid,
                reply_markup: againOption.reply_markup
            })
        }
        if(data != chats[chatId] & game[chatId] === 1){
            return bot.editMessageText(`Я загадывал число: ${chats[chatId]}`,{
                chat_id: chatId,
                message_id: msgid,
                reply_markup: againOption.reply_markup
            })
        }
        if(data === '/hit' & game[chatId] === 2){
            await bot.deleteMessage(chatId, msgid);
            hit[chatId] = Random(9, 16)
            if(hit[chatId] >= boss[chatId]){
                return bot.sendMessage(chatId, `Чел, ты его грохнул! Твой удар снёс ему: ${hit[chatId]}ХП`, againOption);
            }
            if(hit[chatId] < boss[chatId]){
                return bot.sendMessage(chatId, `Ты умер Босс выжил после твоей тычки в ${hit[chatId]}ХП`, againOption);
            }
        }
    })
}
start()