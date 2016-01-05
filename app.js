var http = require('http');  //za pomoca metody/funkcji require dodaje moduł http ktory jest wbudowany w noda
var url = require('url');
var fs = require('fs'); //czytanie plikow odszukiwanie poliku html, odczytywanie go w nodzie i wyrzucaniu uzytkownikowi do przegladarki
var formidable = require('formidable');
var qs = require('querystring');
var util = require('util');
var mysql = require('mysql');
// render jest to modul ktora sama utworzylam
var render = require('./render.js');

//zmienna globalna ktora przechowuje imie wylosowanej osoby
var	imieSzczesliwca;

//pisze wlasny system routingu zeby przegladarka sama wygenerowala strony
//bazujemy na tym co uzytkownik wpisze w przegladarke
//za każdym razem bede sprawdzac url i na tej podstawie beda zwracane systemy
var controllers = {};

//w controllers tworze klucz ktory bedzie odpowiadal na pathName
//strona glowna
controllers['/'] = function(request, response){
	render.render(response, 'views/index.html',  {
		pageTitle: 'Strona głowna'
	});
};

//strona zapisujaca imie losujacego
controllers['/save'] = function(request, response){
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

	//wyswietlanie szablonow dla odpowiednich sytuacji
	var onSaveErrorPonowneLosowanie = function(response){
		render.render(response, 'views/ponowneLosowanie.html', {
			pageTitle: 'Ponowne losowanie',
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
			var pobraneImie = fields.name;

			//stworzenie polaczenie do bazy danych
			var conn = mysql.createConnection({ //przekazuje obiekt w ktorym beda parametry polaczenia
				host:'localhost',
				user:'root',
				password:'1gil2026problemow',
				database:'swiateczne_losowanie'
			});

			//odwoluje sie do obiektu conn i metoda connect czyli polacz sie z baza danych
			conn.connect();

			//pobieram imiona ktore juz losowaly i zablokowanie kolejnego losowania przez te sama osobe
			conn.query("SELECT imie FROM domownicy WHERE czy_losowal = 1", function(err, result){
				if(err){
			    //wyswietlamy komunikat o bledzie
			    onSaveError(response);
			    console.log(err);
			    return;		//zatrzymujemy działanie tej funckji
			  }
				for (var i = 0; i < result.length; i++){
					console.log("pobranie imienia " + result[i].imie);
					if(pobraneImie === result[i].imie){
						onSaveErrorPonowneLosowanie(response);
						console.log('jestem w ifie');
			     	console.log('dupaaaa juz losowales');
			  	}
				}
			});

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
			//pobieram z bazy danych id osob ktore nie zostaly jeszcze wylosowane
				conn.query('SELECT id FROM domownicy WHERE id not in (SELECT kogo_wylosowal FROM domownicy WHERE kogo_wylosowal <> 0)', function(err, result){
					if(err){
						//wyswietlamy komunikat o bledzie
						onSaveError(response);
						console.log(err);
						return;//zatrzymujemy działanie tej funckji
					}
					//losuje liczbe porzadkowa
					liczba = (result[Math.floor((Math.random())*result.length + 1)].id);

					//wylosowana liczba nie moze byc id osoby losujacej
						if(liczba != pobraneImie){
							conn.query('UPDATE domownicy SET kogo_wylosowal=? WHERE imie=?',[liczba, pobraneImie]);
						}
				//pobieram z bazy danych dane osoby juz wylosowanej
					conn.query('SELECT * FROM domownicy WHERE id = ?', [liczba], function (err, result){
							if(err){
									//wyswietlamy komunikat o bledzie
									onSaveError(response);
									console.log(err);
									return;	//zatrzymujemy działanie tej funckji
							}
						for (var i = 0; i < result.length; i++) {
							imieSzczesliwca = result[i].imie;
							return imieSzczesliwca;
						}	//zamykam petle
					}); //zamkniecie zapytania o osobe wylosowana
				}); //zmkniecie zaptania o osoby jeszcze nie wylosowane
			} //zamkniecie funckji losuja

			losujaca();

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
				imie: imieSzczesliwca,
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

//kontroler ktory sluzy do implementowania plikow js i css
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

//przeparsuje url w obiekcie request i dzieki pathname poda tylko pathname
	var pathName = url.parse(request.url).pathname;

	//sprawdzam czy w obiekcie controllers jest cos takiego jak pathname
	if(!controllers[pathName]){ //jezeli nie ma w controlerrsach czegos takiego jak pathName to zmieniamy na 404
		pathName = '/404';
	}

	//wywplujemy funkcje z parametrami i przekazujemy mu dalej
	controllers[pathName](request, response);

}).listen(80, '127.0.0.1');

console.log("pierwszy krok");
