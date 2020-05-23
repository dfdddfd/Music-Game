module.exports = {
    name: 'skip',
    aliases: ['스킵', '건너뛰기', 'skip'],
    category: "음악",
    description: '재생 중인 노래를 스킵합니다.',
    run: async function (client, message, args) {
        if (!message.member.voice.channel) return message.channel.send("음악을 스킵하려면 음성 채널에 들어가야 합니다.");
        if (!message.serverQueue) return message.channel.send("현재 재생 중인 노래가 없습니다.");
        if (message.serverQueue.songs[0].author.id != message.author.id) return message.channel.send('음악을 재생한 유저만 음악을 스킵할 수 있습니다.');
        message.channel.send(`${message.serverQueue.songs[0].song.title}을/를 스킵했습니다. `).then(function () {
            message.serverQueue.connection.dispatcher.end();
        });
    }
}