import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import loginAndGetToken from './auth-utils';
import { v4 as uuidv4 } from "uuid";
import { game_data, game_questions_data, game_details_data } from './data';

chai.use(chaiHttp);
const expect = chai.expect;

describe('✔️✔️✔️ Mindoora Game Questions', function() {
  this.timeout(20000);
  let token : any;
  before(async () => {
      token = await loginAndGetToken();
  });

  let gameId : string;
  let roomId : string;
  let playerId : string;
  let res : any;
  let inviteCode: string;
  it(`should CRUD game question solve`, async () => {
            res = await chai
                        .request(app)
                        .post('/api/v1/usergame/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_data)
            gameId = res.body.gameId
            expect(res).to.have.status(201);

            game_details_data.gameId = gameId
            res = await chai
                            .request(app)
                            .post('/api/v1/gamedetails/create')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_details_data)
            expect(res).to.have.status(201);

            game_questions_data.gameId = gameId
            res = await chai
                        .request(app)
                        .post('/api/v1/question/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_questions_data)
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .post('/api/v1/gameroom/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send({gameId})
            inviteCode = res.body.inviteCode
            roomId = res.body.roomId
            expect(res).to.have.status(201);


            let game_player_data = {inviteCode, name: 'mnsm'}
            res = await chai
                        .request(app)
                        .post('/api/v1/ogameplayer/create')
                        .send(game_player_data)
            playerId = res.body.player.id
            expect(res).to.have.status(201);

            let game_player_update = {id: playerId, isApproved: true}
            res = await chai
                        .request(app)
                        .put('/api/v1/pgameplayer/update')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_player_update)
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .get('/api/v1/questionsolved/allrawv2')
            expect(res).to.have.status(400);

            res = await chai
                        .request(app)
                        .get('/api/v1/questionsolved/allrawv2?playerId=')
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .get('/api/v1/questionsolved/allrawv2?playerId=' + playerId)
            expect(res).to.have.status(404);


            let update_game_room_data = {id: roomId, status: 'live'}
            res = await chai
                        .request(app)
                        .put('/api/v1/gameroom/update')
                        .set('Authorization', `Bearer ${token}`)
                        .send(update_game_room_data)
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .get('/api/v1/questionsolved/allrawv2?playerId=' + playerId)
            let question = res.body.result.allQuestions
            expect(question.length).to.greaterThan(0);
            expect(res).to.have.status(201);

            res = await chai
                        .request(app)
                        .get('/api/v1/questionsolved/allrawv2?playerId=' + playerId)
            question = res.body.result.allQuestions
            expect(question.length).to.greaterThan(0);
            expect(res).to.have.status(201);


            let question_solved = {playerId, questionId: question[0].id, answer: "2", timeTaken: 20}
            res = await chai
                        .request(app)
                        .post('/api/v1/questionsolved/create')
                        .send(question_solved)
            expect(res).to.have.status(201);

            res = await chai
                        .request(app)
                        .post('/api/v1/questionsolved/create')
                        .send(question_solved)
            expect(res).to.have.status(409);

            question_solved.playerId = uuidv4()
            res = await chai
                        .request(app)
                        .post('/api/v1/questionsolved/create')
                        .send(question_solved)
            expect(res).to.have.status(404);


            res = await chai
                        .request(app)
                        .delete(`/api/v1/usergame/delete?id=${gameId}`)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);

  }).timeout(20000);
});
