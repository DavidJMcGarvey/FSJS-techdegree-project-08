'use strict';

const express = require('express');
const paginate = require('express-paginate');
const router = express.Router();
const Book = require('../models').Book;

router.use(paginate.middleware(10, 50));

function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  }
};

// Book listing page
router.get('/', asyncHandler(async (req, res) => {
  // let books = await Book.findAll();
  // books = books.map(book => book.toJSON());
  // res.render('index', { books });

  let books = await Book.findAll();
  books = books.map(book => book.toJSON());
  const bookCount = books.length;
  const pageCount = Math.ceil(bookCount / 10);
  
  res.render('index', {
    books,
    pageCount,
    bookCount,
    pages: paginate.getArrayPages(req)(10, pageCount, req.query.page)
  });

}));

// Create new book form
router.get('/new-book', asyncHandler(async (req, res) => {
  res.render("books/new-book", { book: {}, title: "Add a new book!" });
}));

// POST new book
router.post('/', asyncHandler(async (req, res, next) => {
  let book;

  try {
    book = await Book.create(req.body);
    return res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('books/new-book', { book, errors: error.errors, title: "Let's Try That Again" });
    } else {
      throw error;
    }
  }
}));

// Detail page
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/book-detail', { book }); 
  } else {
    res.sendStatus(404);
  }
}));

// Update book page
router.get('/:id/update-book', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/update-book', { book });
  } else {
    res.sendStatus(404);
  }
}));

// POST updated book
router.post('/:id/update-book', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      return res.redirect('/books/' + book.id)
    } else {
      res.sendStatus(404);
    }
    res.redirect('/books/' + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('book/new-book', { book });
    } else {
      throw error;
    }
  }
}));

// Delete book form
router.get("/:id/delete-book", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/delete-book", { book, title: "Delete Book" });
  } else {
    res.sendStatus(404);
  }
}));

// Delete the book
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy()
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
  
}));

module.exports = router;