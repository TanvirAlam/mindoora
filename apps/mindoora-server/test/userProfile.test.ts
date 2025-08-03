import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import { pool } from '../utils/PrismaInstance';
import jwt from 'jsonwebtoken';

chai.use(chaiHttp);
const expect = chai.expect;

// Mock user data for testing
const mockUserData = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  phone: '+1234567890',
  password: 'hashedpassword',
  role: 'user',
  accessToken: 'mock-access-token',
  verified: true,
  createdAt: new Date()
};

const mockProfileData = {
  name: 'Test User',
  bio: 'This is a test bio',
  location: 'Test City, Test Country',
  website: 'https://testwebsite.com',
  twitter: 'testuser',
  instagram: 'testuser',
  linkedin: 'testuser'
};

// Helper function to generate a valid JWT token for testing
const generateTestToken = (email: string) => {
  const jwtSecret = process.env.JWT_SECRETE || 'This-is-my-secrete-key';
  return jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });
};

describe('✔️✔️✔️ User Profile Endpoints', () => {
  let testToken: string;
  let testUserId: string;

  before(async () => {
    // Clean up any existing test data
    await pool.query('DELETE FROM "User" WHERE "registerId" IN (SELECT id FROM "Register" WHERE email = $1)', [mockUserData.email]);
    await pool.query('DELETE FROM "Register" WHERE email = $1', [mockUserData.email]);
    
    // Create test user in Register table
    const registerResult = await pool.query(`
      INSERT INTO "Register" (id, email, phone, password, role, "accessToken", verified, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      mockUserData.id,
      mockUserData.email,
      mockUserData.phone,
      mockUserData.password,
      mockUserData.role,
      mockUserData.accessToken,
      mockUserData.verified,
      mockUserData.createdAt
    ]);
    
    testUserId = registerResult.rows[0].id;
    
    // Create corresponding User record
    await pool.query(`
      INSERT INTO "User" (name, image, bio, location, website, twitter, instagram, linkedin, "registerId")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      mockProfileData.name,
      'test-avatar.png',
      mockProfileData.bio,
      mockProfileData.location,
      mockProfileData.website,
      mockProfileData.twitter,
      mockProfileData.instagram,
      mockProfileData.linkedin,
      testUserId
    ]);
    
    // Generate test token
    testToken = generateTestToken(mockUserData.email);
  });

  after(async () => {
    // Clean up test data
    await pool.query('DELETE FROM "User" WHERE "registerId" = $1', [testUserId]);
    await pool.query('DELETE FROM "Register" WHERE id = $1', [testUserId]);
  });

  describe('GET /api/v1/user/profile', () => {
    it('should get user profile successfully', (done) => {
      chai
        .request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'Profile retrieved successfully');
          expect(res.body.profile).to.have.property('id', testUserId);
          expect(res.body.profile).to.have.property('name', mockProfileData.name);
          expect(res.body.profile).to.have.property('email', mockUserData.email);
          expect(res.body.profile).to.have.property('phone', mockUserData.phone);
          expect(res.body.profile).to.have.property('bio', mockProfileData.bio);
          expect(res.body.profile).to.have.property('location', mockProfileData.location);
          expect(res.body.profile).to.have.property('website', mockProfileData.website);
          expect(res.body.profile.socialMedia).to.have.property('twitter', mockProfileData.twitter);
          expect(res.body.profile.socialMedia).to.have.property('instagram', mockProfileData.instagram);
          expect(res.body.profile.socialMedia).to.have.property('linkedin', mockProfileData.linkedin);
          expect(res.body.profile).to.have.property('verified', mockUserData.verified);
          expect(res.body.profile).to.have.property('totalScore');
          done();
        });
    });

    it('should return 401 without authentication token', (done) => {
      chai
        .request(app)
        .get('/api/v1/user/profile')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message', 'No token provided');
          done();
        });
    });

    it('should return 403 with invalid token', (done) => {
      chai
        .request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', 'Bearer invalid-token')
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  describe('PUT /api/v1/user/profile', () => {
    it('should update user profile successfully', (done) => {
      const updatedData = {
        name: 'Updated Test User',
        bio: 'Updated test bio',
        location: 'Updated Test City',
        website: 'https://updatedwebsite.com',
        twitter: 'updateduser',
        instagram: 'updateduser',
        linkedin: 'updateduser'
      };

      chai
        .request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'Profile updated successfully');
          expect(res.body.profile).to.have.property('name', updatedData.name);
          expect(res.body.profile).to.have.property('bio', updatedData.bio);
          expect(res.body.profile).to.have.property('location', updatedData.location);
          expect(res.body.profile).to.have.property('website', updatedData.website);
          expect(res.body.profile.socialMedia).to.have.property('twitter', updatedData.twitter);
          done();
        });
    });

    it('should return 400 when name is missing', (done) => {
      chai
        .request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ bio: 'Test bio without name' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message', 'Name is required');
          done();
        });
    });

    it('should sanitize social media handles', (done) => {
      chai
        .request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test User',
          twitter: '@twitterhandle',
          instagram: '@instagramhandle'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.profile.socialMedia.twitter).to.equal('twitterhandle');
          expect(res.body.profile.socialMedia.instagram).to.equal('instagramhandle');
          done();
        });
    });
  });

  describe('PUT /api/v1/user/profile/avatar', () => {
    it('should update user avatar successfully', (done) => {
      const newAvatarUrl = 'new-test-avatar.png';
      
      chai
        .request(app)
        .put('/api/v1/user/profile/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ imageUrl: newAvatarUrl })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'Avatar updated successfully');
          expect(res.body.user).to.have.property('avatar', newAvatarUrl);
          done();
        });
    });

    it('should return 400 when imageUrl is missing', (done) => {
      chai
        .request(app)
        .put('/api/v1/user/profile/avatar')
        .set('Authorization', `Bearer ${testToken}`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});

