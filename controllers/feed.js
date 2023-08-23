const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: 1,
        title: 'first post',
        content: 'This is the first post!',
        imageUrl: 'images/duck.jpeg',
        creator: {
          name: 'Davyd',
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed, entered data is incorrect.',
      errors: errors.array(),
    });
  }

  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imageUrl: 'images/duck.jpeg',
    creator: { name: 'Davyd' },
  });

  post
    .save()
    .then((result) => {
      res.status(201).json({
        post: result,
        message: 'Post created successfully',
      });
    })
    .catch((err) => console.log(err));
};
