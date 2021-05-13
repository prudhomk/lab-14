import client from '../lib/client.js';
import supertest from 'supertest';
import app from '../lib/app.js';
import { execSync } from 'child_process';

const request = supertest(app);

describe('API Routes', () => {

  afterAll(async () => {
    return client.end();
  });

  describe('/api/todos', () => {
    let user;

    beforeAll(async () => {
      execSync('npm run recreate-tables');

      const response = await request
        .post('/api/auth/signup')
        .send({
          name: 'Me',
          email: 'me@mail.com',
          password: 'password'
        });
     

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(Number),
        name: 'Me',
        email: 'me@mail.com',
        token: expect.any(String)
      });
      user = response.body;
     
    });

    let chore = {
      id: expect.any(Number),
      task: 'Wash Dishes',
      completed: false
    };

    // append the token to your requests:
    //  .set('Authorization', user.token);
    
    it('POST chore to /api/todos', async () => {
    //  console.log(user);
      const response = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(chore);

      //  expect(response.status).toBe(200);
      chore = response.body;
      expect(response.body).toEqual({
        userId: user.id,
        ...chore
      });

      
    });


    it('GET my /api/me/todos', async () => {

      const getTodoResponse = await request 
        .post('/api/todos')
        .set('Authorization', user.token)
        .send({
          task: 'Walk Dog',
          completed: false
        });

      expect(getTodoResponse.status).toBe(200);
      const chore2 = getTodoResponse.body;

      const response = await request.get('/api/me/todos')
        .set('Authorization', user.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([chore2]);
    });
    
    

  });
});