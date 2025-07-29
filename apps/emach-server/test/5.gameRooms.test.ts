import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import loginAndGetToken from './auth-utils';
import { v4 as uuidv4 } from "uuid";
import { game_data, game_questions_data, game_details_data } from './data';

chai.use(chaiHttp);
const expect = chai.expect;

describe('✔️✔️✔️ Mindoora Game Rooms', function() {
  this.timeout(20000);
  let token : any;
  before(async () => {
      token = await loginAndGetToken();
  });

  let gameId : string;
  let roomId : string;
  let res : any;
  let inviteCode: string;
  it(`should CRUD game rooms`, async () => {
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

            res = await chai
                        .request(app)
                        .post('/api/v1/gameroom/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send({gameId})
            expect(res.body.inviteCode).to.equal(inviteCode);
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .get('/api/v1/gameroom/one?id=')
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .get('/api/v1/gameroom/one?id=' + uuidv4())
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .get('/api/v1/gameroom/one?id=' + roomId)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(201);


            let status = 'created';
            res = await chai
                        .request(app)
                        .get('/api/v1/gameroom/allbystatus?status=' + status)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(201);

            res = await chai
                        .request(app)
                        .get('/api/v1/gameroom/allbystatus?status=' )
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(400);

            status = 'closed'
            res = await chai
                        .request(app)
                        .get('/api/v1/gameroom/allbystatus?status=' + status )
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);


            let update_game_room_data = {id: uuidv4(), status: 'closed'}
            res = await chai
                        .request(app)
                        .put('/api/v1/gameroom/update')
                        .set('Authorization', `Bearer ${token}`)
                        .send(update_game_room_data)
            expect(res).to.have.status(404);

            update_game_room_data.id = roomId
            res = await chai
                        .request(app)
                        .put('/api/v1/gameroom/update')
                        .set('Authorization', `Bearer ${token}`)
                        .send(update_game_room_data)
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .delete('/api/v1/gameroom/delete')
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(400);

            res = await chai
                        .request(app)
                        .delete('/api/v1/gameroom/delete?id=')
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .delete('/api/v1/gameroom/delete?id=' + uuidv4())
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .delete('/api/v1/gameroom/delete?id=' + roomId)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);


            res = await chai
                        .request(app)
                        .delete(`/api/v1/usergame/delete?id=${gameId}`)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);

  }).timeout(20000);
});
