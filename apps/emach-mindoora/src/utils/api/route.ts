export const endPoints = {
  auth: {
    register: "/v1/auth/register",
    login: "/v1/auth/login",
    verify: "/v1/auth/verify",
    resetPassword: "/auth/resetPassword",
  },
  userGame: {
    create: "/v1/usergame/create",
    update: "/v1/usergame/update",
    delete: "/v1/usergame/delete",
    all: "/v1/usergame/all",
    allv2: "/v1/usergame/allv2",
    allpublic: "/v1/usergame/allpublic",
    allpublicv2: "/v1/usergame/allpublicv2",
    one: "/v1/usergame/one",
    allofgame: "/v1/usergame/allofgame"
  },
  userGameOpen: {
    one: "/v1/ousergame/one",
  },
  notification: {
    all: "/v1/notification/all",
  },
  question: {
    create: "/v1/question/create",
    update: "/v1/question/update",
    delete: "/v1/question/delete",
    all: "/v1/question/all",
    one: "/v1/question/one",
  },
  gameDetails: {
    create: "/v1/gamedetails/create",
    update: "/v1/gamedetails/update",
    delete: "/v1/gamedetails/delete",
    one: "/v1/gamedetails/one",
  },
  image: {
    upload: "/v1/image/upload",
    getone: "/v1/getimage/"
  },
  gameRoom: {
    create: "/v1/gameroom/create",
    delete: "/v1/gameroom/delete",
    update: "/v1/gameroom/update",
    one: "/v1/gameroom/one",
    allbystatus: "/v1/gameroom/allbystatus"
  },
  gamePlayerOpen: {
    create: "/v1/ogameplayer/create",
    allplayer: "/v1/ogameplayer/allplayer",
    result: "/v1/ogameplayer/result"
  },
  gamePlayerProtected: {
    delete: "/v1/pgameplayer/delete",
    allplayer: "/v1/pgameplayer/allplayer",
    update: "/v1/pgameplayer/update",
    confirmall: "/v1/pgameplayer/confirmall"
  },
  questionSolved: {
    create: "/v1/questionsolved/create",
    allrawv2: "/v1/questionsolved/allrawv2",
    allsolved: "/v1/questionsolved/allsolved"
  },
  subscription: {
    create: "/v1/subscription/create",
  },
  livekit: {
    get: "/v1/livekit/get",
  },
  feedback: {
    create: "/v1/feedback/create",
  },
  gameScore: {
    create: "/v1/gamescore/create",
  },
  friend: {
    send: "/v1/friend/send",
    delete: "/v1/friend/delete",
    accept: "/v1/friend/accept",
    reject: "/v1/friend/reject",
    status: "/v1/friend/status",
    all: "/v1/friend/all",
    allmutual: "/v1/friend/allmutual",
    allpendingtome: "/v1/friend/allpendingtome",
    allpendingtofriend: "/v1/friend/allpendingtofriend"
  },
  qInDb: {
    create: "/v1/qindb/create"
  },
  user: {
    getTopAuthors: "/v1/user/getTopAuthors",
    getSearchedAuthors: "/v1/user/getSearchedAuthors",
    getOne: "/v1/user/getOne"
  },
  follow: {
    create: "/v1/follow/create",
    delete: "/v1/follow/delete",
    isFollowing: "/v1/follow/isFollowing"
  },
  acceptTC: {
    save: "/v1/accepttc/save",
    get: "/v1/accepttc/get"
  },
  gameExperience: {
    save: "/v1/gameexp/save"
  },
  account: {
    delete: "/v1/account/delete"
  }
};
