const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const Post = require('../models/post');
const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Feed Controller', () => {
  before((done) => {
    mongoose
      .connect(
        'mongodb+srv://david:david2002@cluster0.i8xwsri.mongodb.net/test-messages',
      )
      .then(() => {
        const user = new User({
          email: 'test@test.com',
          password: 'tester',
          name: 'Test',
          posts: [],
          _id: '65be91851160753e9dac737e',
        });

        return user.save();
      })
      .then(() => {
        done();
      });
  });

  it('should add a created post to the posts of the creator', (done) => {
    const req = {
      body: { title: 'Test title', content: 'Test content' },
      file: { path: '/file/path' },
      userId: '65be91851160753e9dac737e',
    };
    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.have.property('posts');
      expect(savedUser.posts).to.have.length(1);
      done();
    });
  });

  after((done) => {
    User.deleteMany({})
      .then(() => {
        return Post.deleteMany({});
      })
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
