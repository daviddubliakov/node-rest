const { validationResult } = require('express-validator');

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
    return res
      .status(422)
      .json({
        message: 'Validation failed, entered data is incorrect.',
        errors: errors.array(),
      });
  }

  const { title, content } = req.body;

  res.status(201).json({
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: 'Davyd' },
      createdAt: new Date(),
    },

    message: 'Post created successfully',
  });
};
