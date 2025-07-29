const randomGameName = 'Game_' + Math.floor(Math.random() * 100000);
const randomPlayerNumber = Math.floor(Math.random() * 100).toString();
const randomGameRoomName = 'Game_' + Math.floor(Math.random() * 100000);
const randomEmail = 'email' + Math.floor(Math.random() * 1000) + '@gmail.com';

export let email_data = {
    email: randomEmail
    }

export let game_data = {
    title: randomGameName,
    language: 'EN',
    nPlayer: randomPlayerNumber,
    }

export let game_details_data = {
    gameId: "",
    imgUrl: "http://noimage.com",
    description: "this a game details",
    isPublic: true,
    category: "Any",
    theme: "Any",
    keyWards: ["Any", "Any"],
}

export let game_rules_data = {
    name: randomGameRoomName,
    description: 'This is the game description',
    isActive: true,
    }

export let game_questions_data = {
    gameId: "",
    question: "What is Yuor Name?",
    answer: "2",
    options: {option1: "mnsm", option2: "nsm", option3: "rks", option4: "rts"},
    timeLimit: 10,
    qSource: "Any",
    qImage: "http://noimage.com",
    qPoints: 1,
    qTrophy: "Any",
}
