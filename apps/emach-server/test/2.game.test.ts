import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import loginAndGetToken from './auth-utils';
import { game_data } from './data';

chai.use(chaiHttp);
const expect = chai.expect;


describe('✔️✔️✔️ Mindoora User Games', function() {
  this.timeout(20000);
  let token : any;
  before(async () => {
    token = await loginAndGetToken();
  });

  let gameId : string;
  let title : string;
  let res : any;
  it('should CRUD user game', async () => {
      res = await chai
                            .request(app)
                            .post('/api/v1/usergame/create')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_data);
      expect(res).to.have.status(201);
      gameId = res.body.gameId

      res = await chai
                            .request(app)
                            .post('/api/v1/usergame/create')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_data);
      expect(res).to.have.status(409);


      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/one')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(400);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/one?id=fake&title=fake')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(400);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/one?id=fake')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/one?id=' + gameId)
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200);
      title = res.body.result.games.title


      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/one?title=' + title)
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200);


      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/allofgame')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(400);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/allofgame?id=fake&title=fake')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(400);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/allofgame?id=fake')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/allofgame?id=' + gameId)
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200);

      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/allofgame?title=' + title)
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200);


      res = await chai
                            .request(app)
                            .get('/api/v1/usergame/all')
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(200);


      let update_game_data = {...game_data, id: ""}
      update_game_data.id = "FALSE"
      res = await chai
                            .request(app)
                            .put('/api/v1/usergame/update')
                            .set('Authorization', `Bearer ${token}`)
                            .send(update_game_data)
      expect(res).to.have.status(404);

      update_game_data.id = gameId
      res = await chai
                            .request(app)
                            .put('/api/v1/usergame/update')
                            .set('Authorization', `Bearer ${token}`)
                            .send(update_game_data)
      expect(res).to.have.status(201);


      res = await chai
                            .request(app)
                            .delete(`/api/v1/usergame/delete`)
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(400);

      res = await chai
                            .request(app)
                            .delete(`/api/v1/usergame/delete?id=FAKE`)
                            .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404);

      const res1 = await chai
                            .request(app)
                            .delete(`/api/v1/usergame/delete?id=${gameId}`)
                            .set('Authorization', `Bearer ${token}`)
      expect(res1).to.have.status(204);

  }).timeout(20000);
});
