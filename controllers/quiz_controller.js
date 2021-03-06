var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: { id: Number(quizId) },
            include: [{ model: models.Comment }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  
  if(req.query.search === undefined)
  {
    models.Quiz.findAll().then(
      function(quizes) {
        res.render('quizes/index', { quizes: quizes, searchValue: "", errors: []});
      }
    ).catch(function(error) { next(error);})
  }
  else
  {
    var search = "%" + req.query.search.replace(" ", "%") + "%";
    models.Quiz.findAll( {where: ["pregunta like ?", search], order: [["pregunta", "ASC"]]} ).then(
      function(quizes) {
        res.render('quizes/index', { quizes: quizes, searchValue: req.query.search, errors: []});
      }
    ).catch(function(error) { next(error);})
  }

};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta", indice: "otro"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "indice"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.indice = req.body.quiz.indice;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "indice"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

// GET /quizes/statistics
exports.statistics = function(req, res){
  
  //El número de preguntas
  models.Quiz.findAll().then(
    function(quizes) {
      var numberOfQuestions = quizes.length;
      //El número de preguntas sin comentarios
      var questionsWithoutComments = 0;
      //El número de preguntas con comentarios
      var questionsWithComments = 0;
      for(var i = 0; i<quizes.length; i++){
        quizes[i].getComments().then(function(quizesComment){
          if(quizesComment.length === 0){
            questionsWithoutComments++;
          }
          else{
            questionsWithComments++;
          }
        });
      }

      //El número de comentarios totales
      models.Comment.findAll().then(
        function(comments) {
          var numberOfComments = comments.length;
          //El número medio de comentarios por pregunta
          var commentsPerQuestion = numberOfComments/numberOfQuestions;

          res.render('quizes/statistics', {numberOfQuestions: numberOfQuestions,
                                   numberOfComments: numberOfComments,
                                   commentsPerQuestion: commentsPerQuestion,
                                   questionsWithoutComments: questionsWithoutComments,
                                   questionsWithComments: questionsWithComments,
                                   errors: []});
        }
      ).catch(function(error) { next(error);});
    }
  ).catch(function(error) { next(error);});
}