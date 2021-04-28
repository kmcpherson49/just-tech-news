const router = require('express').Router();
const { User } = require('../../models');

// GET /api/users
router.get('/', (req, res) => {
     // Access our User model and run .findAll() method)
  User.findAll({
      attributes: {exclude: ['password']}
  })
  .then(dbUserData => res.json(dbUserData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// GET /api/users/1
router.get('/:id', (req, res) => {
    User.findOne({
        attributes: {exclude: ['password']}, 
        where: {
          id: req.params.id
        }
      })
        .then(dbUserData => {
          if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
          }
          res.json(dbUserData);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
});

// POST /api/users
router.post('/', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// for users to login
router.post('/login', (req, res) => {
//expects {email: 'lernantino@gmail.com', password: 'password1234'}
User.findOne({
  where: {
    email: req.body.email
  }
}) .then(dbUserData => {
  if (!dbUserData) {
    res.status(400).json({ message: 'No user with that email address!'})
    return;
  }

  res.json({ user: dbUserData });
  // Verify user
  const vaildPassword = dbUserData.checkPassword(req.body.password);
  if (!vaildPassword) {
    res.status(400).json({ message: 'Incorrect password!' });
    return;
  }
  
  res.json({ user: dbUserData, message: 'You are now logged in!' });
});
});

// PUT /api/users/1
router.put('/:id', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}

    //pass in req.body instead to only update what's passed through
    User.update(req.body, {
      individualHooks: true,
      where: {
        id: req.params.id
      }
    })

  // if req.body has exact key/value pairs to match the model, you can just use `req.body` instead
  User.update(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then(dbUserData => {
      if (!dbUserData[0]) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// DELETE /api/users/1
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(dbUserData => {
          if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
          }
          res.json(dbUserData);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
});

router.get('/', (req, res) => {
  Post.findAll({
    attributes: [
      'id',
      'post_url',
      'title',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
      // pass a single post object into the homepage template
      res.render('homepage', dbPostData[0]);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;