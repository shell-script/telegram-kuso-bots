'use strict';

const fs = require('fs');

const config = require('./config');
const bot = require('./bot.' + config.bot)(config.sokobanToken);

const resource = require('./sokoban.resource');
const play = require('./sokoban.play');

const fd = fs.openSync('log_sokoban', 'a');

const log = (head, body) => {
    fs.write(fd, '[' + Date() + '] ' + head + ' ' + body + '\n', () => {
        // nothing
    });
};

const event = (handler) => {
    return (msg, match) => {
        log(
            msg.chat.id + ':' + msg.from.id + '@' + (msg.from.username || ''),
            match[0]
        );

        if (!config.ban[msg.from.id]) {
            handler(msg, match);
        }
    };
};

const messageUpdate = (msg, game, win) => {
    if (game.update) {
        game.update = () => {
            delete game.update;

            messageUpdate(msg, game, win);
        };

        return;
    }

    game.update = () => {
        delete game.update;
    };

    const matrix = [];

    for (let i = 0; i < Math.min(game.map.length, 12); i += 1) {
        matrix.push([]);

        for (let j = 0; j < Math.min(game.map[i].length, 8); j += 1) {
            const globalI = i + game.viewport[0];
            const globalJ = j + game.viewport[1];

            let display = {
                '#': '\u2b1b',
                ' ': ' ',
                '.': '\ud83d\udd36',
                '@': '\ud83d\udc34',
                '+': '\ud83e\udd84',
                '$': '\ud83c\udf11',
                '*': '\ud83c\udf15',
            };

            if (game.active && game.active[0] === globalI && game.active[1] === globalJ) {
                display = {
                    '$': '\ud83c\udf1a',
                    '*': '\ud83c\udf1d',
                };
            }

            matrix[i].push({
                text: display[game.map[globalI][globalJ]],
                callback_data: JSON.stringify([globalI, globalJ]),
            });
        }
    }

    // TODO
    // if (!win) {
    //     matrix.push([{
    //         text: '撤销',
    //         callback_data: 'undo',
    //     }]);
    // }

    bot.editMessageReplyMarkup(
        {
            inline_keyboard: matrix,
        },
        {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_to_message_id: msg.reply_to_message.message_id,
        }
    ).finally(() => {
        setTimeout(() => {
            game.update();
        }, config.sokobanUpdateDelay);
    });
};

bot.onText(/^\/sokoban(@\w+)?(?: (\w+)(?: (\d+))?)?$/, event((msg, match) => {
    bot.sendMessage(
        msg.chat.id,
        '仓库play什么的最棒了！',
        {
            reply_to_message_id: msg.message_id,
        }
    ).then((sentmsg) => {
        resource.load(
            match[2],
            match[3]
                ? parseInt(match[3], 10)
                : null,
            (level, levelId, levelIndex) => {
                // loaded

                play.init(
                    sentmsg.chat.id + '_' + sentmsg.message_id,
                    level,
                    levelId,
                    levelIndex,
                    msg.reply_to_message && msg.reply_to_message.text
                        ? JSON.parse(msg.reply_to_message.text)
                        : null,
                    (game) => {
                        // game init

                        messageUpdate(
                            sentmsg,
                            game,
                            false
                        );
                    },
                    () => {
                        // game exist

                        // never reach
                        throw Error(JSON.stringify(sentmsg));
                    }
                );
            },
            () => {
                // not valid

                bot.editMessageText(
                    '你…要带我去哪里？',
                    {
                        chat_id: sentmsg.chat.id,
                        message_id: sentmsg.message_id,
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        );
    });
}));

bot.on('callback_query', (query) => {
    // TODO: undo

    const msg = query.message;
    const info = JSON.parse(query.data);

    if (typeof info[0] !== 'number' || typeof info[1] !== 'number') {
        throw Error(JSON.stringify(query));
    }

    log(
        msg.chat.id + '_' + msg.message_id + ':callback:' + query.from.id + '@' + (query.from.username || ''),
        info[0] + ' ' + info[1]
    );

    play.click(
        msg.chat.id + '_' + msg.message_id,
        query.from.id,
        info[0],
        info[1],
        (game) => {
            // game continue

            messageUpdate(
                msg,
                game,
                false
            );

            bot.answerCallbackQuery(query.id).catch((err) => {});
        },
        (game) => {
            // game win

            fs.write(fd, JSON.stringify(game) + '\n', () => {
                // nothing
            });

            messageUpdate(
                msg,
                game,
                true
            );

            bot.answerCallbackQuery(query.id).catch((err) => {});
        },
        (game) => {
            // not changed

            bot.answerCallbackQuery(query.id).catch((err) => {});
        },
        () => {
            // game not exist

            bot.answerCallbackQuery(query.id).catch((err) => {});
        }
    );
});