const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "help",
    aliases: ["도움", "ㅗ디ㅔ", "ehdna", "도움말"],
    category: "커맨드",
    usage: "[command | alias]",
    description: 'help command',
    run: async (client, message, args, ops) => {
        if (args.join(' ')) {
            const embed = new MessageEmbed();
        
            const cmd = client.commands.get(args.join(" ").toLowerCase()) || client.commands.get(client.aliases.get(args.join(" ").toLowerCase()));
        
            let info = `**${args.join(" ").toLowerCase()}**에 대한 명령어를 찾을 수 없습니다.`;
        
            if (!cmd) return message.channel.send(embed.setColor(0xff0000).setTitle(info));
        
            if (cmd.name) embed.setTitle(`${cmd.name} info`);
            if (cmd.aliases) info = `\n**Aliases**\n${cmd.aliases.map(a => `${a}`).join(", ")}\n`;
            if (cmd.description) info += `\n**Description**\n${cmd.description}\n`;
            if (cmd.usage) {
                info += `\n**Usage**\n${cmd.usage}\n`;
                embed.setFooter(`Syntax: <> = required, [] = optional`);
            };
            if (cmd.category) info += `\n**Category**\n${cmd.category}`;
        
            embed.setDescription(info).setColor(0x00ffff);
        
            return message.channel.send(embed);
        } else {
            const commandEmbed = new MessageEmbed().setColor(0x00ffff).setTitle(`${client.user.username} 도움말`)
        
            const commands = (category) => {
                return client.commands.filter(cmd => cmd.category === category).map(cmd => `\`${cmd.name}\``).join(", ");
            };
        
            const info = client.categories.filter(n => n !== "owner").map(cat => stripIndents`**${cat[0].toLowerCase() + cat.slice(1)}**\n${commands(cat)}`).reduce((string, category) => string + "\n\n" + category);

            message.channel.send(commandEmbed.setDescription(info));
        };
    }
};