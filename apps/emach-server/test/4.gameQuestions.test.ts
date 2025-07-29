import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import loginAndGetToken from './auth-utils';
import { v4 as uuidv4 } from "uuid";
import { game_data, game_questions_data } from './data';

chai.use(chaiHttp);
const expect = chai.expect;

describe('✔️✔️✔️ Mindoora Game Questions', function() {
  this.timeout(20000);
  let token : any;
  before(async () => {
      token = await loginAndGetToken();
  });

  let gameId : string;
  let questionId : string;
  let res : any;
  it(`should CRUD game questions`, async () => {
            res = await chai
                        .request(app)
                        .post('/api/v1/usergame/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_data)
            gameId = res.body.gameId
            expect(res).to.have.status(201);


            game_questions_data.gameId = gameId
            res = await chai
                        .request(app)
                        .post('/api/v1/question/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_questions_data)
            questionId = res.body.questionId
            expect(res).to.have.status(201);

            res = await chai
                        .request(app)
                        .post('/api/v1/question/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_questions_data)
            expect(res).to.have.status(409);

            game_questions_data.gameId = uuidv4()
            res = await chai
                        .request(app)
                        .post('/api/v1/question/create')
                        .set('Authorization', `Bearer ${token}`)
                        .send(game_questions_data)
            expect(res).to.have.status(404);


            res = await chai
                        .request(app)
                        .get('/api/v1/question/one?id=')
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .get('/api/v1/question/one?id=' + uuidv4())
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .get('/api/v1/question/one?id=' + questionId)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .get('/api/v1/question/all?gameId=' + gameId)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(201);

            res = await chai
                        .request(app)
                        .get('/api/v1/question/all?gameId=' + uuidv4())
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            let update_game_questions_data = {...game_questions_data, id: uuidv4()}
            update_game_questions_data.question = "This question is updated"
            delete update_game_questions_data.gameId;

            res = await chai
                        .request(app)
                        .put('/api/v1/question/update')
                        .set('Authorization', `Bearer ${token}`)
                        .send(update_game_questions_data)
            expect(res).to.have.status(404);

            update_game_questions_data.id = questionId
            res = await chai
                        .request(app)
                        .put('/api/v1/question/update')
                        .set('Authorization', `Bearer ${token}`)
                        .send(update_game_questions_data)
            expect(res).to.have.status(201);


            res = await chai
                        .request(app)
                        .delete('/api/v1/question/delete?id=' + uuidv4())
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                        .request(app)
                        .delete('/api/v1/question/delete?id=' + questionId)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);


            res = await chai
                        .request(app)
                        .delete(`/api/v1/usergame/delete?id=${gameId}`)
                        .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);

  }).timeout(20000);
});
