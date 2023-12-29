const { validationResult } = require('express-validator');
const fs = require("fs");
const path = require("path");

const Post = require('../models/post');

exports.getPosts = (_req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        posts,
        message: 'Posts are successfully fetched',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;

    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;

    throw error;
  }

  const { title, content } = req.body;
  const imageUrl = req.file.path;
  const post = new Post({
    title,
    content,
    imageUrl,
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
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('No post found');
        error.statusCode = 404;

        throw error;
      }

      res.status(200).json({
        post,
        message: 'Post found successfully',
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;

    throw error;
  }

  const { title, content, image } = req.body;
  let imageUrl = image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;

    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('No post found');
        error.statusCode = 404;

        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Post updated!', post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}
