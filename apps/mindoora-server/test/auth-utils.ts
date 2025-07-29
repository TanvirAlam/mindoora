import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

chai.use(chaiHttp);

const loginAndGetToken = () => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send({
        email: process.env.NEXT_PUBLIC_TEST_EMAIL,
        password: process.env.NEXT_PUBLIC_TEST_PASSWORD
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.have.property('accessToken');
          resolve(res.body.accessToken);
        }
      });
  });
};

export default loginAndGetToken;
