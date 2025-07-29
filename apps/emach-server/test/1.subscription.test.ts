import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import { v4 as uuidv4 } from "uuid";
import { email_data } from './data';

chai.use(chaiHttp);
const expect = chai.expect;

describe('✔️✔️✔️ Mindoora Subscription', function() {
  let res : any;
  it(`should create a subscription`, async () => {
            res = await chai
                        .request(app)
                        .post('/api/v1/subscription/create')
                        .send(email_data)
            expect(res).to.have.status(201);

            res = await chai
                        .request(app)
                        .post('/api/v1/subscription/create')
                        .send(email_data)
            expect(res).to.have.status(409);
  }).timeout(20000);
});
