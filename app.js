var http = require('http');  //za pomoca metody/funkcji require dodaje moduł http ktory jest wbudowany w noda
var url = require('url');
var fs = require('fs'); //czytanie plikow odszukiwanie poliku html, odczytywanie go w nodzie i wyrzucaniu uzytkownikowi do przegladarki
var formidable = require('formidable');
var qs = require('querystring');
var util = require('util');
var mysql = require('mysql');

var render = require('./render.js');

//pisze wlasny system routingu zeby przegladarka sama wygenerowala strony
//bazujemy na tym co uzytkownik wpisze w przegladarke
//za każdym razem bede sprawdzac url i na tej podstawie beda systemy zwracane
var controllers = {};
//w controllers tworze klucz ktory bedzie odpowiadal na pathName
controllers['/'] = function(request, response){
	render.render(response, 'views/index.html',  {
		pageTitle: 'Strona głowna'
	});
};

controllers['/save'] = function(request, response){ //strona zapisujaca imie losujacego

	//wyswietlanie szablonow dla odpowiednich sytuacji
	var onSaveError = function(response){
	  render.render(response, 'views/saveError.html', {
	    pageTitle: 'Wystapil blad zapisu'
	  });
	};

	//wyswietlanie szablonow dla odpowiednich sytuacji
	var onSaveSuccessImie = function(response){
	  render.render(response, 'views/losowanie.html', {
	    pageTitle: 'poprawnie zapisano',
	  });
	};

	//formularz wysylany jest postem
	if("POST" === request.method){

		//obsluga formularza
		//przypisanie do zmiennej form instancji ktora zawaraca nowy przychodzacy formularz
		var form = new formidable.IncomingForm();
		//ustawianie kodowania dla nowych pol formularza
		form.encoding = 'utf-8';
		//parsuje informacje otrzymane postem i wywiłuje callback
		form.parse(request, function (err, fields) {
			if(err){
				onSaveError(response);
				console.log(err);
				return;
			}

			//zapis informacji do bazy danych
			//saveData bedzie posiadal informacje zapisywane do bazy danych
			//pamietamy aby klucze pasowaly do tabeli
			var pobraneImie = fields.name;
			console.log(pobraneImie);

			//stworzenie polaczenie do bazy danych
			var conn = mysql.createConnection({ //przekazuje obiekt w ktorym beda parametry polaczenia
				host:'localhost',
				user:'root',
				password:'1gil2026problemow',
				database:'swiateczne_losowanie'
			});

			//odwoluje sie do obiektu conn i metoda connect czyli polacz sie z baza danych
			conn.connect();

			conn.query("SELECT * FROM domownicy", function(err, result) {
				if(err){
					//wyswietlamy komunikat o bledzie
				onSaveError(response);
				console.log(err);
					return;//zatrzymujemy działanie tej funckji
				}

				//wyslanie do bazy ze osoba losowala
				conn.query('UPDATE domownicy SET czy_losowal=true WHERE imie = ?', [pobraneImie]);



		function losujaca(){
			//pobieram z bazy danych nie wylosowane id
				conn.query('SELECT id FROM domownicy WHERE id not in (SELECT kogo_wylosowal FROM domownicy WHERE kogo_wylosowal is not null)', function(err, result){
					if(err){
						//wyswietlamy komunikat o bledzie
						onSaveError(response);
						console.log(err);
						return;//zatrzymujemy działanie tej funckji
					}
					var liczba = (result[Math.floor((Math.random())*result.length + 1)].id);
					global.wylosowanaLiczba = 10;
						console.log('wartosc wylosowana' + wylosowanaLiczba);
						return wylosowanaLiczba;
				});
			}

			losujaca();
			var	wylosowanaLiczba;
			console.log('wartosc wylosowanaaaaaaaaaa' + wylosowanaLiczba);


				//	var wylosowanaLiczba = Math.floor((Math.random())*15 + 1);
					//pobieram imie o id rownym wylosowanej liczbie
					conn.query('SELECT * FROM domownicy WHERE id = ?', [wylosowanaLiczba], function(err, result){
						if(err){
							//wyswietlamy komunikat o bledzie
							onSaveError(response);
							console.log(err);
							return;//zatrzymujemy działanie tej funckji
						}
						//wylosowana liczba nie moze byc id osoby losujacej
						for (var i = 0; i < result.length; i++) {
							if(result[i].imie != pobraneImie){
							  var imieWylosowane = result[i].imie;
								global.imieZwyciescy = result[i].imie;
							  conn.query('UPDATE domownicy SET kogo_wylosowal=? WHERE imie=?',[result[i].id, pobraneImie]);
							}
						}
						conn.end();
					});  //zamnkniecie selecta ktory pobiera id wylosowanej osoby

			onSaveSuccessImie(response);


			});		//zamkniecie selekta ktory pobiera cala tablice domownicy
		});		//zamkniecie funkcji parsujacej dane  z formularza
	} //zamkniecie if
}; //zamkniecie controllers save

 controllers['/saveSuccess'] = function(request, response){//odpowiedz gdy wcisniemy przycisk losuj

	 //wyswietlanie szablonow dla odpowiednich sytuacji
 		var onSaveError = function(response){
	 	  render.render(response, 'views/saveError.html', {
	 	    pageTitle: 'Wystapil blad zapisu'
	 	  });
	 	};

	//wyswietlanie szablonow dla odpowiednich sytuacji
		var onSaveSuccessLosowanie = function(response){
			render.render(response, 'views/saveSuccess.html', {
				pageTitle: 'poprawnie zapisano',
				imie: global.imieZwyciescy
			});
		};

		//wywolanie
		onSaveSuccessLosowanie(response);

};



controllers['/404'] = function(request, response){ //gdy strona nie zostala znaleziona
	render.render(response, 'views/error404.html', {
		pageTitle: 'Strona nie znaleziona'
	});
};


controllers['/static'] = function(request, response){
try {
		plik = url.parse(request.url).query;
		//httpCode
		httpCode = 200;
		if(!fs.statSync('static/'+plik).isFile())
			throw 'Proba odczytania folderu jako elementu statycznego!!!';

		var tresc=fs.readFileSync('static/'+plik, 'utf8');

		//httpCode
		httpCode = httpCode||200;
		//response
		if((plik.substring(plik.length-3))=='css') {
			      response.writeHead(httpCode, {'Content-type': 'text/css'});
		} else {
						response.writeHead(httpCode, {'Content-type': 'text/javascript'});
		}

		response.write(tresc);
		response.end();
	} catch (e) {
	    console.log(e);
			controllers['/404'](request,response);
	}
}

//w pierwszej kolejności tworze serwer http
//odwoluje sie do obiektu http
http.createServer(function(request, response){ //w obiekcie request mamy zapisany wszelkie informacje ktore wysyla przegladarka responie - sluzy do wygenerowanie odpowiedzi do przegladarki
	console.log("drugi krok funkcja serwerowa działa");

	var pathName = url.parse(request.url).pathname; //przeparsuje url w obiekcie request i dzieki pathname poda tylko pathname

	//sprawdzam czy w obiekcie controllers jest cos takiego jak pathname
	if(!controllers[pathName]){ //jezeli nie ma w controlerrsach czegos takiego jak pathName to zmieniamy na 404
		pathName = '/404';
	}

//wywplujemy funkcje z parametrami i przekazujemy mu dalej
	controllers[pathName](request, response);

}).listen(80, '127.0.0.1');

console.log("pierwszy krok");
