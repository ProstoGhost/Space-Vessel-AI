module.exports = {
    againOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Try again', callback_data: '/again'}],
                [{text: 'Хватит', callback_data: '/stop'}]
            ]
        })
    },
    KeyboardgameOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Ударить', callback_data: '/hit'}],
                [{text: "Отступить", callback_data: '/stop'}],
            ]
        })
    },
    ReplaceOption:{
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Забрать и экипировать', callback_data: '/replace'}],
                [{text: 'Оставить и начать новое сражение', callback_data: '/again'}],
                [{text: 'Оставить и закончить бой', callback_data: '/stop'}],
            ]
        })
    },
    LocationOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Обломки корабля', callback_data: '/preparation0'}],
                [{text: 'Поле', callback_data: '/preparation1'}]
            ]
        })
    },
}