var models = require ('../models/models.js');

//GET QUESTION
 exports.question=function(req, res){
	models.Quiz.findAll().then(function(quiz){
	res.render('quizes/question', {pregunta: quiz[0].pregunta});
});//).catch(function(error){next(error);});
 };
 
 //GET ANSWER
 exports.answer=function(req, res){
 	models.Quiz.findAll().then(function(quiz){
	if(req.query.respuesta === quiz[0].respuesta){
 		res.render('quizes/answer', { respuesta: 'Correcto'});
	}else{
  		res.render('quizes/answer', { respuesta: 'Incorrecto'});
	}
 });
};