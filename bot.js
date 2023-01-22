require('dotenv').config();

//Commands
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [{
    name: 'ping',
    description: 'Pings the bot!',
},
{
    name: 'roll',
    description: 'Roll any size dice.',
    options: [
        {
            name: "number",
            description: "Number of Dice to be rolled.",
            type: 4,
            required: true,
        },
        {
            name: "size",
            description: "Determine the size of the dice to be rolled, example 20 for d20.",
            type: 4,
            required: true,
        },
        {
            name: "modifier",
            description: "Will add to the total when dice rolled.",
            type: 4,
            required: false,
        }
    ]
},
{
    name: 'rolladv',
    description: 'Roll dice with advantage.',
    options: [
        {
            name: "size",
            description: "Determine the size of the dice to be rolled, example 20 for d20.",
            type: 4,
            required: false,
        },
    ]
},
{
    name: 'rolldisadv',
    description: 'Roll dice with disadvantage.',
    options: [
        {
            name: "size",
            description: "Determine the size of the dice to be rolled, example 20 for d20.",
            type: 4,
            required: false,
        },
    ]
},
{
    name: 'rollpot',
    description: 'Roll a potions effect.',
    options: [
        {
            name: "potion",
            description: "Determines which potion you have.",
            type: 3,
            required: true,
            choices: [{
                name: "Healing Potion",
                value: "healing_pot",
            },
            {
                name: "Greater Healing Potion",
                value: "greater_pot",
            },
            {
                name: "Superior Healing Potion",
                value: "superior_pot",
            },
            {
                name: "Supreme Healing Potion",
                value: "supreme_pot",
            },]
        },
    ]
},
{
    name: 'addeffect',
    description: 'Adds an effect that is effecting a creature. Keeps track of the rounds the effect has left.',
    options: [
        {
            name: "name",
            description: "Determines what the effect is.",
            type: 3,
            required: true,
        },
        {
            name: "affected",
            description: "Who is affected by the effect?",
            type: 3,
            required: true,
        },
        {
            name: "rounds",
            description: "How many rounds does the effect take place?",
            type: 4,
            required: true,
        }
    ]
},
{
    name: 'nextround',
    description: 'Progress all effects',
},
{
    name: 'showeffects',
    description: 'Shows all effects',
    options: [
        {
            name: "affected",
            description: "Show all effects that are on a certain person.",
            type: 3,
            required: false,
        },
    ]
},
]; 

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();


//Command functions
function diceRoller(number, size, mod = 0){
    var ranNum;
    var total = 0;
    var outText = number.toString() + "d" + size.toString() + ": ";
    for(let i = 0; i < number; i++){
        ranNum = Math.ceil(Math.random()*(size));
        total += ranNum;
        if(i == 0){
            outText += ranNum.toString();
        }else{
            outText += ", " + ranNum.toString();
        }
    }
    total += mod;
    outText += " | Modifier: +" + mod.toString() + " | Total: " + total.toString(); 
    return outText;
}

function rollWithAdv(size){
    var ranNum1;
    var ranNum2;
    var outText = "2d" + size.toString() + ": ";
    ranNum1 = Math.ceil(Math.random()*(size));
    ranNum2 = Math.ceil(Math.random()*(size));
    outText += ranNum1.toString() + ", " + ranNum2.toString() + " | ";
    if(ranNum1 > ranNum2){
        outText += ranNum1.toString();
    }else{
        outText += ranNum2.toString();
    }
    return outText;
}

function rollWithDisAdv(size){
    var ranNum1;
    var ranNum2;
    var outText = "2d" + size.toString() + ": ";
    ranNum1 = Math.ceil(Math.random()*(size));
    ranNum2 = Math.ceil(Math.random()*(size));
    outText += ranNum1.toString() + ", " + ranNum2.toString() + " | ";
    if(ranNum1 < ranNum2){
        outText += ranNum1.toString();
    }else{
        outText += ranNum2.toString();
    }
    return outText;
}

function addEffect(name, effected, numOfRs){
    effectArray.push(new Array(name, effected, numOfRs));
}

function progressEffects(){
    let endedEffects = new Array(0);
    for(let i = 0; i < effectArray.length; i++){
        if(effectArray[i][2] - 1 <=0){
            endedEffects.push(effectArray[i]);
            effectArray.splice(i,1);
            i--;
        }else{
            effectArray[i][2] -=1;
        }
    }

    if(endedEffects.length > 0){
        return endedEffects;
    }else{
        return "None";
    }
}

function showEffects(affected = "na"){
    let affectedArray = new Array(0);
    if(effectArray.length > 0){
        if(affected === "na"){
            return effectArray;
        }else{
            for(let i = 0; i < effectArray.length; i++){
                if(effectArray[i][1] === affected){
                    affectedArray.push(effectArray[i]);
                }
            }
            if(affectedArray.length > 0){
                return affectedArray;
            }else{
                return "None";
            }
        }
    }else{
        return "None";
    }
}
//Start of bot activation
let effectArray = new Array(0);

const {Client, GatewayIntentBits} = require('discord.js');

const Discord = require("discord.js");
const { parseArgs } = require('util');
const client = new Discord.Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on("ready", () => { 
    console.log(`Logged in as ${client.user.tag}!`) 
}); 

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()){ return;}

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
        return;
    }
    if (interaction.commandName === 'roll') {
        const num = interaction.options.getInteger("number");
        const size = interaction.options.getInteger("size");
        const mod = interaction.options.getInteger("modifier") ?? 0;
        await interaction.reply(diceRoller(num,size,mod));
        return;
    }
    if (interaction.commandName === 'rolladv') {
        const size = interaction.options.getInteger("size") ?? 20;
        await interaction.reply(rollWithAdv(size));
        return;
    }
    if (interaction.commandName === 'rolldisadv') {
        const size = interaction.options.getInteger("size") ?? 20;
        await interaction.reply(rollWithDisAdv(size));
        return;
    }
    if(interaction.commandName === 'rollpot'){
        const type = interaction.options.getString("potion")
        if(type === 'healing_pot'){
            await interaction.reply(diceRoller(2,4,2));
            return; 
        }else if(type === 'greater_pot'){
            await interaction.reply(diceRoller(4,4,4));
            return; 
        }else if(type === 'superior_pot'){
            await interaction.reply(diceRoller(8,4,8));
            return; 
        }else if(type === 'supreme_pot'){
            await interaction.reply(diceRoller(10,4,20));
            return; 
        }
    }
    if (interaction.commandName === 'addeffect') {
        const name = interaction.options.getString("name");
        const affected = interaction.options.getString("affected");
        const rounds = interaction.options.getInteger("rounds");
        if(rounds <= 0){
            await interaction.reply("Rounds must be greater than 0!!!!");
            return;
        }
        addEffect(name, affected, rounds);
        await interaction.reply("Adding the effect " + name + " which affects " + affected + " for " + rounds + " rounds!");
        return;
    }
    if (interaction.commandName === 'nextround') {
        let temp = progressEffects();
        let ended = new Array();
        if(temp === "None"){
            await interaction.reply("Advancing to next round.");
            return;
        }else{
            ended = temp;
            var outText = "";
            outText += "These effects ended: \n";
            for(let i = 0; i<ended.length; i++){
                outText += "Effect: " + ended[i][0] + ", Affected: " + ended[i][1] + "\n";
            }
            interaction.reply(outText);
            return;
        }

    }
    if (interaction.commandName === 'showeffects') {
        const affected = interaction.options.getString("affected") ?? "na";
        if(affected === "na"){
            let temp = showEffects();
            let effects = new Array();
            if(temp === "None"){
                await interaction.reply("No effects are active!");
                return;
            }else{
                effects = temp;
                var outText = "";
                for(let i = 0; i<effects.length; i++){
                    outText += "Effect: " + effects[i][0] + ", Affected: " + effects[i][1] + ", Rounds: " + effects[i][2] + "\n";
                }
                await interaction.reply(outText);
                return;
            }
        }else{
            let temp = showEffects(affected);
            if(temp === "None"){
                await interaction.reply("No effects are active on "+ affected +"!");
                return;
            }else{
                effects = temp;
                var outText = "Active on " + affected + "\n";
                for(let i = 0; i<effects.length; i++){
                    outText += "Effect: " + effects[i][0] + ", Rounds: " + effects[i][2] + "\n";
                }
                await interaction.reply(outText);
                return;
            }
        }

    }
});

client.login(process.env.DISCORD_TOKEN);