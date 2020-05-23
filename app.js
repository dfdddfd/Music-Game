require("dotenv").config();

const { Client, Collection, MessageEmbed } = require("discord.js");
const { readdirSync } = require("fs");
const chalk = require("chalk");

const client = new Client();

client.commands = new Collection();
client.aliases = new Collection();
client.queue = new Collection();
client.categories = readdirSync("./commands/");

const table = (new(require('ascii-table'))).setHeading("Command", "Status")

readdirSync("./commands/").forEach(dir => {
	for (let file of readdirSync(`./commands/${dir}`).filter(f => f.endsWith(".js"))) {
		let pull = require(`./commands/${dir}/${file}`);

		if (pull.name) {
			client.commands.set(pull.name, pull);
			table.addRow(file, '✅');
		} else {
			table.addRow(file, '❌');
		};

		if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(a => client.aliases.set(a, pull.name));
	};
});

client.login(process.env.token);

client.on("ready", () => {
	console.log(`${table.toString()}\nLogin ${client.user.username}\n----------------------------`);

	const activity = [`${client.guilds.cache.size}개의 서버`, `${client.users.cache.filter(e => !e.bot).size}명의 유저`, `${client.guilds.cache.size} guilds`, `${client.users.cache.filter(e => !e.bot).size} users`];

	setInterval(() => {
		client.user.setActivity(activity[Math.floor(Math.random() * activity.length)]);
	}, 10000)
})

client.on('message', async function (message) {
    if (message.author.bot || message.system || !message.content.startsWith("'")) return;
    const args = message.content.slice(1).trim().split(/ +/g)
	const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    try {
        message.serverQueue = client.queue.get(message.guild.id);
        if (command) {
            command.run(client, message, args)
        }
    } catch (err) {
        message.channel.send('알 수 없는 에러가 발생했습니다..')
        client.users.cache.get('617286714615922698').send(new MessageEmbed().setColor('RED').setDescription(`${message.guild.name} 서버에서 에러가 났습니다..\nError 내용: ${err}`))
        client.users.cache.get('674877162557407242').send(new MessageEmbed().setColor('RED').setDescription(`${message.guild.name} 서버에서 에러가 났습니다..\nError 내용: ${err}`))
    }
})
