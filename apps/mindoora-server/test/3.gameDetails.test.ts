import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import loginAndGetToken from './auth-utils';
import { v4 as uuidv4 } from "uuid";
import { game_data, game_details_data } from './data';

chai.use(chaiHttp);
const expect = chai.expect;

describe('✔️✔️✔️ Mindoora Game Details', function() {
  this.timeout(20000);
    let token : any;
    before(async () => {
        token = await loginAndGetToken();
    });

    let gameId : string;
    let res : any;
  it(`should CRUD game details`, async () => {
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

            res = await chai
                            .request(app)
                            .post('/api/v1/gamedetails/create')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_details_data)
            expect(res).to.have.status(409);

            game_details_data.gameId = uuidv4()
            res = await chai
                            .request(app)
                            .post('/api/v1/gamedetails/create')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_details_data)
            expect(res).to.have.status(404);


            res = await chai
                            .request(app)
                            .get('/api/v1/gamedetails/one?gameId=&gameTitle=')
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(400);

            res = await chai
                            .request(app)
                            .get('/api/v1/gamedetails/one?gameId=nothing&gameTitle=nothing')
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(400);

            res = await chai
                            .request(app)
                            .get('/api/v1/gamedetails/one?gameId=' + uuidv4())
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(404);

            res = await chai
                            .request(app)
                            .get('/api/v1/gamedetails/one?gameId=' + gameId)
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(201);

            res = await chai
                            .request(app)
                            .get('/api/v1/gamedetails/one?gameTitle=' + game_data.title)
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(201);


            game_details_data.gameId = uuidv4()
            res = await chai
                            .request(app)
                            .put('/api/v1/gamedetails/update')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_details_data)
            expect(res).to.have.status(404);

            game_details_data.gameId = gameId
            res = await chai
                            .request(app)
                            .put('/api/v1/gamedetails/update')
                            .set('Authorization', `Bearer ${token}`)
                            .send(game_details_data)
            expect(res).to.have.status(201);


            res = await chai
                            .request(app)
                            .delete('/api/v1/gamedetails/delete?gameId=' + gameId)
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);


            res = await chai
                            .request(app)
                            .delete(`/api/v1/usergame/delete?id=${gameId}`)
                            .set('Authorization', `Bearer ${token}`)
            expect(res).to.have.status(204);

  }).timeout(20000);
});
