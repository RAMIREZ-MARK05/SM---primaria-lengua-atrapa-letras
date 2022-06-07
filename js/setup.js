/*
Configuración de estilos gráficos
*/
// LENGUA, MATES, CCSS, CCNN, MUSICA, PLASTICA, AUTONOMICA, RELIGION, GLOBALIZADO, FRANCES
var ASIGNATURA = "LENGUA";
// INFANTIL, PRIMARIA, SECUNDARIA (especificar INFANTIL para 1º y 2º de primaria)
var ETAPA_EDUCATIVA = "PRIMARIA";
// SM, IKASMINA, XERME, DAYTON, ARRELS, CRUILLA
var LOGOTIPO = "SM";


// para añadir audio de instrucciones, poner mp3 y ogg en la carpeta "data/audios/" y:
var instruccAudio = "instrucciones.mp3"; // si no, comentar o borrar esta línea

/*
Filtros de texto: se ejecutarán al pinchar el botón de corregir, en el mismo orden en que aparezcan aquí. Son:
1: convierte espacios dobles en simples
2: elimina saltos de párrafo y tabuladores
3: case-insensitive ("a" equivale a "A")
4: diacritics-insensitive ("a" equivale a "á", "à", "ä" y "â")
5: se elimina el espacio en la combinación de espacio + ENTER o cualquiera de estos caracteres: .,;:!?”’)}]…
6: punctuation-insensitive (se ignoran los siguientes caracteres: .,;:¡!¿?'“”‘’"(){}[]…-–—_)
*/
/*
WARNING
-En este juego sólo el filtro 3
*/
var filters = [ 3 ];

// varía la dificultad en función de la edad especificada
// valores válidos: 5, 6, 7, 8, 9, 10, 11, 12, 13 y 14 (o más)
var userAge = 15;
// letras, números y símbolos que pueden aparecer en el juego
var letras = "abcdefghijlmnñopqrstuvyz";
var numbers = "0123456789";
var symbols = ".,-/*$%&=¿?();:!¡";
// userAge 5 => letras
// userAge 6, 7 y 8 => nivel<7 letras; nivel>6 letras+letras+numbers
// userAge 9, 10 y 11 => nivel<5 letras; nivel<10 letras+numbers; nivel>9 letras+letras+numbers+mayúsculas
// userAge > 11 => nivel<5 letras; nivel<10 letras+numbers; nivel<15 letras+numbers+mayúsculas; nivel>14 letras+letras+numbers+mayúsculas+symbols