var fs = require('fs');

//funkcja odpowiedzialna za wyrenderowanie/dopasowanie widoku
var render = function(response, views,  params, httpCode){ //do funkcji render beda przekazywane: response bo render bedzie wstawil html do odpowiedzi,
																													//views - katalog w ktorym znajduja sie pliki html
																													//params - parametry
																													//httpcode - konieczne przy wysylaniu odpowiedzi

		//fs modul sluzacy do czytania pliku
	fs.readFile(views, 'utf8', function(err, data){	//funkcja zwrotna moze przekazywac dwa parametry
		if(err){ //jesli wystapi jakis blad to bedziemy miec komunikaty w tym obiekcie err
			console.log(error);
			return;
		}
		//params
		params = params||{}; //sprawdzam ze zmienna params jest obiektem zatem jezeli uzytkownik nie ustawi params to istawiamy pusty obiekt
		for(var key in params){
			data = data.replace(new RegExp('@'+key+'@', 'g'), params[key]); //to wrazenie reguralne znajdzie wszsytkie  //RegExp - wyrazenie regularne g - global
    }
			//httpCode
		httpCode = httpCode||200;
			//response
		response.writeHead(httpCode, {'Content-type': 'text/html'});
		response.write(data);
		response.end();
	});
};
//aby korzystac z tej metody to musze ja wyeksportowac
exports.render = render;
