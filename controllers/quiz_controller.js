var models = require('../models/models.js');

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)) }
    }
  ).catch(function(error) { next(error)});
};


// GET /quizes
exports.index = function(req, res) {
    var q_where = {};
    var search  = req.param('search');
    if (typeof(search) != 'undefined' && search != '')
    {
        search = search.replace(/\s+/gm, '%');
        search = '%' + search + '%';

        q_where = {"where" : ["pregunta like ?", search]};
    }

    models.Quiz.findAll(q_where).then(function(quizes) {
        res.render('quizes/index', { quizes: quizes});
    }
  ).catch(function(error) { next(error)});
 };

 // GET /quizes/new
exports.new = function(req, res) {
    var quiz = models.Quiz.build({pregunta: "Pregunta", respuesta: "Respuesta"});
    res.render('quizes/new', {quiz: quiz});
};

 // POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build( req.body.quiz );

    // Guarda en DB los campos pregunta y respuesta de quiz
    quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
        // res.redirect: Redirección HTTP a lista de preguntas
        res.redirect('/quizes');
    });
};
 
 
 
// GET /quizes/question
exports.show = function(req, res) {
	models.Quiz.find(req.params.quizId).then(function(quiz) {
		res.render('quizes/show', {quiz: req.quiz});
	})
};



// GET /quizes/:id/answer
 exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', { quiz: req.quiz,respuesta: resultado}
   );
  };