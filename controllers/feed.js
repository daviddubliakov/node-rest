const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const io = require('../socket');

const Post = require('../models/post');
const User = require('../models/user');
const user = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return Post.find()
        .populate('creator')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        posts,
        totalItems: totalItems,
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

exports.createPost = async (req, res, next) => {
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
  const userId = req.userId;
  let creator;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: userId,
  });

  try {
    await post.save();

    const user = await User.findById(userId);

    creator = user;
    user.posts.push(post);
    const savedUser = await user.save();
    // io.getIO().emit('posts', {
    //   action: 'create',
    //   post: { ...post._doc, creator: { _id: userId, name: creator.name } },
    // });

    res.status(201).json({
      post: post,
      message: 'Post created successfully',
      creator,
    });

    return savedUser;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
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
    const error = new Error('No file picked');
    error.statusCode = 422;

    throw error;
  }

  Post.findById(postId)
    .populate('creator')
    .then((post) => {
      if (!post) {
        const error = new Error('No post found');
        error.statusCode = 404;

        throw error;
      }

      if (post.creator._id.toString() !== req.userId) {
        const error = new Error('Not authenticated');
        error.statusCode = 403;
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
      io.getIO().emit('posts', { action: 'update', post: result });
      res.status(200).json({ message: 'Post updated!', post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('No post found');
        error.statusCode = 404;

        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authenticated');
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      user.save();
    })
    .then(() => {
      io.getIO().emit('posts', { action: 'delete', post: postId });
      res.status(200).json({ message: 'Deleted post.' });
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
  fs.unlink(filePath, (err) => console.log(err));
};
