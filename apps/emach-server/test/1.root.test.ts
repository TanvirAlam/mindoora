import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index'

chai.use(chaiHttp);

describe('✔️✔️✔️ Mindoora Root', () => {
    it('should return a 200 status code on GET /', (done) => {
      chai
        .request(app)
        .get('/')
        .end((err, res) => {
          chai.expect(res).to.have.status(200);
          done();
        });
    });
  });


export default app;
