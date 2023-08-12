exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: 'first post',
        content: 'This is the first post!',
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;

  res.status(201).json({
    post: { id: new Date().toISOString(), title, content },
    message: 'Post created successfully',
  });
};
