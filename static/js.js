/*//odbieram wylosowana osobe
$.ajax({
  url: "http://127.0.0.1:8000/savetasks",
  type: "GET",
  dataType:"json",
  success: wyswietlOsobe,
});*/

//funkcja wyswietlOsobe
// function wyswietlOsobe(osoba,textStatus,jqXHR){
//   alert(osoba);
// }

//funkcja zapisujaca imie
/*function zapisujeImie(){
  var imie = document.getElementById('name').value;
  //wysylam imie z inputa
  $.ajax({
      url: "http://127.0.0.1:8000/save",
  		type: "POST",
  		data: imie,
  });
}*/
//losowanie liczby od 1 do 15
// function losujaca(){
//   var wylosowanaLiczba = Math.floor((Math.random())*15 + 1);
  //wysylam liczbe wylosowana
          // $.ajax({
          //   url: "http://127.0.0.1:8000/savetasks",
          //   type: "POST",
          //   data: wylosowanaLiczba,
          // });

//}

/*
//pobranie guziak losuj
var guzik = document.getElementsByClassName('zapiszImie')[0];

//przypisanie onclick do guzika losuj
guzik.onclick = zapisujeImie;
*/
