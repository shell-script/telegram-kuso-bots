'use strict';

module.exports = (bot, games, commands, writeCommand) => {
    return {
        all: (msg) => {
            const command = commands[msg.chat.id] || {};

            let text = '';

            for (const i in command) {
                text += i + '\n';
            }

            if (text) {
                return bot.sendMessage(
                    msg.chat.id,
                    text,
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        },

        list: (msg, key) => {
            const command = commands[msg.chat.id] || {};

            let text = '';

            for (const i in command[key]) {
                text += command[key][i] + '\n';
            }

            if (text) {
                return bot.sendMessage(
                    msg.chat.id,
                    text,
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        },

        add: (msg, key, value) => {
            commands[msg.chat.id] = commands[msg.chat.id] || {};

            const command = commands[msg.chat.id];

            command[key] = command[key] || [];
            command[key].push(value);

            writeCommand(
                msg.chat,
                key,
                value
            );

            return bot.sendMessage(
                msg.chat.id,
                '已加入 ' + (key || 'bot自言自语') + ' 套餐！',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        },

        get: (msg, key, args) => {
            const game = games[msg.chat.id];
            const command = commands[msg.chat.id] || {};

            let tot = [];
            let level = 0;

            for (const i in command[key]) {
                let text = '';
                let match = {};

                for (let j = 0; j < command[key][i].length; j += 1) {
                    if (command[key][i][j] === '$') {
                        if (command[key][i].slice(j).startsWith('$ME')) {
                            text += msg.from.first_name || msg.from.last_name;
                            j += 2;
                        } else if (command[key][i].slice(j).startsWith('$YOU')) {
                            if (msg.reply_to_message) {
                                text += msg.reply_to_message.from.first_name || msg.reply_to_message.from.last_name;
                                match.you = 1;
                                j += 3;
                            } else {
                                match = null;
                                break;
                            }
                        } else if (command[key][i].slice(j).startsWith('$MODE')) {
                            if (game) {
                                text += game.modename;
                                match.mode = 1;
                                j += 4;
                            } else {
                                match = null;
                                break;
                            }
                        } else if (command[key][i].slice(j).startsWith('$1')) {
                            if (args[0]) {
                                text += args[0] || '';
                                match.args = Math.max(match.args, 1);
                                j += 1;
                            } else {
                                match = null;
                                break;
                            }
                        } else if (command[key][i].slice(j).startsWith('$2')) {
                            if (args[1]) {
                                text += args[1] || '';
                                match.args = Math.max(match.args, 2);
                                j += 1;
                            } else {
                                match = null;
                                break;
                            }
                        } else if (command[key][i].slice(j).startsWith('$3')) {
                            if (args[2]) {
                                text += args[2] || '';
                                match.args = Math.max(match.args, 3);
                                j += 1;
                            } else {
                                match = null;
                                break;
                            }
                        } else {
                            text += command[key][i][j];
                        }
                    } else {
                        text += command[key][i][j];
                    }
                }

                let newLevel = 0;

                for (const j in match) {
                    newLevel += match[j];
                }

                if (level <= newLevel) {
                    if (level < newLevel) {
                        tot = [];
                        level = newLevel;
                    }

                    tot.push(text);
                }
            }

            if (tot.length > 0) {
                return bot.sendMessage(
                    msg.chat.id,
                    tot[Math.floor(Math.random() * tot.length)]
                );
            }
        },
    };
};
