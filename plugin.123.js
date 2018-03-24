'use strict';

const fs = require('fs');

module.exports = (bot, event, playerEvent, env) => {
    const fd = fs.openSync('log.123', 'a');

    const actions = {};

    bot.on('message', (msg) => {
        if (actions[msg.chat.id]) {
            const action = actions[msg.chat.id];

            delete actions[msg.chat.id];

            fs.write(fd, JSON.stringify({
                msg: msg,
                action: action,
            }) + '\n', () => {
                // nothing
            });

            bot.sendMessage(
                msg.chat.id,
                action,
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    });

    bot.onText(/123(.*人)/, event((msg, match) => {
        actions[msg.chat.id] = '你是假的' + match[1] + '！';

        fs.write(fd, JSON.stringify({
            msg: msg,
        }) + '\n', () => {
            // nothing
        });
    }, -1));

    bot.onText(/123不许(.+)/, event((msg, match) => {
        actions[msg.chat.id] = '你' + match[1] + '了！';

        fs.write(fd, JSON.stringify({
            msg: msg,
        }) + '\n', () => {
            // nothing
        });
    }, -1));
};
