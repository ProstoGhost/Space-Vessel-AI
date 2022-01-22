const TelegramAPI = require('node-telegram-bot-api');
const ENV = require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/Telegram",{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const {againOption, KeyboardgameOption, replaceOption, LocationOption} = require('./options')

const Profile = require('./src/Profile')
const Arsenal = require('./Weapon.json');
const Location = require('./location.json');


const bot = new TelegramAPI(process.env.TOKEN,{polling: true})
const chats = {}
const boss = {} //текущий моб
const game = {} // какая игра выбрана
const hit = {}
const weapon = {} // оружие игрока
const dmg = {} // урон
const drop = {} // то что выпало
const Place = {} //локация для боя


function Random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CalculateDMG(base, weapon){
    let wpn = Arsenal.find(u => u.Name == weapon)
    return Math.floor(wpn.damage * base + wpn.base);
}

function GenerateBoss(route){
    let mbl = Location[route].MobList.List;
    return Location[route].MobList.List[Random(0, mbl.length-1)];

}


const BossFight = async (chatId) => {
    boss[chatId] = GenerateBoss(Place[chatId])
    dmg[chatId] = CalculateDMG(Random(9, 11), weapon[chatId])
    //await bot.deleteMessage(chatId, msgid);
    return bot.sendMessage(chatId, `Попробуй завалить босса качалки\nЕго ХП - ${boss[chatId]}\nТвоё оружие - ${weapon[chatId]}\nУрон - ${dmg[chatId]}`, KeyboardgameOption);
}


const start = () => {
    bot.setMyCommands([
        {command: '/start', description: "Приветствие"},
        {command: '/info', description: "краткий курс что тут происходит"},
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
        if(text === '/boss'){
            await Profile.findOne(
                {ID : chatId},

                async(err, data) =>{
                    if(err) console.log(err);
                    if(!data){
                        let nu = new Profile({
                            ID: chatId,
                            HP: 10,
                            XP: 0,
                            Weapon: 'EL Glock 220W',
                            Killcount: 0
                        });
                        weapon[chatId] = 'EL Glock 220W';
                        await nu.save(function (err) {
                            if (err) return console.error(err);
                        });
                        return bot.sendMessage(chatId, `Choose Location:`, LocationOption)
                        //return BossFight(chatId, msgid);
                    }
                    else{
                        weapon[chatId] = data.Weapon;
                        return bot.sendMessage(chatId, `Choose Location:`, LocationOption)
                        //return BossFight(chatId, msgid);
                    }
                }
            ).clone().catch(function(err){ console.log(err)})
            //)
            //return bot.deleteMessage(chatId, msgid);
        }
        else{
            bot.sendMessage(chatId, 'Я не совсем понял что ты хочешь от меня')
        }
        //await bot.sendMessage(chatId, `You say me: ${text}`)

    })
    bot.on('callback_query', async msg =>{
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const msgid = msg.message.message_id;
        //bot.sendMessage(chatId, `You choice: ${data}`)
        if(data === '/again'){
            return BossFight(chatId, msgid);

            //return bot.deleteMessage(chatId, msgid);
        }
        if(data === '/stop'){
            //await bot.deleteMessage(chatId, msgid);
            return bot.sendMessage(chatId, 'Хорошо, давай пока закончим на этом');
        }
        if(data.startsWith('/preparation')){
            //let test = Location.LocationList[data[data.length-1]]
            //console.log(Location[test].DifficultyFactor)
            let place = Location.LocationList[data[data.length-1]]
            Place[chatId] = Location[place].Name
            await bot.sendMessage(chatId,`You have chosen a location ${Location.LocationList[data[data.length-1]]}`)
            return BossFight(chatId)
        }
        if(data === '/hit' & game[chatId] === 2){
            //await bot.deleteMessage(chatId, msgid);
            await Profile.findOne(
                {ID : chatId},

                async(err, data) =>{
                    if(err) console.log(err);
                    else{
                        if(dmg[chatId] >= boss[chatId]){
                            data.XP += Random(10,21);
                            data.Killcount += 1;
                            await data.save();
                            if(Arsenal.find(u => u.id === 1).chance <= Random(0,100) & Arsenal.find(p => p.id === 1 ).Name != weapon[chatId]){
                                drop[chatId] = Arsenal.find(u => u.id === 1).Name
                                return bot.sendMessage(chatId, `Ты убил босса и с него выпала новая пуха:\n ${Arsenal.find(u => u.id === 1).Name}`, replaceOption)
                            }
                            else{
                                return bot.sendMessage(chatId, `Чел, ты его грохнул при помощи ${weapon[chatId]}`, againOption);
                            }
                        }
                        if(dmg[chatId] < boss[chatId]){
                            await data.save();
                            return bot.sendMessage(chatId, `Ты умер`, againOption);
                        }
                    }
                }
            ).clone().catch(function(err){ console.log(err)})
        }
        if(data === '/replace'){
            await Profile.findOne(
                {ID : chatId},

                async(err, data) =>{
                    if(err) console.log(err);
                    else{
                        data.Weapon = drop[chatId]
                        await data.save();
                        return bot.sendMessage(chatId, `Ты забрал награду с врага, теперь твоё оружие ${data.Weapon}`, againOption)
                    }
                }
            ).clone().catch(function(err){ console.log(err)})
        }
    })
}
start()