module.exports = {
    name: 'stop',
    aliases: ['정지', 'stop'],
    category: "음악",
    description: '재생 중인 노래를 정지합니다.',
    run: async function (client, message, args) {
        if (!message.member.voice.channel) return message.channel.send("음악을 멈추려면 음성 채널에 들어가야 합니다.");
        if (!message.serverQueue) return message.channel.send("현재 재생 중인 노래가 없습니다.");
        message.serverQueue.songs = [];
        message.serverQueue.connection.dispatcher.end();
    }
}