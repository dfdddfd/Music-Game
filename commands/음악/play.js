const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const search = require('yt-search');
function play (client, guild, song, info, m, message) {
    const serverQueue = client.queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        client.queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection.play(ytdl(song.song.url));
    const imbed = new Discord.MessageEmbed()
        .setTitle('노래 재생 시작')
        .setDescription(`[\`\`\`\n${info.title}\n\`\`\`](${info.video_url})가 곧 재생됩니다`)
        .setColor(0x00ffff)
        .setThumbnail(info.author.avatar)
        .setTimestamp()
    m.edit(imbed);
    dispatcher.on('finish', function () {
            serverQueue.songs.shift();
            play(client, guild, serverQueue.songs[0], info, m, message);
        });
    dispatcher.on('error', function (error) {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}
module.exports = {
    name: 'play', 
    aliases: ['재생', 'play'],
    category: "음악",
    description: '유튜브에서 노래를 검색해 재생합니다. (url, 유튜브 검색어 둘 다 가능)',
    run: async function (client, message, args, option) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send(
                "음악을 재생하려면 음성 채널에 들어가야 합니다."
            );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send(
                "음성 채널 연결 권한과 말하기 권한이 필요합니다."
            );
        }
        if (!args.join(' ')) return message.channel.send('뒤에 검색어또는 URL을 입력해주세요!')
        const embed = new Discord.MessageEmbed()
            .setTitle(`${client.emojis.cache.find(x => x.name == 'loadingCirclebar')} 노래 로딩 중`)
            .setColor(0xffff00)
            .addField('검색어 또는 노래 URL', args.join(' '), true)
            .setFooter(message.author.tag, message.author.avatarURL({
                dynamic: true
            }))
            .setTimestamp()
        let m = await message.channel.send(embed);
        var url = null;
        if (!(args.join(' ').startsWith('http://www.youtube.com') || args.join(' ').startsWith('https://www.youtube.com') || args.join(' ').startsWith('youtube.com') || args.join(' ').startsWith('www.youtube.com') || args.join(' ').startsWith('http://youtube.com') || args.join(' ').startsWith('https://youtube.com'))) {
            search(args.join(' '), async function (err, response) {
                url = response.videos[0].url;
                const songInfo = await ytdl.getInfo(url);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url
                };
                if (!message.serverQueue) {
                    const queueContruct = {
                        textChannel: message.channel,
                        voiceChannel: voiceChannel,
                        connection: null,
                        songs: [],
                        volume: 5,
                        playing: true
                    };
                    queueContruct.songs.push({
                        song: song,
                        author: message.author
                    });
                    try {
                        var connect = await voiceChannel.join();
                        queueContruct.connection = connect;
                        client.queue.set(message.guild.id, queueContruct);
                        play(client, message.guild, queueContruct.songs[0], songInfo, m, message);
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    message.serverQueue.songs.push({
                        song: song,
                        author: message.author
                    });
                    const emved = new Discord.MessageEmbed()
                        .setTitle(`노래 재생 대기 중(대기열 ${message.serverQueue.songs.length - 1}번)`)
                        .setDescription(`[${songInfo.title}](${songInfo.video_url})가 대기열에 추가됬습니다.`)
                        .setColor(0x00ffff)
                        .setThumbnail(songInfo.author.avatar)
                        .setTimestamp()
                    m.edit(emved);
                    return;
                }
            })
        } else {
            url = args.join(' ');
            const songInfo = await ytdl.getInfo(url);
            const song = {
                title: songInfo.title,
                url: songInfo.video_url
            };
            if (!message.serverQueue) {
                const queueContruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                };
                queueContruct.songs.push({
                    song: song,
                    author: message.author
                });
                try {
                    var connect = await voiceChannel.join();
                    queueContruct.connection = connect;
                    client.queue.set(message.guild.id, queueContruct);
                    play(client, message.guild, queueContruct.songs[0], songInfo, m, message);
                } catch (err) {
                    console.log(err);
                    client.queue.delete(message.guild.id);
                    return message.channel.send(err);
                }
            } else {
                message.serverQueue.songs.push(song);
                const emved = new Discord.MessageEmbed()
                .setTitle(`노래 재생 대기 중(대기열 ${message.serverQueue.songs.length - 1}번)`)
                .setDescription(`[${songInfo.title}](${songInfo.video_url})가 대기열에 추가됬습니다.`)
                .setColor(0x00ffff)
                .setThumbnail(songInfo.author.avatar)
                .setTimestamp()
                m.edit(emved);
                return;
            }
        }
    }
}