var okTextColor='#72BF44';


function docPreInit(){
	$('#fr1').children().addClass('full');
	baseWidth = lib.properties.width;
	baseHeight = lib.properties.height;
	$('#anicanvas').attr('width',baseWidth);
	$('#anicanvas').attr('height',baseHeight);
}

var VK, userTxt, ip, sr; // insertion point, selection range
function fr1init(){
	$('#repeat').hide();
	$('#welcome').show();
	$('#start').off().css({opacity:0.5});
	
	// setup audio para el enunciado
	try {
		if(instruccAudio){
			$('body').append('<audio preload="auto" id="instruccAudio"><source src="data/audios/'+instruccAudio.split('mp3').join('ogg')+'" type="audio/ogg" /><source src="data/audios/'+instruccAudio+'" type="audio/mp3" /></audio>');
			
			$('#inst').html('<a href="javascript:playSound(\'instruccAudio\',true)" class="tinyAudioButton '+ASIGNATURA.toLowerCase()+'" style="position:relative;top:3px;">h</a>&nbsp;' + localization[0]);
		}
	} catch (err) {}
	
	// setupInputText();
	if(!VK){
		VK = new VirtualKeyboard(keyboard,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,true);
		VK.addEventListener('type',char);
		VK.addEventListener('raise',doShowKeyboard);
		VK.addEventListener('shrink',doHideKeyboard);
		if(this.kdTA)$("textarea").keydown(kdTA);
	}
	
	$('#points,#showhide,#lvlLbl').removeClass(ASIGNATURA.toLowerCase()).addClass(ASIGNATURA.toLowerCase());
	
	// prepare animations for later
	loadCanvas();
	playSound('prolog');
	playSound(false,false);
	$('#fr1').children().css('transform','translate3d(0,0,0)');
	$('#showhide,#kb').css('transform','translate3d(0,0,0)');
}
function fr1posInit(){
}

var parajos;
function animReady(){
	exportRoot.gotoAndStop(0);
	exportRoot.rama.gotoAndStop(0);
	if(!atmintt)exportRoot.bg.tarde.alpha=exportRoot.bg.noche.alpha=0;
	exportRoot.bg.cache(0,0,960,600);
	limits = new Array();
	for(var i=1;i<5;i++){
		exportRoot.rama['p'+i].visible=false;
		if(isFirefox)exportRoot.rama['p'+i].t.y+=7;
		limits.push(exportRoot.rama['p'+i]);
	}
	parajos = new Array();
	for(i=1;i<21;i++){
		exportRoot['v'+i].x=-80;
		exportRoot['v'+i].gotoAndStop(0);
		exportRoot['v'+i].a1.stop();
		if(isFirefox)exportRoot['v'+i].t.y+=5;
		parajos.push(exportRoot['v'+i]);
	}
	textLoc(true);
	var xxx = $('.logo').width() + parseInt($('.logo').css('right')) + 7;
	$('#display').html('').css({right:xxx});
	$('#start').css({opacity:1}).off().on('click',function(){
		$('#welcome').hide();
		doStart();
	});
}

var letras = (typeof letras !='undefined' ? letras : "abcdefghijklmnñopqrstuvwxyz");
var numbers = (typeof numbers !='undefined' ? numbers : "0123456789");
var symbols = (typeof symbols !='undefined' ? symbols : ".,-/*$%&=¿?();:!¡");
var distance = 1;
var maxSpeed = 20;
var speed = 100; // milliseconds
var userAges = [5,6,7,8,9,10,11,12,13,14];
var speedIncrements = [0.1,0.15,0.15,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5];
var speedIncrement = 0.5;

var queue,codes,charx,charxx;
var addTime = 4000; // milliseconds
var addTimeIncrements = [100,150,200,200,250,250,300,350,400,450,500];
var addTimeIncrement = 500;
var minAddTime = 600;

var addTimer;
var addTimerDelay;
var updateTimer;


var pts;
var speedCnt;
var speedCntModifiers = [45,40,35,30,28,25,23,22,20,20,18];
var speedCntModifier = 18;

var currentLevel;
var levelRounds;
var roundsEllapsed;
var letrasDied;
var died;

var si = "paduuu";
var no = "honk";

var limits;
var mcHeight;
var atmintt;
function doStart(){
	if(!atmintt)atmintt=setInterval(atmosphear,10000);
	currentLevel = 0;
	levelRounds = 2;
	roundsEllapsed = 0;
	letrasDied = 0;
	distance = 1;
	queue = new Array();
	codes = new Array();
	charx = new Array();
	charxx = new Array();
	baqueue = new Array();
	died = false;
	pts=0;
	addTime = 4000;
	if(!mcHeight)mcHeight = exportRoot.v1.getBounds().height;

	var ageIndex = userAges.indexOf(userAge);
	if(ageIndex!=-1){
		speedIncrement=speedIncrements[ageIndex];
		addTimeIncrement=addTimeIncrements[ageIndex];
		speedCntModifier=speedCntModifiers[ageIndex]
	}

	setTimeout(function(){
		fadeSound('prolog','out');
		playSound('bumblebee');
		document.getElementById('bumblebee').volume=0.05;
		fadeSound('bumblebee','in');
		playSound(false,false);
	}, 2750);
	
	startLevel();
}
var atmoStage = 0;
function atmosphear(){
	atmoStage++;
	if(atmoStage==20){
		exportRoot.bg.tarde.alpha=0;
	}
	if(atmoStage<11){
		exportRoot.bg.tarde.alpha=atmoStage/10;
	} else if (atmoStage<21){
		exportRoot.bg.noche.alpha=(atmoStage-10)/10;
	} else if (atmoStage<31){
		exportRoot.bg.noche.alpha-=.1;
	} else {
		atmoStage = 0;
		exportRoot.bg.noche.alpha=exportRoot.bg.tarde.alpha=0;
	}
	exportRoot.bg.cache(0,0,960,600);
	//stage.update();
}

function startLevel(){
	$('#display').html(localization[4].split('XXX').join(0).split('YYY').join(levelRounds+1));
	$('#lvlLbl').css({top:280,fontSize:12}).html(localization[2].split('XXX').join(currentLevel+1)).animate({fontSize:42,top:220},500,function(){
		$(this).animate({fontSize:48,top:250},150,function(){
			setTimeout(function(){
				$('#lvlLbl').animate({top:240},500,function(){
					$(this).animate({top:900},250);
					doStartLevel();
				})
			}, 2000);	
		})
	});
}

function doStartLevel(){
	clearInterval(addTimer);
	clearInterval(updateTimer);
	addTimer = setInterval(addLetra,addTime);
	updateTimer = setInterval(update,50);
	addLetra();
}

function addLetra(){
	if(roundsEllapsed>levelRounds) { // presentación de nivel
		clearInterval(addTimer);
		addTimer=null;
		/*if(letrasDied!=levelRounds) {
			return;
		}
			console.log(0)
		if(died) {
			$('#lvlLbl').css({top:280,fontSize:12}).html(localization[3]).animate({fontSize:42,top:220},500,function(){
				$(this).animate({fontSize:48,top:250},150);
			});
			clearInterval(updateTimer);
		} else {
			startLevel();
			roundsEllapsed++;
			$('#display').html(localization[4].split('XXX').join('0').split('YYY').join(levelRounds+1));
		}*/
		return;
	} else {
		if(!addTimer){ // re-init counter
			if(died) return;
			currentLevel++;
			levelRounds++;
			letrasDied=0;
			roundsEllapsed = 0;
			if(addTime>200){
				if((addTime-addTimeIncrement)<minAddTime) {
					addTime = minAddTime;
				} else {
					addTime-=addTimeIncrement;
				}
			}
			if(distance<maxSpeed)distance+=speedIncrement;
			addTimer=setInterval(addLetra,addTime);
		} else {
			roundsEllapsed++;
		}
	}
	var lets;
	if(userAge==5) {
		lets = letras;
	} else if (userAge<8) {
		if(currentLevel<7) {
			lets = letras;
		} else {
			lets = letras+letras+numbers;
		}
	} else if (userAge<12) {
		if(currentLevel<5) {
			lets = letras;
		} else if (currentLevel<10) {
			lets = letras+numbers;
		} else {
			lets = letras+letras+numbers+(letras.toUpperCase());
		}
	} else {
		if(currentLevel<5) {
			lets = letras;
		} else if (currentLevel<10) {
			lets = letras+numbers;
		} else if (currentLevel<15) {
			lets = letras+numbers+(letras.toUpperCase());
		} else {
			lets = letras+letras+numbers+(letras.toUpperCase())+symbols;
		}
	}
	
	var some = lets.charAt(rand(0,lets.length-1));
	//if("ñÑ".indexOf(some)!=-1)some="a"; // DEBUG FIX
	
	var blo = parajos.shift();
	blo.x = -80;
	blo.y = kl%2===0?208:150;
	blo.ix = -80;
	blo.tm = new Date().getTime();
	
	blo.t.text=some;
	blo.t.color='#000000';
	var r = rand(0,blo.totalFrames-1);
	blo.gotoAndStop(r);
	blo["a"+(r+1)].play();

	queue.push(blo);
	charx.push(some);
	charxx.push(doFilter(some));
	codes.push(some.charCodeAt(0));
	
	kl++
}
var kl = 0;

var baqueue;
function update(){
	var newQueue = new Array();
	var newCodes = new Array();
	var newCharx = new Array();
	var newCharxx = new Array();
	for(var i = 0;i<queue.length;i++){
		var mc = queue[i];
		if(!died && (mc.t.color != '#ff6600')) {
			if(mc.x>=(exportRoot.rama.localToLocal(limits[0].x,limits[0].y,exportRoot)).x) { // explotar
				try{
					playSound(no,true);
				}catch(err){}
				var l = limits.shift();
				l.gotoAndStop(mc.currentFrame);
				l.t.text=mc.t.text;
				l.visible=true;
				//l.cache(0,-5,75,100);
				letrasDied++;
				mc.x=-80;
				mc.gotoAndStop(0);
				mc.a1.stop();
				parajos.unshift(mc);// return to free birds
				$('#display').html(localization[4].split('XXX').join(letrasDied).split('YYY').join(levelRounds+1));
				pts--;
				if(pts<0)pts=0;
				$('#puntos').html(pts);
				if(limits.length<1){
					if(addTimer)clearInterval(addTimer);
					gameOver();
					died=true;
				}
			} else {
				var now = new Date().getTime();
				var then = mc.tm;
				var ellapsed = now-then;
				
				/*
				50 millisecs  - distance
				ellapsed mill -   xxx
				*/
				var xxx = (ellapsed*distance)/50;
				
				mc.x = mc.ix + xxx;
				
				//mc.x+=distance; // old method
				newQueue.push(mc);
				newCodes.push(codes[i]);
				newCharx.push(charx[i]);
				newCharxx.push(charxx[i]);
			}
		} else {
			var tEll = speedCntModifier - Math.round((new Date().getTime() - mc.tm)/100);
			if(tEll>0)speedCnt+=tEll;
			playSound(si);
			baqueue.push(mc);
			if(letrasDied==levelRounds) addLetra();
		}
	}
	
	var newBaqueue = new Array();
	for(i = 0;i<baqueue.length;i++){
		var mc = baqueue[i];
		mc.y-=5;
		if(mc.y<-(mcHeight/2)){
			mc.x=-80;
			mc.gotoAndStop(0);
			mc.a1.stop();
			parajos.unshift(mc);
		} else {
			newBaqueue.push(mc);
		}
	}
	queue = newQueue;
	codes = newCodes;
	charx = newCharx;
	charxx = newCharxx;
	baqueue = newBaqueue;
	
	if(queue.length==0 && baqueue.length==0){
		clearInterval(updateTimer);
		if(died) return;
		currentLevel++;
		levelRounds++;
		letrasDied=0;
		roundsEllapsed = 0;
		if(addTime>200){
			if((addTime-addTimeIncrement)<minAddTime) {
				addTime = minAddTime;
			} else {
				addTime-=addTimeIncrement;
			}
		}
		if(distance<maxSpeed)distance+=speedIncrement;
		startLevel();
	}
}

function gameOver(){
	//exportRoot.rama.gotoAndPlay(1);
	sendMessage({status:'finished',ok:false});
	stopSound('bumblebee');
	$('#lvlLbl').css({top:280,fontSize:12}).html(localization[3]).animate({fontSize:42,top:200},500,function(){
		$(this).animate({fontSize:48,top:220},150);
	});
	$('#stars').show().children().remove();
	var ndd = (currentLevel>10?10:currentLevel)
	for(var i=0;i<ndd;i++){
		setTimeout(function(){$('<div class="star-five"></div>').appendTo('#stars');playSound('coin');},500*i);
		if(i==(ndd-1))setTimeout(function(){
			$('#repeat').show().off().one('click',function(){
				goframe(0);
				$('#stars,#repeat').hide();
			});
			if(isLast && !isStandalone) { // only the carcasa puede hacerlo
				$('#beginning').show().off().one('click',function(){
					sendMessage('repeat');
					$(this).hide();
				});
			}
		},500*i);
	}
	
}

var kVisible = false;
function doShowKeyboard(){ // keyboard is gonna be shown
	$("textarea").off();
	$('.full').removeClass('full');
	kVisible = true;
}
function kdTA(e){
	if((e.charCode === 9 || e.keyCode === 9)) { // tab was pressed
		// get caret position/selection
		var start = this.selectionStart;
		var end = this.selectionEnd;

		var $this = $(this);
		var value = $this.val();

		// set textarea value to: text before caret + tab + text after caret
		$this.val(value.substring(0, start)
					+ "	"
					+ value.substring(end));

		// put caret at right position again (add one for the tab)
		this.selectionStart = this.selectionEnd = start + 1;

		// prevent the focus lose
		e.preventDefault();
	}
}
function doHideKeyboard(){ // keyboard is gonna be hidden
	$("textarea").keydown(kdTA);
	$('#fr1>*').addClass('full');
	kVisible = false;
}

var diac;
function hiliteKeyboard(t,onlySound){
	if(!kVisible)return;
	var ck;

	if(keyboard.keydownEquivalen.indexOf(t)!=-1){
		if(t=='ENTER') {
			if(!onlySound){
				$('#entr').attr('src',keyboard.ENTER.down_url);
				setTimeout(function(){$('#entr').attr('src',keyboard.ENTER.url);},keyboard.hiliteTime);
			}
			if(document.getElementsByClassName('sk13').length)playSound(document.getElementsByClassName('sk13')[0],true);
		} else {
			if(!onlySound){
				ck='.k'+t;
				if(t=='SHIFT') {
					var ck1 = $(ck)[0];
					var ck2 = $(ck)[1];
					$(ck1).css({backgroundPosition:'-' + $(ck1).data('x') + 'px -'+ $(ck1).data('y') +'px'});
					$(ck2).css({backgroundPosition:'-' + $(ck2).data('x') + 'px -'+ $(ck2).data('y') +'px'});
				} else {
					$(ck).css({backgroundPosition:'-' + $(ck).data('x') + 'px -'+ $(ck).data('y') +'px'});
					if(t=='SHIFT_LOCK'&&VK.shiftLockON){
					} else {
						setTimeout(function(t){$(t).css({backgroundPosition:"1500px 2500px"});},keyboard.hiliteTime,ck);
					}
				}
			}
			if(document.getElementsByClassName('sk'+t).length)playSound(document.getElementsByClassName('sk'+t)[0],true);
		}
	} else {
		if(!onlySound){
			if("áàäâãéèëêíìïîóòöôõúùüûÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛ".indexOf(t)!=-1) { // attemp to hilite base chars
				try {
					t = t.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
				} catch (err) {
					t = removeDiacritix(t);
				}
			}
			
			ck = '.k'+t.charCodeAt(0);
			$(ck).css({backgroundPosition:'-' + $(ck).data('x') + 'px -'+ $(ck).data('y') +'px'});
			setTimeout(function(t){$(t).css({backgroundPosition:"1500px 2500px"});},keyboard.hiliteTime,ck);
		}
		if(document.getElementsByClassName('sk'+t.charCodeAt(0)).length)playSound(document.getElementsByClassName('sk'+t.charCodeAt(0))[0],true);
	}
}
var inARow=0;
var bonus=0;
var rintr;
function char(evt){
	if(died)return;

	var t = doFilter(evt.data.symbol);
	
	if(t=='SHIFT'||t=='shift')return;
	var ndex = charxx.indexOf(t);
	if(ndex==-1){
		inARow=0;
		bonus=0;
		playSound(no);
		pts--;
		if(pts<0)pts=0;
		$('#points').html(pts);
		$('#down').removeClass('goup').css({left:parseInt($('#points').css('left')) + $('#points').outerWidth() + 5}).addClass('goup');
		//void document.getElementById('down').offsetWidth; // cause reflow else animation won't work
		//$('#down').addClass('goup');
	} else {
		inARow++;
		if(inARow>3){
			bonus++;
			clearTimeout(rintr);
		}
		letrasDied++;
		$('#display').html(localization[4].split('XXX').join(letrasDied).split('YYY').join(levelRounds+1));
		queue[ndex].t.color= '#ff6600';
		var targetX = (exportRoot.rama.localToLocal(limits[0].x,limits[0].y,exportRoot)).x; // eg 800
		var pRun = queue[ndex].x; // eg 70
		var distanceBonus = Math.round(targetX/pRun); // this will be allways between 1 and 10
		if(distanceBonus>10)distanceBonus=10;
		pts+=(bonus+distanceBonus);
		$('#points').html(pts);
		
		$('<p class="dist">+'+distanceBonus+'</p>').css({left:pRun-24}).appendTo('#fr1').animate({opacity:0},500,function(){$(this).remove()});
		if(inARow>3){
			$('#up').stop(true,true,false).css({top:13,left:parseInt($('#points').css('left')) + $('#points').outerWidth() + 5}).html(localization[5].split('XXX').join(bonus).split('YYY').join(inARow)).show();
			rintr=setTimeout(function(){
				$('#up').animate({top:-45});
			},2000);
		}
	}
hiliteKeyboard(t);
	return;
	if(t=='DEL'){
		if(ip>1) {
			if(diac)diac=false;
			if(sr&&sr.length){
				userTxt.splice(sr[0],sr[1]-sr[0]);
				ip=sr[0]+1;
				sr=null;
			} else {
				userTxt.splice(ip-2,1);
				ip--;
			}
		}
	} else if(t=='ENTER'||t=='TAB'){
		var cts = (t=='ENTER') ? '\n' : '\t';
		if(sr&&sr.length){
			userTxt.splice(sr[0],sr[1]-sr[0],cts);
			ip=sr[0]+2;
			sr=null;
		} else {
			userTxt.splice(ip-1,0,cts);
			ip++;
		}
	} else if(t=='SHIFT'||t=='SHIFT_LOCK'){
		
	} else {
		var prevWasDiac = diac;
		if('´`¨^~'.indexOf(t)!=-1) { // diacritical
			diac = true;
		} else {
			diac = false;
		}
		if(sr&&sr.length){
			userTxt.splice(sr[0],sr[1]-sr[0],t);
			ip=sr[0]+2;
			sr=null;
		} else {
			userTxt.splice(prevWasDiac && !diac ? ip-2: ip-1,prevWasDiac && !diac ? 1 : 0,t);
			if(prevWasDiac && !diac) {
			} else {
				ip++;
			}
		}
	}

	$('#textfield').val(userTxt.join(''));
	if(diac) {
		/*var lastChar = userTxt[userTxt.length-1];
		var nu = userTxt.slice();
		nu[nu.length-1]='<span class="tmp">'+lastChar+'</span>';
		$('#textfieldFake').html(nu.join('').split('\n').join('<br/>')+'<span class="blink"></span>');*/
		var nu = userTxt.slice();
		var chr = nu[ip-2];
		nu.splice(ip-2,1,'<span class="tmp">'+chr+'</span><span class="blink"></span>');
		$('#textfieldFake').html(nu.join('').split('\n').join('<br/>'));
	} else {
		nu = userTxt.slice();
		nu.splice(ip-1,0,'<span class="blink"></span>');
		$('#textfieldFake').html(nu.join('').split('\n').join('<br/>'));
		//$('#textfieldFake').html(userTxt.join('').split('\n').join('<br/>')+'<span class="blink"></span>');
	}
	if(ip<1)ip=1;
	if(evt.data.keyboardEvent){
		hiliteKeyboard(t);
	} else {
		hiliteKeyboard(t,true);
	}
}



function doFilter(txt){
	var f = filters.slice();
	var fil;
	while (f.length) {
		fil = f.shift();
		switch(fil){
			case 1: // convierte espacios dobles en simples
				var yeah;
				while(!yeah) {
					var itxt = ""+txt;
					txt = txt.replace(/  /gi, " ");
					yeah=txt==itxt;
				}
				break;
			case 2: // elimina saltos de párrafo y tabuladores
				txt = txt.replace(/[\n\r]/gi, "");
				break;
			case 3: // case-insensitive ("a" equivale a "A")
				txt = txt.toLowerCase();
				break;
			case 4: // diacritical-insensitive ("a" equivale a "á", "à", "ä" y "â")
				try {
					txt = txt.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
				} catch (err) {
					txt = removeDiacritix(txt);
				}
				break;
			case 5: // space + RETURN or .,;:!?”’)}]…
				txt = txt.replace(/ [\n\.,;:!?”’\)\}\]…]/gi,"");
				break;
			case 6: // punctuation-insensitive (se ignoran los siguientes caracteres: .,;:¡!¿?'“”‘’"(){}[]…-–—_)
				txt = txt.replace(/[\.,;:¡!¿?'“”‘’"\(\)\{\}\[\]…\-–—_]/gi,"");
				break;
		}
	}
	return txt;
}


function removeDiacritix(txt){
    var defaultDiacriticsRemovalMap = [
        {'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
        {'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
        {'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
        {'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
        {'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
        {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
        {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
        {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
        {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
        {'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'}/*,
        {'base':'AA','letters':'\uA732'},
        {'base':'AE','letters':'\u00C6\u01FC\u01E2'},
        {'base':'AO','letters':'\uA734'},
        {'base':'AU','letters':'\uA736'},
        {'base':'AV','letters':'\uA738\uA73A'},
        {'base':'AY','letters':'\uA73C'},
        {'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
        {'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
        {'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0'},
        {'base':'DZ','letters':'\u01F1\u01C4'},
        {'base':'Dz','letters':'\u01F2\u01C5'},
        {'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
        {'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
        {'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
        {'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
        {'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
        {'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
        {'base':'LJ','letters':'\u01C7'},
        {'base':'Lj','letters':'\u01C8'},
        {'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
        {'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
        {'base':'NJ','letters':'\u01CA'},
        {'base':'Nj','letters':'\u01CB'},
        {'base':'OI','letters':'\u01A2'},
        {'base':'OO','letters':'\uA74E'},
        {'base':'OU','letters':'\u0222'},
        {'base':'OE','letters':'\u008C\u0152'},
        {'base':'oe','letters':'\u009C\u0153'},
        {'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
        {'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
        {'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
        {'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
        {'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
        {'base':'TZ','letters':'\uA728'},
        {'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
        {'base':'VY','letters':'\uA760'},
        {'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
        {'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
        {'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
        {'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
        {'base':'aa','letters':'\uA733'},
        {'base':'ae','letters':'\u00E6\u01FD\u01E3'},
        {'base':'ao','letters':'\uA735'},
        {'base':'au','letters':'\uA737'},
        {'base':'av','letters':'\uA739\uA73B'},
        {'base':'ay','letters':'\uA73D'},
        {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
        {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
        {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
        {'base':'dz','letters':'\u01F3\u01C6'},
        {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
        {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
        {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
        {'base':'hv','letters':'\u0195'},
        {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
        {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
        {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
        {'base':'lj','letters':'\u01C9'},
        {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
        {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
        {'base':'nj','letters':'\u01CC'},
        {'base':'oi','letters':'\u01A3'},
        {'base':'ou','letters':'\u0223'},
        {'base':'oo','letters':'\uA74F'},
        {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
        {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
        {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
        {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
        {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
        {'base':'tz','letters':'\uA729'},
        {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
        {'base':'vy','letters':'\uA761'},
        {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
        {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
        {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
        {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}*/
    ];

    var diacriticsMap = {};
    for (var i=0;i<defaultDiacriticsRemovalMap.length;i++){
        var letters=defaultDiacriticsRemovalMap[i].letters;
        for (var j=0;j<letters.length;j++){
            diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
        }
    }

    // "what?" version ...
    function removeDiacritics (str) {
        return str.replace(/[^\u0000-\u007E]/g, function(a){ 
           return diacriticsMap[a] || a; 
        });
    }    
    return removeDiacritics(txt);	
}





/*
KIT de funciones para manejar un canvas de animación
*/

var canvas, stage, exportRoot, baseinterval, framerate, cintl, cfps, currentFrame, totalFrames, loader;
var anim_container, dom_overlay_container, fnStartAnimation, AdobeAn, comp, images;

function loadCanvas(){
	currentFrame=0;
	currentSequence=0;
	if(!exportRoot) {
		canvas = document.getElementById("anicanvas");
		anim_container = document.getElementById("animation_container");
		dom_overlay_container = document.getElementById("dom_overlay_container");
		comp=AdobeAn.getComposition("PAQUITO_FOREVER_I_LOVE_YOU_ORNOT");
		var lib=comp.getLibrary();
		createjs.MotionGuidePlugin.install();
		images = comp.getImages()||{};
		if(lib.properties.manifest.length) {
			try {
				var loader = new createjs.LoadQueue(false);
			} catch (err) {
				throw new Error('PROBABLEMENTE FALTE esto: <script type="text/javascript" src="../../../../cv_js/preloadjs-0.4.1.min.js"></script>');
				//throw new Error(err);
			}
			loader.addEventListener("fileload", handleFileLoad);
			loader.addEventListener("complete", handleComplete);
			loader.loadManifest(lib.properties.manifest);
		} else {
			handleComplete()
		}
	} else {
		animReady();
	}
}

function handleFileLoad(evt) {
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}

function handleComplete() {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib=comp.getLibrary();
	var ss=comp.getSpriteSheet();
	if(ss && ss.length) {
		var queue = evt.target;
		var ssMetadata = lib.ssMetadata;
		for(i=0; i<ssMetadata.length; i++) {
			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}
	}
	exportRoot = new lib.ella();
	stage = new lib.Stage(canvas);	
	//Code to support hidpi screens and responsive scaling.
	function makeResponsive(isResp, respDim, isScale, scaleType) {		
		var lastW, lastH, lastS=1;		
		window.addEventListener('resize', resizeCanvas);		
		resizeCanvas();		
		function resizeCanvas() {			
			var w = lib.properties.width, h = lib.properties.height;			
			var iw = window.innerWidth, ih=window.innerHeight;			
			var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
			if(isResp) {                
				if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
					sRatio = lastS;                
				}				
				else if(!isScale) {					
					if(iw<w || ih<h)						
						sRatio = Math.min(xRatio, yRatio);				
				}				
				else if(scaleType==1) {					
					sRatio = Math.min(xRatio, yRatio);				
				}				
				else if(scaleType==2) {					
					sRatio = Math.max(xRatio, yRatio);				
				}			
			}			
			canvas.width = w*pRatio*sRatio;			
			canvas.height = h*pRatio*sRatio;
			canvas.style.width = dom_overlay_container.style.width = anim_container.style.width =  w*sRatio+'px';				
			canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h*sRatio+'px';
			stage.scaleX = pRatio*sRatio;			
			stage.scaleY = pRatio*sRatio;			
			lastW = iw; lastH = ih; lastS = sRatio;            
			stage.tickOnUpdate = false;            
			stage.update();            
			stage.tickOnUpdate = true;		
		}
	}
	makeResponsive(false,'both',false,1);	
	AdobeAn.compositionLoaded(lib.properties.id);

	stage.addChild(exportRoot);
	createjs.Ticker.setFPS(lib.properties.fps);
	createjs.Ticker.addEventListener("tick", stage);
	//createjs.Ticker.addEventListener("tick", textLoc);

		// setup framerate
	if(!framerate) {
		framerate = lib.properties.fps;
		baseinterval = createjs.Ticker.getInterval();
		cintl = baseinterval;
		cfps = framerate;
		createjs.Ticker.setInterval(cintl);// reset this
		createjs.Ticker.setFPS(cfps);//reset this
		totalFrames = exportRoot.timeline ? exportRoot.timeline.duration : 1;
	}
	animReady();
}


var lastfr;
function textLoc(skip){
	if(skip===true){
		var cfm = exportRoot.currentFrame;
		if(cfm!=lastfr) {
			//console.log('loop frame ' + cfm + " children " + exportRoot.getNumChildren())
			traverseNode(exportRoot);
			lastfr=cfm;
		}
	}
}

function traverseNode(node){
	for(var i=0;i<node.getNumChildren();i++){
		var n = node.getChildAt(i);
		try {
			if(n.name.substring(0,1)=='t')n.text = localization[n.name.substring(1,1000)*1];
		} catch (err) {
			try {
				traverseNode(n);
			} catch (err) {}
		}
	}
}


(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib.nubeciglia = function() {
	this.initialize(img.nubeciglia);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,314,215);// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.Tween44 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.nubeciglia();
	this.instance.parent = this;
	this.instance.setTransform(-71.5,-49,0.456,0.456);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-71.5,-49,143.1,98);


(lib.Tween4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#8D5EAA").s().p("AgDgCIAAAAIAHAFIgHgFg");
	this.shape.setTransform(-38.6,4.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#2D5FD0").s().p("ADJC5QhXAMhxgdQh2glg2gJQh9gWhVg3IgIgGQAVgYAzhCQA6hFAqAAQAPAAATASQATAQAKAAQAjAAAohEQAphDAaADIADAEIAAAAQAgBFBPBNIARAQQgBADATAPQASAPAHADQAYARAXANIAaAVQAwAoAWAMQARAIBEAqQgLAlgLAtQhVguhSAMg");
	this.shape_1.setTransform(0.1,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-39,-21.9,78.1,43.8);


(lib.Tween3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#2D5FD0").s().p("AlUCqQg6gMgkgeIgOgOQgvg0AAhYIgBhMIAAgYQACgsARgYQABAOADAQIAAABQAEAOAIAOIACAEIACACIACAEQAfAuArAoQCTCDDqAAQAfAACBgJIBDgEIBDgBIAKgBQAtAAAiAGQAaALATALQAQAJALAJQAaAUAQAiIgRABIgpAEIggAEIggAEQgBgBAAAAQgBAAgBgBQAAAAAAAAQgBAAAAAAIgMAAIg+gKIg0gGIhWgEQg1ABhxAMQh+AOgqAAQhYAAhNgZg");
	this.shape.setTransform(0,0.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#376BE0").s().p("AlOANQgrgngfguIgCgEIgCgCIgCgEQgIgOgEgOIAAgBQgDgQgBgOIADgDIABAEQAMAtA0AmIAAABIAEADIAGAEIAJAHQBVA1B8AWQA2AKB3AkQBFASA7ACIALgBQBOgHAaAAQAxAABRAkIABABIARAIQgigGgtAAIgKABIhDABIhDAEQiBAJgfAAQjqAAiTiEg");
	this.shape_1.setTransform(-4.7,-5.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-49.7,-19.6,99.4,39.3);


(lib.Symbol36 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#C4A729").s().p("AgDBHQgEgBgCgEQgDgDABgEQAEgXABgXQABgQgBgRQgCgTgEgSQgBgFACgDQACgEAFAAQAEgBACACQAEACABAEQAEAUACAVQABASgBARQgBAZgEAYQgBAEgEACQgDACgCAAIgBAAg");
	this.shape.setTransform(57.3,86.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F7EEC5").s().p("AiBCcQg+g3gLhSQgCgNAAgMQgBhHAsg4QA1hHBZgEQBYgHBEBBQBCA/ACBaQABBXg6A9Qg4A6hRABIgCAAQhNAAg9g2g");
	this.shape_1.setTransform(26.2,88.2);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F3D44E").s().p("Ai9DMQhVhLgIhvQgKhzBPhXQBShaB8gCQB8gCBXBZQA4A6ARBIQAEATACAUQABARgBARQgBAYgEAXQgRBShCA8QhRBKhvAAQhuAAhShJgAgpjBQhZAFg1BGQgsA4ABBHQAAAMACANQALBTA+A3QA9A2BQgBQBQgBA4g5QA6g9gBhXQgChbhCg+Qg9g8hOAAIgRABg");
	this.shape_2.setTransform(28.4,86.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383535").s().p("ACyA8Qg4gqhFAkQgJAFgFgIQgVglA/gGQAWgEAWACQAFAAAGABIAAAAIAOgPQACgDAEgBQAEgBADADQADADABAEQAAADgCADIgJAKIAKAGIAXgHQADgBAEACQADACABAEQABAEgBAEQgCADgDABIgQAFQADAKgBALQAAABAAAAQAAABAAABQAAAAAAABQgBAAAAAAIgCgBgAiUAOIgUgLQgpgQAOgXIgEgOQgBgEABgCQABgDADAAQADgBADABQADABAAAEIAFALIAEACIAAgJQAAgDACgCQACgDADABQADgBADADQACACAAADIABAQQAHAEAGAGQAMAMAFAOQAGASgIAAQgFAAgKgGg");
	this.shape_3.setTransform(45.9,46.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FFFFFF").s().p("AgyAnQgUgKgFgTQgEgPAOgEQAHgCAMAEQALAEAHgCQAIgCARgWIAEgHQAIgEALgDIAHgCQAQgBAQAKQAJAFAHAKIABACIABADIgBgBIAAABQAFASgXASQgUAPgdAHQgOAEgOAAQgRAAgOgHg");
	this.shape_4.setTransform(58.4,61.6);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#F7D3C5").s().p("Ah3CIQhigwgahgIAHAEQAuAfASgEQAMgDAGgWQAGgYANgDQANgDAWAfQAZAjAiAGQBIAHA/AJQBPALBOAVQgzAuhQAUIghAHQgkAHgiAAQhJAAg/gggAgNATQg1gQgFgSQgEgTAXgSQAYgRAtgMQAdgHApAAIAkADIANAGQA0AaAGAaQAIAdhEARQgpAKglAAQglAAgggKgAjjgZIgWgRQgEg5AZhEQALAJASAhQAYAqAJAmQAGAYgFAJQgCAFgHABIgHABQgRAAgdgUg");
	this.shape_5.setTransform(51.7,52.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#C25371").s().p("AgWAFQAlgVAhgJQANgDACAGQABAGgHANQgIAMgLAMQgtAAgrAEIgMACIAogWg");
	this.shape_6.setTransform(49,15.8);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#E75F83").s().p("AAbDBQg+gJhJgHQgigGgZgkQgWgfgNADQgNADgGAYQgGAXgMADQgSAEguggIgHgEIAAgDQgEgPgCgQIAWARQAjAYASgFQAHgBACgFQAFgJgGgYQgJgmgYgqQgSgggLgJIAJgWQAthmBhgzQAsgEAugBIA0ABIAdABIAVABQBKAGA2AOIADABQAHgEAjgLQAngNAggIQAXgFACAIQABAEgdA6QgbA1gHAWIABADQAcBvgkBgQgLAdgQAZQgQAXgVAUQhOgVhPgLgAgxA3QguAMgYARQgXASAEATQAFATA1AQQBDAVBQgVQBEgRgIgeQgGgag0gaIgNgGIgkgDQgoAAgdAHg");
	this.shape_7.setTransform(58.4,39);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#774B31").s().p("AixEJQhCgRg5hAQgzg5AGgZQAFgVAqgBQAVgCAiABQgWgNghg7Qgkg/AGgbQADgKAQgGQAQgGANAEQAKACACACIAFAKQADgHAfhtQAVhGANADQAHACANANIAFALQAKASAPAPQAxAtBjABQBzABBOAZQAWAHAUAJQBsA0AAByQAAA2gdA6IgCAEQhAAihUAcQiCAqg/ABQgYADgjACIglACQgiAAgVgGg");
	this.shape_8.setTransform(42.4,27.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#E97C99").s().p("AgLgCIAXAAIgFABIgCABIgFAAIAAAAIgDAAIADADg");
	this.shape_9.setTransform(77.4,93.7);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#4F4E4B").s().p("AgYAOQAAgTgKgNIBAgJIAGALQgJAMAAAZIAAACIg1AFQACgHAAgHg");
	this.shape_10.setTransform(67.8,84.4);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F7D3C5").s().p("AAAA9QgSAAgUgbQgTgYAAgPIAAgBQAAgbAJgMIABgBIAGgEIAQgKQA6AkAZAlIgTARIgBAAIABABIABACQADAFAAAIIgBALIgKACIgJACIgXAAg");
	this.shape_11.setTransform(76.3,87.3);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#C25371").s().p("AgfDJQgegBAAgKQAAgCANgIQAJgHAGgSIgBgMQgIiPgIgkIAFgBIAAgBIgbhVIgGgXIAjgVQAggRAigQIAIAFIAJAEIAZAvIAEAHQAAAsgEAlIAJAZQAFAYAAAqQAAA5gjBoIAAABIgMACIgRABIgoABIgGAAg");
	this.shape_12.setTransform(50.3,111.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#F3D44E").s().p("AgkA7IgJgEIgJgFQgPgKgCgQIAAAAIgBgHQAAgWANgTQADgGAEgFQAVgYAegFQAeAAATAMQAJAFAFAIQALANAAATQAAAHgCAHQgEANgLAOQgYAfgogBQgOABgOgGg");
	this.shape_13.setTransform(58,86.6);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#E75F83").s().p("AC6FQQgNgCgKgJIgBgBQgIgIgCgGQgdglgognQgdgcgLgSQgMgVgCgZIABgRIgCgBQAAgbAIgLIAAAAIAAAAIAAgBQgTghgRglIgQgfQgTABgdAGIgCgEIAAAFIAAADIgEgHIgZgwQAOAGAOAAQApAAAYgfQAKgOAEgNIA2gFQAAAQATAYQAUAaASAAIALAGIAVB6IABAIIAIAzQAIAoAKA4QANA/ARAhIgCABQgIAHgLAAIgFAAgAjlg/IgDgOIACgMQAIgmAbg9QAag7Ajg2IAUgdQAZgEAsAAIBRAAIACAAIBKgBQAXASAVAYQA3A8AWBMQgWAcgOAQIgPAPQgZgmg7gkIAPgJIgKgVQgVgkgjgWQgCAFgBAJQAAAVAZA5IhCAJQgEgIgJgFQgTgLgfAAQgeAEgVAZQgEAFgDAFQgNAUAAAXIABAGIAAAAQACAQAPAKQgiAQggASIgkAUIgOgwg");
	this.shape_14.setTransform(63.9,98.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol36, new cjs.Rectangle(0,0,90.1,132.1), null);


(lib.Symbol35 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7D678C").s().p("AAeAIIAAgBIAOADIgOgCgAgqgHIgBgCIACAAIAAACg");
	this.shape.setTransform(15.3,60.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#9F8AAD").s().p("AAAABIAAgBIAAABg");
	this.shape_1.setTransform(8.6,13.2);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F3CE5B").s().p("AASBBQAAgEACgFQANgYBQgiQBZgmANgXQAKASAAAPQAAA3g3AfQgtAag7AAQgwAAAAgRgAjZAUIgHgEIAAgBIAAgMIAEghIAEgdIACgLIACgLQAGAUARAsQALAZAEANIABAIQAAAGgIABQgGAAgegQg");
	this.shape_2.setTransform(27,29.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#4F7ED2").s().p("AgMDIQgDgKgEgKIgggtIgIgLQgWgegMgMQglglguAAIgCAAQgSAAgQAMQgIAFgHAHQgHAIgHAKIgEAHIgBgCIgBgMQgEgpgBgiIAAgFIABgVIAHAEQAeAQAGAAQAIAAAAgGIgBgJQgEgNgLgaQgRgsgGgUQAJgkAFgKIAAAAQAGgVAJgSIAAABQAQAPAKAcIAOAuQAHASAKAIIADACIACABQB9AaAQgSIAdgrQAvhBBNAAQAwAAAcAsIAEAGIAIARIAFAOQAEALADAMIAFAfIABAMIABAdIAAAEIAAADQgDBdhUBDQg7AvhIAAQgXAAgYgFgABWgnQhQAigMAYQgCAEAAAEQAAARAvAAQA7AAAtgZQA3gfAAg4QAAgPgKgSQgNAXhZAng");
	this.shape_3.setTransform(29.7,33.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#375893").s().p("AihE0QghgDgogMIAAAAIgNgDQgCgBgDABIgcgLIgEgOQgNgygGgnIABgCIgEgcIgDgZIAEgHQAIgKAHgHQAGgIAIgFQARgLARgBIACAAQAuAAAmAmQALALAWAfIAIALIAhAtQAEAJACAKQBjAVBPg/QBUhCADhfIAAgDIAAgEIgBgcIgBgLIgFgfQgCgNgEgLIgGgOIgIgRIgDgGQgdgsgwAAQhMAAgvBBIgeArQgQASh9gaIgCAAIgCgCQgKgIgIgTIgOgtQgKgdgPgPIAAgCIADgFQAYgrAygaIARgIQARgWAQgNQA+gNBGAAIA9ABIgYAPIg5AqQhVA9gQAZIgjgCQgdgCgUgFQgDAOAAAOIABAHIBKAHIAcAEQASg2BVgvQAmgVAtgPQAjgMAIgBQATAHAQAJQAnAUAeAiQAaAdATAnQAzBmAACHIgEAWIgBADIgIAKQgXAfgpAdQgaATgcAQQgEgBgDACQguAag1ASQhIAZhJAHIAAAAIgDABIgNABIgRABIgGAAIgBAAIgcABIgVgBgAixEwIAPACIgPgDgAj6EgIABAAIAAgBIgCgBIABACg");
	this.shape_4.setTransform(36.1,30.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#36496B").s().p("AiLE+QgkgDgqgNIgMgDQgEgCgCgDQgCgEABgEQABgEAEgCIACgBQADgBACABIANAEIAAAAQAoAMAiADIAUABIAcgCIABAAIAGAAIARgBIANgBIADAAIAAAAQBJgHBJgaQA0gSAvgaQACgCAEABIABAAQAEABACAEQACAEgBAEQgBADgEADQgwAag2ATQhLAbhLAHIgCAAIgOABIgBAAIgRABIAAAAIgGAAIgeACIgWgBgAh8iNIhKgHIAAgHQAAgOACgOQAUAFAeACIAiACQARgZBUg+IA5gpIAYgQIAZABQAeACARAGIAKAEQAdAIAcAkQARAWALAWQgegjgmgUQgRgJgSgGQgJABgjALQgtAQgmAVQhVAvgSA1IgcgDg");
	this.shape_5.setTransform(33.7,32);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#385DA1").s().p("AhZA7QgJgWgGgMQAFACAHAAQAVAAASgRIAAABIASgVIABgCIABgHIAAAAQABgOgLgFIAAgBIgCgCIAKgMIAAAAIACAAICKgMIgDBBIgDA2IgTADQg4AGhuADIgDgHg");
	this.shape_6.setTransform(70.6,82.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#263E69").s().p("AAAABIAAAAIgBAAIgCAAIAIgEIgCACIAAACIgBAAIAAgBIgCADIAAgCg");
	this.shape_7.setTransform(45.5,93);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#2D549A").s().p("Aj1BVQgUgDgTgRIgKgLIgBgBQgMgOAAgNIAAgBQAAgMAKgFIAAgBIAGgCIABAAQABgBAAAAQAAAAABAAQAAgBABAAQABAAAAAAIABAAIADACIABABIANAJQARAKAJALIABAEQAAAAAAABQAAAAAAABQAAAAgBABQAAAAAAAAIgEABQgBAAAAAAQgBAAAAAAQAAAAgBgBQAAAAAAAAQgJgKgPgKIgNgIIgBgBIgBABIgEABQgFADAAAGIAAABQAAAKAKALIAKAKQAQAPARADIAIABQAOAAALgJIAOgNIAHgJIADgCIABAAQAAAAABAAQAAAAABAAQAAAAAAAAQABAAAAABIACADQAAABAAAAQAAABAAAAQAAABAAAAQAAAAgBABIgHAIIAAABQgLAMgFADQgOALgRAAIgJgBgADsAzQgGgCgEgEIAAgBIAAAAIgDgFQgBAAAAgBQAAAAAAgBQAAAAAAAAQAAgBAAAAQAAgBAAAAQAAgBABAAQAAAAAAgBQAAAAABAAIAAAAQABgBAAAAQABAAAAAAQABAAAAAAQABAAAAAAQABAAAAAAQAAABABAAQAAAAAAAAQABABAAAAIADAEIAAAAQAFAFAJAAQARAAAPgOQAIgHAJgMIABgFQAAgGgEgCQgPAQgIAHIgEABQgBAAAAAAQgBAAAAAAQAAAAgBgBQAAAAAAAAIgCgEQAAgBAAAAQAAgBABAAQAAAAAAgBQABAAAAAAQAJgIARgTQAAAAAAAAQAAgBABAAQAAAAAAAAQABAAAAAAIADAAIACACIABAAQALAGgBANIAAAAIgBAHIgBACIgTAVIAAAAQgSARgVAAQgHAAgFgCgAilAXQAAAAgBAAQAAgBAAAAQgBgBAAAAQAAAAAAgBIAAgBIABgDIABgCQAIgQAAgfQAAgWgCgJQgCgHgDgDQgBAAAAAAQgBgBAAAAQAAgBAAAAQAAgBAAAAQAAgBAAAAQAAgBAAAAQAAgBABAAQAAAAAAgBQAAAAABgBQAAAAABAAQAAAAABgBQAAAAABAAQAAAAABAAQAAAAABABQAAAAAAAAQABAAAAABIAFAFIADAJIAAAAQADAKAAAYQAAAhgJARIgBADIgBABIgDADIgBAAIgDgBgADPAQIgEgEIgCgDQgLgQgLggQgLgfgBgJIAAgBIABgDIADgCQABAAAAAAQABAAAAAAQABAAAAABQAAAAABAAIACAEQABAIAKAeQAMAhALAPIAAAAIACACQAAAAAAAAQABABAAAAQAAABAAAAQABABAAAAQAAABAAAAQAAABAAAAQAAABgBAAQAAAAAAABIgBABIgCABIgBAAIgDgBg");
	this.shape_8.setTransform(36.5,80.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#375893").s().p("AjSETIgIgIIgDgDIgEgGIAAgBQgEgGgBgGQgDgJAAgKQAAgnAWgaIABgBIADgDQAMgNAPgFIAGAAQAiAAAfAUIADACQAlAaAAAkQAAAXgSAUQgKAJgMAHQgTAJgaAAQgjAAgVgQgAB5EGQgJgEgGgGIgDgFQgGgIAAgMQAAgKADgJIAAgDQAHgVAXgXIAEgFQAJgIAIgGIAIgFQANgKANgDQAGgCAGAAIAAAAIADgBIABAAIABAAQAGABAKACIAFABIAFACQALADAQALIAEADIAAABIABABQANAJAGAPQACAIABAJQABAYgOATIgFAGIgBABIgBABIgIAHQggAZg2AAQgdAAgSgIgAgYCjIgRgHIgGgCIg+gZIgZgKQgmgRgTgJIgEgCIAHgIQABgBAAAAQAAgBAAAAQAAgBAAAAQAAAAAAgBIgCgDQAAgBgBAAQAAAAAAAAQgBgBAAAAQgBAAAAABIgBAAIAUgYIAAABQAAAAAAABQABAAAAABQAAAAAAAAQABABAAAAIAEABIADgDIABgBIARADIAIABIAdADQAgACAnAAIAfAAIADAAIAQgBIAcgCQA/gGBcgLIACACIAEAFQAAAAABAAQAAAAAAABQABAAABAAQAAAAABAAIACgBIAFAJIAGAIQgBAAAAAAQAAAAAAABQgBAAAAABQAAAAAAAAQAAABAAAAQAAABAAAAQAAABAAAAQAAABABAAIADAFIgKAGQgiAMguAeIgHAFQgYAPgKANIgJAEIg5gCIgZgBIgRAAIgDAGIgDAHIABgIgAlYAAQgagYAAghQAAgbAOgcIAIgQQALgQAHgIIADgDIABACQAhgFAoAAQAVAAAZADIAMgRQAggqAogoIABAAIAEgEQgGgMgKgLIArgDIAEAAIA1gDIgBBcQAAA8AHBHIAAAGQgaAIgSACQgeAGggAAQgMAAgNgDIgFgEQAAgBgBAAQAAAAAAgBQgBAAAAAAQgBAAAAAAQgBAAAAAAQgBAAAAAAQgBABAAAAQgBAAAAABIgFgGQgpgtgNgIIgCABIgFADQgSAKgaAaQgeAcgMAcIgDAHQAHAJAPARQgWgFgSgQgAEsAEIAVgYQgKgcgngpQgVgWgMgKIgDgDIgBAAIAAAAIgBAAIhDBGIgCABIgDACIgBADIgCABIghAEIgdABQgxAAgqgKIgCAAIACAAIgKixIgEg7IAMgBQApgBArAAQAUAAAjACQgKAIgDAGIAFAHQAXAeAyBHIAFAHIAOgKQAjgVAxAAIADAAIADAAIACAAIAXArIALATIgBAAIAAABQATAjAAAhQAAAcgVASQgSANgeAEIgCAAg");
	this.shape_9.setTransform(37.1,77);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#4F7ED2").s().p("AkMF0QgOgGAAgMQAAgFAGgHQAGgHAMgJIAYgPIgBgPIAAgGIABAAIAAAAIgBAAQAAg3AFgZQACgLADgGIADAGIAEADIAIAIQAVAQAjAAQAaAAATgJQAMgHAKgJQASgUAAgXQAAgkglgaIgDgCQgfgUgjAAIgFAAQgPAFgMANIgEADIAHgPIAAgBIAAAAIAAgCQAIgjAEgOQAUAJAmARIAZAKIA9AZIAHACIARAHIgBAIIgBAIIAAABIgBAIIgEAdIAAABQgFAyAAAmQAAA/AHAgQgeARglAKQgbAIghAEQggADgkABQgfAAgNgHgADIFsQgbgBgYgJIg4gXQgDgRAAgJQAAgkAHgzIACgOIAAgBIADgVIAEAFQAFAGAJAEQATAIAdAAQA2AAAggZIAIgHQAGAUAOA1QAIAeADAWIADAKQAFAIAQAJQAYANAAAFQgLAGgNAEQgmALhAAAIgPAAgABjCNIgDgKIgFgOIgHgSIACgEIAAABIABAAIAAgDIACgBQAKgNAYgPIAHgFQAugeAigMIAJgGIAAAAIABAAQAEAFAGACQAGAMAJAVIADAHIAHASQgQgLgLgDIgFgCIgFgBQgLgCgFgBIgBAAIgBAAIgDAAIAAABIAAAAQgHAAgFACQgNADgOAKIgHAFQgJAGgIAIIgFAFQgWAXgHAVIAAADIgBgCgAj6AqQgRgDgRgPIgJgKQgKgLAAgJIAAgBQAAgGAEgDIAFgBIABgBIAAABIAOAIQAPAJAIAKQABAAAAAAQAAAAABABQAAAAABAAQAAAAABAAIADgBQABAAAAgBQAAAAABgBQAAAAAAgBQAAAAAAgBIgBgDQgJgKgRgKIgNgJIgBgBIgEgCIgLgNIgBgBQgPgRgHgKIADgHQAMgcAdgcQAagaATgKIAFgDIABgBQAOAIApAtIAFAGQAAAAgBABQAAAAAAAAQAAABAAAAQgBABAAAAQAAABABAAQAAABAAAAQAAABABAAQAAABABAAQACADACAHQADAJAAAWQAAAfgIARIgCACIgBADIgUAXIgCABIgHAJIgOAOQgLAJgOgBIgIAAgADjAEIAAABIgCgEQAAgBgBAAQAAAAgBAAQAAAAAAAAQgBAAAAAAQAAAAgBAAQAAAAgBAAQAAAAgBAAQgBAAAAAAIAAAAIgGgHIgFgJIABgBQAAgBAAAAQAAgBABAAQAAgBAAAAQAAAAAAgBQgBgBAAAAQAAgBAAAAQAAgBgBAAQAAAAAAAAIgCgCIgBAAQgKgQgMgiQgKgdgBgJIgDgDQAAAAAAgBQgBAAAAAAQgBAAAAAAQAAAAgBAAIABgBIBEhGIABAAIAAAAIABAAIADADQAMAKAVAWQAnApAJAcIgVAZIAAAAIgKALIgDAAQAAAAgBABQAAAAgBAAQAAAAAAAAQAAABgBAAQgQAUgJAHQAAABgBAAQAAAAAAABQgBAAAAABQAAAAAAABIABADQABABAAAAQAAAAABABQAAAAABAAQAAAAABAAIADgBQAJgHAPgRQAEACgBAHIAAAFQgKAMgHAGQgPAOgRAAQgKAAgFgGgAhtgFIgdgDIgJgBIgRgDIACgDQAJgSAAghQAAgYgDgLIAAABIgDgKQANADAMAAQAfAAAfgGQARgCAbgIIgBgGQgGhHAAg8IABhcIASgBIAIAAIAEA7IAJCxIgCAAIACAAQAqAKAxAAIAegBIAhgEIACgBIAAAAQABAKALAfQALAgALARQhcALhAAGIgbACIgQABIgDAAIgfAAQgoAAgfgCgAgVh8IABAAIgBgBgAlIjcQgLgTAAgbIAAgEQgBglAjggQAbgaAjgGQALgCAMgBQAiAAAbAaQAaAZAKAEQgpAogfAqIgMARQgZgDgWAAQgoAAghAFIgBgCgADQjnQgyhHgXgeIgFgHQADgGAKgIIAGgEQAbgTAoAAIABAAIACAAIAAAAIAIgBIAFAAQAcAAAWAOQAIAGAHAHQAIAHAGAJQAMASAAAWQAAAUgMASIgBABQgwAAgjAVIgPAKIgEgHg");
	this.shape_10.setTransform(37.1,83.5);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#2D497B").s().p("ACsEOIAChCIiKAMQAegDASgPQAVgSAAgcQAAgggTgkIAAgBIABAAIgLgTIgXgqIgCAAIgDgBIgDgBQAMgSAAgTQAAgWgMgSQgGgIgIgIQgHgHgIgFQgVgOgcgBIgFAAIgIABIAAAAIgDAAQgnAAgcATIgGAFQgjgDgUAAQgrAAgpACQAKg3ARgoQAqhiBKAAQAcAAAdAMIACgEIAQgEIAQgBQBYAAAxBEQBCBcAADWIAAAJIAdApIA3BKIACACQgBAHgDAIQgHAQgNACIgBAAQglADgSAAIgKAAg");
	this.shape_11.setTransform(63.7,55.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol35, new cjs.Rectangle(0,0,89.9,121.3), null);


(lib.Symbol34 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#AA8170").s().p("AhZAJQgDgBgCgCQgDgCAAgEQABgDACgCQADgCADAAQCVACAbgEQADAAADACQADACAAADQABACgCADQgCADgDAAQgTAEhOAAIhTgBg");
	this.shape.setTransform(33.3,54.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F7D3C5").s().p("AgKAGQAKgGAMgGIgJAHIgOAGIABgBg");
	this.shape_1.setTransform(34.6,37.8);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#383535").s().p("ABYBAQgXgGgCgPQgBgIAmgPQAjgPAYgDIAEAAIADABIAGAEIgMAOQgTARgIAEIAQgBQAQgDANgEQgEAGgGAHQgSAPgYAEIgPACQgMAAgLgEgAidgCQgRgYgDgTIAAgBIAhAdQgFgJgJgaIgGgPQAFAAAFADQAIAFAJAKQAFAFACAGIAFAIQAJAOADAQQADARgPADIgCAAQgMAAgSgWg");
	this.shape_2.setTransform(29.4,39);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#9C3014").s().p("AAiBCQgGAAADgDIAHgIIAJgIQAmgfA8gDQAjgCALAcIABADQAAAAAAABQgBABAAAAQAAABgBAAQAAAAgBAAQgTAAgVACIgMACQgXACgaAHQgbAHgaABgAiggQQgugYAYgZQAeAFAPAdQAMAWgNAAQgHAAgPgHg");
	this.shape_3.setTransform(31.1,32.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#F7D3C5").s().p("Ag7DTQjRgZgdi5QgPhhAbhIIABgDQAEgKAFgKIABAAIAAgCIAAAAIAHgNIAFgIQAPAdAsArQAoAmAoAUIAFADIALADQAGAAANgCQAJgBAPgHQASgLAbgTIAjgbQAhgZAegQIASgCIAFAdQADBHBAA3IASAOIAFAFIgBAKQgCAVADAQQABALAEAIQAGAQALAHQALAGAMgCIAAgTIACABIABgJQADgGASgEQAPgCALAKQAMAKADATQADATgJAMQgKALgVADQgIACgHAAQAGAGAOAMIAIAFQALAIAGgBQgXASgaALQgWAEhSANIgBgBIg+AKQgmAEgiAAQgiAAgggEg");
	this.shape_4.setTransform(42.2,38.8);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#D25230").s().p("AEgEJIgIgGQgOgLgGgHQAIABAIgCQAUgDAKgLQAKgMgDgTQgDgTgMgKQgMgKgPACQgSADgDAHIgBAJIgBgBIAAATQgNACgKgGQgMgHgGgQQgDgJgCgKQgCgQABgWIACgLIgGgEIgRgOQhAg3gEhHIgEgcIgSABQgeARghAZIgjAbQgcASgSALQgPAGgJACQgNACgGgBIgKgCIgGgDQgogUgoglQgsgrgPgdIgEAHQgKALgVACIgNABQghAAgbgOQgZgNgCgOQACAAAJAEQAJAFANAAQAaAAAtglQAjgcAhgLIAAACIAfgUQgagNgPgMQgTgQABgIIABgBQAkAQB0AGIAKgCQASgDBFACQBFACARADIABAAIADABQAXAEAVACQgGgQAAgUIABgNIABAAQABATAyAbIALAHQAUAFAQAOIArAkQAXANAlAgQAKAPACAUQACAMAiBlIAAADIAAAAQADASgBAVQgBAngRAtIgHASIgGANIgEAKIAAABQgOAngUAbIgBAAIAAgCIgDACIgBABIgJAHIgBAAQgGAAgKgHg");
	this.shape_5.setTransform(41.2,27.2);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#9E74B8").s().p("AgBABIABgBIACABg");
	this.shape_6.setTransform(14.2,115.2);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#2254C4").s().p("AhIBCIAAgQIACg/IABgJQAFgRAGgeQAEgIAGgHQAGgHAHgDQAPgKAXAAQAQAAALAFIABABIAHAEIAIAHIAFgGQAKApAEAbIACAJQADATABAWIACAjIgKAEQhCAhhDAIQgCgSAAgVg");
	this.shape_7.setTransform(48.8,114.9);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#3D73EE").s().p("Ag9CEQAAgGATglIAGgKQANgcAAgEIgDgBQALgeAXg4IAehIIAMgcIAKAAIACAAIgCAaIgDAaQgKA6gXBNQgRA8gPAiQg1gFAAgEg");
	this.shape_8.setTransform(16.8,110.5);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#382727").s().p("ABiCoIgZgVQACgTAAgUIAAgQIgCgjQgBgWgDgUIAFADQAQAHAYACIAFAAQAfAAAxgOIADgBIAygNQAKBCABAxIAaAbQARATABAGIAAABQAAAGgvAJIgHABQgyAHgUABQgxgBgkgWgAkdCwQgQgGgEgMQgBgEAAgFQAAgGAJgLIAJgLQALgLAGgKIAFgFIABgJIAAgFIAEhCQAEAJAJAHQARAPAlAAQAkAAArgMIAPgFIAcgJIAEgCIgCBAIAAAQQAAAVACASIAAADIABALIgBAFIABAEIgBAAIABANQg2AFh3AFQgbAAgSgHgAAhhCIgBgBQgLgFgQAAQgXAAgPAKQgRgRgdgOQgegPgjgHQgbgMgbAAIgMACIghgBIgCAAIAAgGIACgIIABgOIABgDQAAgDAGgQIAFgOIA5ANQA4AMA2AAQCDAABKgLIAQgDQAXgFAJgEIACAAQAMAVAPAJIABAAIADALIAAABIAFARIAAACQgOgEgKAAQg3AAg4AdQgrAVgKATIgHgEgACMiGIAAgBIAAAAgAj3huIACAAIgDACIABgCg");
	this.shape_9.setTransform(48.6,111.7);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#F7D3C5").s().p("ADxBYIgCgBIgBAAQgQgJgLgVIgEgHIAAgBIgJgWIgEgRIgBgGIgEgOIgEgaIgEgWIAEgFIAHgHQAJgJAQgMIACgBIA3BHIAIAKIATAXQgDAAgDADQgHAHgPALQgUAMgHABQgFABgCADQgDACAAAFQAAAEADACQACAEAFAAQAMABAagSQgEATgIAMIgDAEQgEAEgGAFQgKgBgIgFgAjuBeIgKgBQgOgBgKgGQgOgHAAgMIABgEIAAgCIABAAIgBgBIgBgBIACgCQABgEADgBIABgBQAUAOAMADQAEABADgBQAEgDABgEQABgDgCgEQgBgDgFgCQgJgEgSgMIgVgQQgDgBgEABIgDABQAHgXAOgdQAUgpAVgPQABADAQANIAWATIAKAJQgBAXgDATIgFASIgFATIgDAJIgDAHIgCAGIgFAOQgGAQAAADIgBADQgGADgIAAIgBAAg");
	this.shape_10.setTransform(46.7,87.1);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#DBB6A7").s().p("Aj7AcQgLgEgUgOIgCgBIgSgNQgDgCgCgDIAAgGIABgCIADgEIADgBQADgCAEACIAVAQQARALAKAEQAEABACAEQACADgBAEQgCAEgDACIgFABIgDAAgADyAaQgEAAgDgDQgDgDAAgEQAAgEADgDQADgDAEAAQAIgBATgLQAQgMAHgGQACgDAEAAIABAAQAEAAADADQACACABAEIAAABQAAAEgDADQgIAHgRAMIgBABQgZAQgMAAIgBAAg");
	this.shape_11.setTransform(47,91.1);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#2D5FD0").s().p("Ah0FSIgSgCQAQgjASg7QAXhOAJg6IAEgaIABgaQAIAAAGgCIgCANIgBAIIgBAGIgBAQIgBACQgIBFgFA4IgEBBIAAAFIgBAJIgGAFQgFALgLALIgJALIgMgBgAkkEQQAmgaA2h8QAqhhAMgzIAQAMIABAFQABAEADACIASAMIACACIgBABQgDABgBAEIgCACIABABIABABIgBABIAAABIgBAEQAAAMAOAHQAKAGAOABIgMAcIgfBJQgXA4gLAfIgBABIgIAAIgzAXQgXAKgTAAQgZAAgOgDgAAtkqIgPgSIgDgGIACgCQBhgOA4AAQAmAAAfAKQAeAKAFAAIAHgCIgGANIAAAAIgCAEIgEAFQgOAUgPAFQhTAVgoAAQgsAAgogug");
	this.shape_12.setTransform(29.3,91.1);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#8D5EAA").s().p("AgBAAIADAAIgCABIgBgBg");
	this.shape_13.setTransform(32.1,58.7);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#C63131").s().p("AjYEYQgJgIgEgIQAFg4AIhFIADgBIgCAAIACgQIACAAIAhAAIAMgBQAbAAAbALQAjAIAeAPQAdAOARAQQgHAEgGAGQgGAHgEAJQgGAegFAQIgBAJIgEACIgcAJIgPAGQgrALgkAAQglAAgRgOgACSETQgYgBgQgIIgFgCIgCgJQgEgcgKgpIgFAHIgIgIQAKgSArgVQA4gdA3gBQAKABAOAEIAAgCIABACQAMA4AIAxIADAVIgyAOIgDABQgxANgfAAIgFAAgACsBwIAAAAIAAABgAiNBGIg5gMIADgHIACgHIADgJIAGgTIAEgSQADgSABgXIgKgJIgWgUQgQgNgBgCQgUAOgUAqQgOAdgIAXIgDADIgBADIgQgMQgOgLgLgKIgggtIgHgKIAAgBIAAgBIAAgFQABgUAFgWIAIgUIANggQAOgXAVgaQANgOANgNQANgYATgLQAagPAkAAQAbAAATAIQAHACAHAEIAOATQAoAtAtAAQAnAABSgVQAQgFANgTIAEgGIADgEQAHgHAIgFQAVgQAUAAQAxAAAUAeQAmAlAjBIQAXAvAXBHIABADQgaAigVAWQAAgDgDgDQgDgDgEAAIgBAAIgTgWIgIgLIg3hHIgCACQgPALgKAKIgHAHIgEAEIAEAXIAFAaIADANIABAHIAFARIAIAVIABABIADAHIgCAAQgJAEgXAFIgQADQhKAMiDAAQg2AAg4gNg");
	this.shape_14.setTransform(45.4,86.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol34, new cjs.Rectangle(0,0,82.6,130.8), null);


(lib.Symbol33 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7B5749").s().p("AgdABQgKgLgEgMQAagBAiAIIAbAHIgEAOQgHARgSAAQgaAAgSgWg");
	this.shape.setTransform(44.1,54.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F3C42A").s().p("AAaBqQgRgHgSgLQgvgdgLAAQgJAAgNAFQgJADgMAGIgRAIQgQAHgJAAIgBAAIgDAAIgIgBIgQgRIgJgMQgSgZgJgZQgGgQgDgRIgCgMIAAgSQAAgQABgOIAGgTIAEAAQAngCAlABIANAAQA+ACA4AKQB8AXAmAPQAzAUAZAhQgOAEgEAOIgCAEIgCAEIACAEIACAEIAAACQgPAUgdASQg4AihPAAIgGAAgAABg4QgLAHgMAKQgaAZAAASQAAAQAjAgQAPAPARAKQAYAGAbAAQAbAAARgQQASgQAAgcQAAgSgcgdQghgjgmAAQgSAAgOADgAjZhBQgEABgCACQgCACAAADQABAEACACIAFAEIAAADQAAAHACAKQAGATAOAbIALAQQAXAQAUAAQAIAAAGgDQAHgDAGgGQANgMAAgTQAAgPgJgQQgHgKgJgIIgBgBIgJgJQgZgUgZgFQgKABgIAGIgDACIgBABIgCAEIgBgBQgBgBgBAAQAAAAgBAAQAAgBgBAAQAAAAgBAAIgBAAg");
	this.shape_1.setTransform(48.3,41.1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F7D3C5").s().p("AhoBrQgRgJgRgMQgPgLgMgMIgHgJQgHgKgLgLIABAAQAJAAAPgHIARgIQANgGAJgDQANgFAIAAQALAAAwAdQASALASAHIAFAAQBOAAA4giQAegRAOgUIAAgCIgBgEIgCgEIACgEIABgEQAEgOAOgFQAHgDALAAQAUAAAOAXIABAAQALAVAAATQAAANgKAHQgJAGgJABQgGADgIAAIgDAAIgCAAIACACIABAEIAGAJIADAEIADAGIgCABQgRANgUALQgWAOgYAKQg8AZg8AAQhFAAg1gZgAh7A3QAEAMAKAMQASAWAbAAQASAAAHgRIAEgPIgbgHQgegHgWAAIgJAAgADFgNIABgCIgBAAIAAACgAgRAWQgRgKgRgOQgigggBgQQAAgTAagZQAMgKANgHQAOgDARAAQAlAAAhAjQAcAeAAASQAAAcgSAPQgQAQgbAAQgcAAgWgGgAguhRIgHAFQgLAIgFAIQgBAEAAAEQgBANAWALQAUALAWAAQAHAAAGgCQAIgEAFgFQAGgFACgFIAAgEIAAAAIABAAIACAAIAHgBIAQgDIABgEQgBgHgDgEQgDgDgCABIgRACQgBgGgFgGQgFgHgGgEIgEgCIgHgCIgGgBIgEgBQgUAAgQAJgAjegTIgKgQQgPgcgFgTQgDgKAAgHIAAgDIAIAHIABABIAEANQADAKAIAKQAQATATAAQAEAAAFgCQAHgFAAgIQAAgOgKgSQgHgLgHgIIgIgJQgHgFgGAAQgMAAgFAJIAAABIgGgFIADgEIABgBIADgCQAHgGALgBQAYAFAaAUIAIAJIACABQAJAIAGAKQAJAQAAAQQAAATgMAMQgHAGgHADQgGADgHAAQgVAAgXgQg");
	this.shape_2.setTransform(52.1,46.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383535").s().p("AlOESQgWgLgLgIQgMgMgCgIQAFgOAbgTQAkgYABgCIgagGQglgLgggLQhVgegBgvQAAgpBpgdQA6gQAOgGQAggNAAgQQABgRgZgSQgZgTABgCQAAgQAuggQAjgYAZgHQANgFATgEQAUgEAagEIAKgBIAOgCIAAgBIgOgEIgEgBQgigHAAgHQABgTAlgSIAYgKIABgBQAbgJA1gPIAHAAQAKgCAKAAQAWAAAWALQANAGANAJQALAJAKALIAGAFIAMgBQBcAAA6AVIASAHQBAAdAAAzQAAAVgEAZQgGAZABAHIABAKQAFAZAjAdQALAKAJALQATAaABAZQgBApgTAkQgKAQgNAPQgqAxg0AAQgQAAgGgMIgBAAIgDgEIgGgIIgBgFIgCgBIACAAIADAAQAIgBAGgDQAJgBAJgFQAKgIAAgMQAAgVgLgVIgBAAQgOgWgUAAQgLAAgHACQgZghgygUQgngPh7gWQg4gLg/gCIgMAAQglAAgnABIgFABIgFATQgCANAAAQIAAASIADAMQACASAHAQQAJAZASAZIAJAMIAPASIAIAAIALANIASAUIAOAMIgOAKQgTAPgMAIQgjAXgmAAQgoAAg0gagAHsCZIACgFIAAABIgEAMIACgIgADgCXIABAAIgBABIAAgBgAgWCJQgWgLABgNQAAgEABgEQAFgIALgHIAHgGQAQgJATAAIAEABIAHABIAHACIAEADQAGADAFAHQAFAGABAGIARgCQACAAADACQADAEABAHIgBAEIgQADIgHACIgCAAIgBgBIAAABIAAAEQgCAEgGAFQgFAFgIAEQgGACgIAAQgVAAgUgLgAjMBoQgIgKgDgKIgEgMIgBgCIgIgGIgEgFQgCgCgBgDQAAgDACgDQACgCADAAQADgBADACIABABIAGAGIAAgCQAFgJAMABQAGgBAHAFIAIAJQAHAIAHALQAKASAAAOQAAAIgHAFQgFADgEAAQgTgBgQgTg");
	this.shape_3.setTransform(49.4,30);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#A32810").s().p("AAMA7IgBgBIgCgDIgJgjIgOgsIgIgaQgBgDABgCQACgDACgBIABAAQADgBACACQADABABADIABACIAHAYIAAgBIAOAsIAKAkQAAADgBADQgCACgDABIgCAAIgEgBg");
	this.shape_4.setTransform(47.3,113.6);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#BFA636").s().p("AAAABIgCgBIABgBIAEADIgDgBg");
	this.shape_5.setTransform(78.5,75.8);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#8A2714").s().p("AgHAkIAAgDIgCABIgCABIgCgHIgDgJIgFgNIgCgGIAPgQIAJgLQAPgUAGgOQACAPAAAcQAAAhgKAgIgFAPg");
	this.shape_6.setTransform(45.2,72.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#D47D3A").s().p("AAREDIABADIgBAAIAAgDgABZBnIADABIAAABgAhbkEIABgBIgBABg");
	this.shape_7.setTransform(54.9,85.5);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#AF3821").s().p("AANEqQADgRAAgOQAAgMgCgJQgDgWgLgJQgEgDgGgSIgFgQIAAgIIACgIIAAgEIABAAIABgCIAFgaQAQgFATgIQgCACgBADQgCAFgCAGIAAACQAFATAGAAIAtghIAIAfIABAAIAFATIAAAAIAPAnIAAACIgBABIAAAAIAAAAIgFAGIgDAOQgCAMAAATIgEACIgFAEQgoAZgjANIABgKgAhpkAIgBgBQgDgFgGgDIABgCIAKgJQApgfBHAAQAtAAAeANQAOAHATAMQgnABgnACIgwAFIgmAEIgTADIgiAGIgDAAIgBgCg");
	this.shape_8.setTransform(57.3,86);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#E0C035").s().p("ABpDFIgBADIgCABgAAFCvIAAgBIAAgBIABACIgBAAgAhnjHIgBgBIADACIgBABIgBgCg");
	this.shape_9.setTransform(46.9,102);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#F78D3B").s().p("AhWC6IADABIgCABgADEiSIABABIgHABgAisiWIgBAAIAEgCIACADIABACIgGgDgAjEi7IABABIABACg");
	this.shape_10.setTransform(56.1,100.7);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#C6472F").s().p("AD0E4IgQgeIgBAAQgIgRgIgXIgHgaIAAgBIgBgBIADABIAMAHQAMAHAKAAQATAAAUgiQATgjAJAAQACAAADAEQgJBSAAAjIAAADIAXAZIALALIgSADIgNACIgKABQgeAAgWgOgAAFFAIAWgeIgBgDIAAgBQADgBABgDQACgCgBgDIgKgkIgPgtIAAAAIgGgYQAEgCAFAAQAGAAAMANIABgBIAAACIAFALIADgDQAMANANAGQAIACAHAAQAKAAAOgGIABgBIAVgLQABAKAAAMQAAANgCASIgCAJIgIAnIgBgBIAAADIAAAAIgCAJIgDAEQgWAHgSAEgAhmEfIgMgDIg8gRIAfgeIAKgKIADgIQgsAAg8gJIgNgCQg8gMgdgeQBhgJA6hQQAPgVANgXQAdhUAPgfIADgEIgHgJIAAgCIAMAHIACACIAPATIAKAOIgDABIgIgCQgBAAAAAAQgBAAAAABQgBAAAAAAQAAAAgBABQAAAAAAABQgBAAAAAAQAAABAAAAQAAABAAAAQAAABAAAAQAAABAAAAQAAABABAAQAAAAAAABQABAAAAAAQAAABABAAQAAAAABAAQAAAAABAAIABABQgCADAAAHIAAAGQACAJAJAFIAbAGIgCAGQAAAAgBABQAAAAAAABQAAAAAAABQABAAAAAAIABABIgRAYQgQAVgNALIAMAAIAHAAQAPgBAUgEIAMgDQgCAJAAANQAAAdAVBCQgDABgBACQgCADABADIAIAaIAOAsIAKAjIABADIgHABIgCgBIgZAFIgGABIgUACIgSABQgUAAgWgFgAAChnQAAgBAAAAQAAgBAAAAQAAgBAAAAQAAAAgBgBQAAAAgBgBQAAAAAAAAQAAgBAAAAQgBAAAAAAIgBAAIABgKIgDgEIAFgPQAKggAAgiQAAgcgCgPQADgKAAgHQAAgZgHgQIAigFIAUgDIAmgFIAwgEQAogDAnAAIANAAIAXAAIgDAEQgRATgDAWIAAAIQAAAHAEAKQAFAcAPAmQAQAoASAYIgCACIABADIgDAIIgCAAQhFgEgnAAQhlAAg0AJQgOACgNAEIABgCg");
	this.shape_11.setTransform(46.6,91);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#F3C42A").s().p("AgUCCIABgDQACgGACgFQABgDACgCQgUAJgQAFQgVAFgRAAQgNAAgVgDIgMgCIgIAAIgIAAIADgTIABgFIADgUQgUAIgSAFIgMADQgUAEgPABIgHAAIgMgBQANgKAQgVIARgYIACABIAEgBIACgCIAFgLQAGgRAOgeIASgmIAAgBIABgDQANgEAOgDQAzgIBlAAQAmAABFAEIACAAIADgIIgBgDIADgDIACgCIAJgJIAMgOIADABIgFgEIACgBIAAgBIAEgHIABgBIALgRIABgDIACgCIAEAAQApAMAcArQAJANAGANIAIARIADARIgPAAIgSACQgGACgCACIgBgCIgMAIIgEADIgCAAIgFgBIAAAAQgGAAgKADIgBABQgQAFgCAEQAAAAAAABQAAAAAAABQAAAAAAABQAAAAAAABQABAAAAAAQAAABAAAAQABABAAAAQABAAAAAAQAAABABAAQAAAAABAAQAAAAABAAQAAAAABAAIACgCIACgCIALgEIAAAAQAJgCAEAAIACAAIAEAAIACgEIAAAAIAFACQAGADAAADQABALgSAMIgLAIIAAAAIgDABIgCABIgBAAIgBgCIAAgBIgGAAIgIgCIAAgDIgDgCIgBAAIgCgBQgNgGgKgUIgGgPQgJgYgEgTQAAgBAAAAQAAgBAAAAQgBgBAAAAQAAAAgBgBIgCAAIgBAAQgBAAAAAAQgBAAAAAAQgBAAAAABQAAAAgBAAQAAABAAAAQAAABgBAAQAAABAAAAQAAABAAABQAEATAJAaIAIAQQAIASAMAIIAFAEIADABIABAAIgCACIgDAEIgEAEIgBABIAAABIAAAAIgBAAIgHAHQguAHg/AnIgWAQIgsAhQgFAAgGgSgAAZBeIAAgBIgCgBgACIgCIAHgBIgBgBgAjhAcQgIgEgDgJIAAgGQAAgHACgCIAEAAIAKAFIABAAQALAFACADIADACIAEgBIACgEQAAAAAAAAQAAgBAAAAQAAgBAAAAQAAgBgBAAQgCgEgPgGIAAAAIgFgDIgBgCIgDgCIgKgPIgOgSIABgBIgEgBIgMgHIgEgDIgOgIIgFgDQAAgFACgHQAFgSAWgUQAagZAegFIAMgBIADAFIACAHIAEAOIAEAJIACAGIABgBIADgBIgBAEIARAZIAEAFIgCAKQAAgBAAAAQgBAAAAABQAAAAgBAAQAAAAgBAAQAAABAAAAQgBAAAAABQAAAAgBABQAAAAAAAAIgBAGIgRAlQgRAjgGASIgbgHg");
	this.shape_12.setTransform(61.6,86.6);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#C49B15").s().p("AjAA4IgBgBIgCgBQAAgBAAAAQAAgBAAAAQAAgBAAAAQAAgBAAAAIACgGQAHgSAQgjIARglIABgFQAAgBABAAQAAgBAAAAQAAAAABgBQAAAAABAAQAAgBAAAAQABAAAAAAQABAAAAAAQAAAAABAAIAAAAQABAAAAAAQABAAAAABQABAAAAAAQAAABABAAQAAABAAAAQAAAAAAABQAAAAAAABQAAAAAAABIAAACIgBADIAAACIgSAlQgOAegGARIgEALIgDADIgCAAIgCAAgAC/AsIgCgBIgBAAIgDgBIgFgDQgLgJgJgSIgIgQQgJgagDgTQAAgBAAAAQAAgBAAgBQAAAAAAAAQAAgBABAAQAAgBAAAAQABAAAAgBQABAAAAAAQABAAAAAAIABAAIADABQAAAAAAAAQABABAAAAQAAABAAAAQABABAAAAQADATAJAYIAGAOQAKAVANAGIADABIABAAIACACIAAADIAAABIgCADIgDABIgBAAgAjGAYIgDgCQgCgDgLgFIgBAAIgKgFIgDgBIgCgBQAAAAgBAAQAAAAgBAAQAAAAAAgBQgBAAAAAAQgBgBAAAAQAAAAAAgBQgBAAAAgBQAAAAAAgBQAAAAAAgBQAAAAABgBQAAAAAAAAQAAAAABAAQAAgBABAAQAAAAAAAAQABgBAAAAQABAAAAAAIAIACIABAAIAGACIAFADIAAAAQAPAHADAEQAAABAAAAQAAAAAAABQAAAAAAABQAAAAAAABIgCADIgCABIgCAAgADDARQAAgBgBAAQAAAAAAgBQgBAAAAAAQAAgBAAAAQgBgBAAAAQAAgBAAAAQAAgBAAAAQAAAAABgBQABgFARgFIABAAQAKgDAFAAIABAAIAEABIACAAIABACIABACIAAABIgDADIgEAAIgBAAQgFAAgJAEIAAAAIgKADIgCACIgDACIgCAAIgCAAg");
	this.shape_13.setTransform(61,85.6);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#F7D3C5").s().p("ABJEXIgMgHIgEgBQAAgTADgMIADgOIAEgGIABAAIAAAAIABgBIAAgCIgPgnIAAAAIgGgTIAAAAIgJgfIAWgQQA/gnAugHIAHgHIABAAIABAGIABAFIAAATQAAAJgLBlIgDAWQgDgDgCAAQgIAAgUAiQgUAigTAAQgKAAgLgHgAhTEMQgNgFgNgOIgDADIgEgLIgBgBIAAAAQgNgNgFAAQgGAAgEADIgBgCQgBgDgDgBQgDgCgCABIgBAAQgVhCAAgdQABgMABgKQASgEAUgIIgDAUIgBAEIgDAUIAIgBIAIABIAMACQAVADANAAQARAAAVgGIgGAaIAAACIgBAAIgBAEIgBAIIAAAIIAEAQQAGASAFADQALAJAEAWIgUALIgCgDIABADQgPAHgKAAQgHAAgHgDgAEYgvQgGgNgJgNQgcgrgpgMIgEAAIgCACIgBADIgLAQIgBACIgEAGIAAABIgBAAIgXgZQgVgXgOgUQgOgSgFgNQgEgKAAgIIAAgHQADgWARgUIADgDQARgSAPAAQAOAAAJADQAFACAEAFIARALIAJAHQAQAPAWAYQBCBIALBXIgNAOIgSAPIgIgRgAkHgqIAEADIAAACIgEgFgAk/iKQAGguBGgzIAmgaQALgDAKAAQATAAALAFIABABQAFADAEAFIABABIAAACIADAAQAIAQgBAYQAAAIgDAJQgGAPgPATIgLAMIgOAPIgDgFIgMABQgeAFgaAZQgWAUgFASQgZgjgOgmg");
	this.shape_14.setTransform(61.2,85.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol33, new cjs.Rectangle(0,0,98.7,123.7), null);


(lib.Symbol32 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.cache(0,0,51,52);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#774B31").s().p("AigDRQhAgrAAgZQAAgWAngLIA1gPQgXgGgwgyQgyg0AAgbQAAgLAOgKQAOgKANAAQALAAACACIAHAIIAGh5QAChIAOgBQAMABApAeQApAeA0ABQAugBA0gTQAFgCAFgDQAqgRAZgDIAGAAIANABQA4ABAcATQgQAFhDAhQhKAlAJAGQgIgEgHAvQgHAuAAA8QAACiAxAqQgZALgoANQg6ASggAAQhEABhGgxg");
	this.shape.setTransform(25.4,25.8);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol32, new cjs.Rectangle(0,0,50.8,51.5), null);


(lib.Symbol31 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();this.cache(0,0,105,125);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#F7EEC5").s().p("AiBCcQg+g3gLhSQgCgNAAgMQgBhHAsg4QA1hHBZgEQBYgHBEBBQA1AyALBEQADARABASQABBEgkA1QgKAOgMANQg4A6hRABIgCAAQhNAAg9g2g");
	this.shape.setTransform(26.2,71.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AgoAiIgIgDQgbgMAAgTIAAAAIgBAAIAAgDIAAgBIACgEQAEgJAGgGQANgOAQgCIAHgBQAMAAAIACIACABIAFAFQAVASAJAAQAGgBAKgGQALgHAHAAQAOABABAQIgBAFQgCAQgPANQgUARglAAQgXABgUgHg");
	this.shape_1.setTransform(58.4,48.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F7D3C5").s().p("AjSDGIgJAAQgPgXgUgUIgUgTIAqgUIgCAFIgBABIABADIAAAAIAAAAQAAAUAbAMIAJADQATAGAZAAQAlAAAUgRQAPgNACgRIAAgFQAAgRgOAAQgHAAgLAHQgKAGgHAAQgIAAgWgRIgGgFQAygUA3gUQAfgOAQgoQANgjANAAQANAAAMAVQAMAUAMAAQASAAAlgqIAFgGQAABGgpA3IgFAEIgYAQIgfAVIhJA6QgvASg5AEIghABIgVgBgADFCnQgGgagEgHIgCABQAGgFAFgHQAJgMAAgMQAAgRgVgUQgRgQgSgFQgHgCgHAAIABgbQAAgRAGgNQAHgRALAAQAUAAAEARQACAJgBATIADAAQAFgDAEgJIAEgJQAAgBAAgBQABAAAAgBQAAAAABAAQAAAAAAAAQAIgTAXAAQAHAAAGACQAIAEAAAGQAAAQgOAYIAAAKIADAAIAHgHIACgBIASgTQAHgGAFAAQAJAAAHAGQAIAIAAANQAAAVgeAbQgQAPgOAIIALAkQAEAMAAALQAAAMgNAJQgOAKgUAAQgNAAgFgRgAkyApQAAgcAsgkIAMgKQAPgGASgFQAogKAeAAQAwAAAbALQAbALAAATQAAATgvAdQg8AlhUAAQhGAAAAgfgAkAAGQgDADAAAEQAAAEACADQADADAEAAIARABQgBAKADALQABAGADgEQAsg2BMARQAKADACgIQALgpg+AKQgWACgVAGIgKAEIgBAAIgQgMQgEgDgEABQgEAAgCAEQgDADABAEQAAAEAEADIAKAHIgIAIIgXgCQgEAAgDADgAAuggQgHgIAAgYQAAgoAMguQAKgkAIgMQAQAYAMAXIgBAKIgFADIgBgJQgBgDgDgBQgCgCgDABQgDAAgCADQgCACABAEIADAPQgGAGgEAHQgJAPgBAQQgCAeAWgXIAQgPQANgKAGgJIAHAdIgRAWQgbAfgTAAQgHAAgEgDg");
	this.shape_2.setTransform(74.2,35.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383535").s().p("AigBlQgDgLABgJIgQgBQgEAAgDgDQgDgEAAgEQAAgEAEgDQADgCAEAAIAWABIAIgIIgKgIQgDgCgBgEQAAgEACgEQADgDAEgBQAEAAADACIARAMIAAABIALgEQAVgHAVgCQA/gJgMApQgCAIgKgCQhMgSgsA3IgCABQAAAAAAAAQgBAAAAgBQAAAAAAgBQgBgBAAgBgACBgcQABgQAJgOQAFgIAGgGIgDgPQgBgDACgDQABgCADgBQADgBADACQACACABADIACAIIAEgCIABgLIAAgCQAAgDADgCQACgCADAAQADAAACACQACACAAAEIgBAPQAMALgJAQQgGAJgNAKIgRAPQgJAJgFAAQgHABABgSg");
	this.shape_3.setTransform(67.1,30);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#4F4E4B").s().p("AhHApIgBgbQgCgWgFgWQAPAEAVACQgKARAAASQAAAUAOAOQgRgBgPgDgAA8gKQAAgPgHgLIAHgBIAUgHIAAADIAAABQAAAegDAXQgNAHgOAHQAKgSAAgTg");
	this.shape_4.setTransform(64,66.8);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E75F83").s().p("AiLHnIgFgLIgJgnQBAgRAzgvQBThNAEhwIABgIQAPAEARABIADADQAPAOAUAAQAZAAATgXIAIgMQAOgHANgIQgGAjgOARQgJAMgQAIQgPAHgTAEQgUAEgZABIgLBkIgJBQIglASQgYALgUAAIgogCQgjAAgBAgIAAAHIgBAPQgCAKgJAAQgPAAgKgUgAAqBpQgKgngVgiIACgFIABgEIAVABIAhgBQA4gEAvgSIgGAFQAEANAIAJQAHAHAOACIAEAAIAAA2IgUAGIgHACIgGgHQgNgNgSAAIgWgCIgFACQgRAGgLARIgFAJQgVgCgPgEgAjOhpQguhOAAhmIAAgEQgMgTgngtQgrgxAAgEQAAgIAYAAQAgAAAqACQAkACAIACIADgCQAxgbBGgXIAUgGIAdgJIAxgNQAtgLArgHQBrAaBFBYIAOATQgIAMgKAkQgNAuAAAoQAAAYAIAIQADADAHAAQATAAAbgfIARgWQADAQAAAPIAAADIgFAGQglAqgSAAQgNAAgLgUQgMgVgOAAQgNAAgOAjQgPApgfAOQg4AUgxAUIgBgBQgJgCgMAAIgGABQgQACgNANQgGAHgEAIIgpAUQhEg6hZgJgAAHjbQgRAFgQAGIgLAKQgsAlAAAcQAAAfBFAAQBUAAA7glQAvgdAAgUQAAgTgbgLQgbgLgwAAQgdAAgoAKg");
	this.shape_5.setTransform(51.8,53.2);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#C25371").s().p("AAwH6QgMgFgDgEIACgMIABgCQACgMADgDQgIgEgGgPQgIgTAAgbQAAgbAHgVQAHgUAAgOIAAgFQgDgYgkgaIgtgaQAQgJAJgMQAOgRAGgiQADgYABgeIAAgBIBRAyQAyAkAdAlIAAADIAAADIAAACIAAADIABAGIABAVQAAAagWA6IguB3QAFADAKAFIAFACQATAHAAAIIAAACIgCAAQghAJgSAAQgQAAgOgHgAgDA4IgEAAQgOgCgHgHQgHgJgFgMIAHgGIBJg4IAegWIAZgQIAEgDQAfgUAXgKIAOgHQATAFARAQQAVAUAAARQAAAMgJAMQgFAIgGAEQgnAFhYAkQg5AYgWALgAjUnoQgLgLAAgGQAAgGANgBQAjAAArAMIArAMIgMACQgqAGguALQgNgJgKgKg");
	this.shape_6.setTransform(72.4,51.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#F3D44E").s().p("AiIFrIgGAAQgFgBgDgEQgHgHAAgNQAAgRAEgIIAYAAQgCAHAAAKQAAAKABAHIADAJIAEAFIABABIgCAAIgGABIgGAAgAjgEKIAGgMQAQgOAfgFIAegEQAKATAPAAQAJAAACgKIAAgOIBZgJQCAgLB/ACIAAABIgCAMQADAEALAGQAPAGAQAAQASAAAggIIACgBIAAgCQAAgIgSgHIgFgCQBgADBnAHIAKAGIgGAJIgLAEIjZAQQivANlGAAIgJgBgAmpB1QhVhLgIhtQgKh1BPhWQBShaB8gCQASgBARACQBZAIBDA7IAVATQAUAUAOAWIAGAKQAVAiAJAmQAGAWACAXIAAAbIAAAHQgEBwhTBNQgzAuhAASQgkAKgpAAQhvgBhShJgAkVkXQhZAEg1BHQgsA4ABBHQAAANACANQALBRA+A3QA9A2BQAAQBRgBA4g6QAMgNAKgOQAkg1gBhDQgBgTgDgRQgMhEg0gyQg9g7hPAAIgRABgABThIIgDgDQgOgOAAgTQAAgUAKgRIAFgIQALgSARgFIAFgCIAWACQASAAANANIAGAHQAHALAAAOQAAAUgKASIgIAMQgTAYgZAAQgUAAgPgPg");
	this.shape_7.setTransform(52,78.8);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#56513D").s().p("AAfAkIgVgFIgSgEQgygLgVgGIAAgCIABAAIBRgGIAXgBIAAgBIAGABIABAAQAIgQAFgUQAQADASAAIAAAGIgCADIgMARQgPATgUAXg");
	this.shape_8.setTransform(47.5,114.3);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#645D3D").s().p("AgZAiIABAAIgBABgAAXgiIAEABIgDAEIgBABIAAgGg");
	this.shape_9.setTransform(53.2,114.5);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#918969").s().p("AkIBoQgDgHAAghQAAgVAEgbQAVAGAzALIASAEIAVAEIAAACQg8BEghAAQgPAAgEgHgAkuALQgMgNAAgWIABgKQABgIACgEIgNgEIgPgFIgRgHQgIgIAAgKIAAgBIAJABQFHAACugOIDZgQQhcAhhNATQiDAhiIAAIgLAAIgEAAIgMAAIgDgBQgTgBgPgCQgFAUgJAQIgBAAIgGgBIAAABIgXABIhRAFIgBgBIgEgEIgDgJQgBgHAAgJQAAgKACgIIgYAAQgEAIAAASQAAALAHAIQADADAFABIgCAAIgPACIgEgFg");
	this.shape_10.setTransform(65.9,113.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,104.9,124.8);


(lib.Symbol29 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();this.cache(0,0,30,34);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AAxBMIgFgBQgbgKgYgNQgbgOgZgSIAlgnIAXgcIAPgOIADgEQAGgHAJgHIAAAAIAAARQAAASACATQAEArAOAsIABAFIACAGIADAHIgLgEg");
	this.shape.setTransform(20.2,18);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFEF1C").s().p("AAbBpQgMgGgLgHQgOgKgOgNIgLgKQgfgBgPgHQgHgDgLgKQATgOAUgVIAmgoIgbAAIATgUQASgSAUgQIAPgLQAYgRAQgIIgCASQgDAQAAATIgBAAQgJAHgFAHIgEAEIgOAPIgZAcIgkAmQAaASAaAOQAZANAbAKIAFACIALAEIAHATIACADIACAHIAFANQgogGghgRg");
	this.shape_1.setTransform(17.9,17.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#EC4747").s().p("ACSCmQgogCgjgKIgVgFQgcgHgmgPIACgDIAFgFIgEgDQgmgHgVgSIAJgGQgYgIgZgSQgZgVgIgMQAWgLAigVIAPgMIAJgLIgLgEIAGgFQAVgOAOgKQAQgKARgGIgOgDIgQgFIgUgHQAfgMAvgXIAxgWQAPgIANgGIADgBIgBACIAAADIAAABIgCAOIgCAHIgFAUQgQAIgYARIgPALQgVAQgSASIgSAUIAaAAIglApQgVAUgSAOQALAKAGADQAPAHAfABIALAKQAOANAPAKQALAIAMAFQAhARAnAGIALAWIACAEIABADg");
	this.shape_2.setTransform(14.6,16.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,29.2,33.1);


(lib.Symbol28 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();this.cache(0,0,132,81);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#375893").s().p("Ah3CXQgGgLAAgKIABAAIACABIgDgEQACgjAlgiQAggeALABIADAAQgLgWAAgdQAAgXAGgQIAHgNIABgDIAMgSQAsg4BWgIIAVgBIgHAHQgJAJgIALQgZAzAAA2QAAAqAlAdIADACQgqAagVAAIgHAAIgGgCIgBAAQAEAJAAAPQAAAMgGAMQgFAJgJAKQgJAKgJAFQgMAIgOgBQgRAAgMgJIgBgBQgaAOgSAAQgNAAgMgLgAhGBGIABABIgBgCIAAABg");
	this.shape.setTransform(46.8,64.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#4F7ED2").s().p("AjhCGIgBgBQgIgLgEgOQgFgPgBgYIAAgTQAAgPABgLIAAgDIACgMQALgUAtgUQAbgNAXgFQAJgDAJgBIgBADIgHANQgGAQAAAWQAAAeALAWIgDgBQgLAAggAeQglAigCAiIADAFIgCgBIgBAAQAAAKAGALQgOgNgMgcgAAtBLIgIgGIgDgCQgkgdAAgqQAAg3AYgyQAIgLAJgKIAHgHQAoglAzAAQAqAAAfAhQAjAmAAA9QAAAxgfAsQgkAxgzAAQgqAAgogZg");
	this.shape_1.setTransform(54.8,62.2);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#7D678C").s().p("AgcAHIBIgQIgBACIgLADQgpAKgiAEIAPgDg");
	this.shape_2.setTransform(120.8,66.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F3CE5B").s().p("AipA4Qg3gfAAg3QAAgPAKgSQANAXBZAmQBQAiANAYQACAFAAAEQAAARgwAAQg7AAgtgagACuAdIABgJQAEgMALgZQARgsAGgUIACALIACAKIAEAeIAEAhIAAAMIAAABIgHAEQgeAQgGAAQgIgBAAgGg");
	this.shape_3.setTransform(109.1,36.2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#9F8AAD").s().p("AAAAAIABABIgBAAIAAgBg");
	this.shape_4.setTransform(127.5,19.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#4F7ED2").s().p("AilCeQhUhDgDhdIAAgDIAAgEIABgdIABgMIAFgfQADgMAEgLIAFgOIAIgRIAEgGQAcgsAwAAQBNAAAvBBIAdArQAQASB9gaIACgBIADgCQAKgIAHgSIAOguQAKgcAQgPIAAgBQAJASAGAVIAAAAQAFAKAJAkQgGAUgRAsQgLAagEANIgBAJQAAAGAIAAQAGAAAegQIAHgEIABAVIAAAFQgBAigEApIgBAMIgBACIgEgHQgHgKgHgIQgHgHgIgFQgQgMgSAAIgBAAIgBAAQguAAglAlQgMAMgWAeIgIALIggAtQgEAKgDAKQgYAFgXAAQhIAAg7gvgAjFhEQAAA4A3AfQAtAZA7AAQAvAAAAgRQAAgEgCgEQgMgYhQgiQhZgngNgXQgKASAAAPg");
	this.shape_5.setTransform(106.4,40);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#36496B").s().p("AAMgKQglgUgtgQQgjgMgJgBQgSAHgRAJQgmAUgeAiQALgVARgWQAcglAdgHIAKgEQARgGAegCIAZgBIAYAPIA5AqQBUA9ARAZIAigDQAegCAUgEQACAOAAAOIAAAGIhKAHIgcAEQgSg1hWgvg");
	this.shape_6.setTransform(100.4,15.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#375893").s().p("ABwE0IgHAAIgRgBIgNgBIgCAAQhKgHhLgaQhVgehGgyQgqgegXgeIgIgLIgBgCIgEgXQAAiGAzhmQATgnAagdQAegjAmgUQARgJASgGQAJABAjALQAtAQAlAVQBWAvASA1IAcgDIBKgHIAAgHQAAgOgCgOQgUAFgdACIgiACQgRgZhVg+Ig5gpIgYgQIA9gBQBHAAA9AOQAQANASAWIAQAHQAxAaAZArIADAGIAAACQgPAPgKAcIgOAuQgHASgKAIIgDACIgDABQh9AagPgSIgfgrQgthBhNAAQgwAAgcAsIgEAGIgIARIgGAOQgDALgDAMIgFAfIgBAMIgBAcIAAAEIAAADQADBeBUBDQBOA+BkgUQADgKAEgKIAfgtIAJgLQAWgeALgMQAmglAuAAIAAAAIACAAQASAAAQAMQAHAFAHAHQAIAIAHAKIAEAHIgDAZIgEAbIABADQgHAmgMAzIgDAOQhSAfg7AAIgdgCgACyEvIgOADQAhgFAqgKIALgDIACgCIhKARg");
	this.shape_7.setTransform(100,37.3);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#A58FDB").s().p("AAAAAIABAAIgBAAIAAAAg");
	this.shape_8.setTransform(22.9,38.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#345EA8").s().p("Ai/D5IgqgCIgQgNQgfgZgTgeQglg0gFhDIgBgaQAAg+AIgnQACgNAEgKQAFgPALgNIADgBIABgCIAAgBIACgBIABAAIABAAIAEgBIANgDIAcgFIAHgCIACAAIgBABIBjgSIgUAiQgHAOgDARQgNAxgBBDIAAAKQACBFAYA3QAKAXAOAVQAOAWASATIgqAAIgjAAgAjuCEIACgBIgCAAIAAABgACiC+QgJgjAAgpQAAgpAGgjQAIg3AVgqQAcg3AbAAQAPAAAHAMIABACIAEgDIABAAIAGAIIABABIABABQAhAwAVBFIAAABQALAmgBAmQAAAjgEAkQhHAThBAOIgiAHIgHgWgAjQjHQhfgngDAAQgEAAgEACIAAAAQANgFAWgEIAQgDQAlAMBAAdQAmASAbAQIgKACIgUAFIhRghg");
	this.shape_9.setTransform(46.8,24.9);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#4F7ED2").s().p("Ah4DLQgOgVgKgXQgXg3gChFIAAgKQAAhDANgxQAEgRAGgOIAVgiIhjASIABgBIgDAAIgGACIgcAFIgNADIgEABIgCAAIgBAAIgCABIAAABIAAACIgDABQgMgUAAhHQAAgVAKgGQADgCAFAAQACAABfAnIBRAhIAUgFIALgCIAVgFQBPgRBAgBIADAAIADAAQBpABBEBAQAKAKAJALIAGAHIgBAAIgEADIgBgCQgHgMgPAAQgbAAgcA3QgWAqgIA3QgFAjAAApQAAApAJAjIAHAWQifAgh8AFQgSgTgPgWg");
	this.shape_10.setTransform(44.1,25.4);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4F7ED2").s().p("AhpB6QgZgaAAgtQAAhCBLhLQAbgcARgLQARgQAVAAQAQAAAaAHQAZAGANAAIAYABIgGADQgVAGgaAbQgnAoAAAtQAAAsAbAWQAHAFAHAEIAHADQgTAYgcAVQgtAhgtAAQgfAAgYgYg");
	this.shape_11.setTransform(13.1,63.9);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#375893").s().p("Ag5CLIgWgCIgIgDIgNgGIgCgBQgvgZAAgxQAAhAAogpIAJgIQAagYAogPIALgEQASgGATgFIABAAIAhgHIAlgHQAngIAagDQgWAKgUAPQhJA0AABDQAAAwAbAZQAbAaAwAAIAGAAQg5ARgsAJQgvAKgjAAIgRgBg");
	this.shape_12.setTransform(39.6,56.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#263E69").s().p("ABYCcIgEgBIAAgCIgBAAIgEAAIgCgBIgDgDIgGgHQgGgIgEgJIgBgFQg/Ang9AAQg4AAgmgRIAIgCQAygLAfgXIgGAAIgGAAQgvAAgbgaQgcgZAAgwQAAhDBJg0QAVgPAWgKQA1gaA7AAQA+AAAdAcIAMAOIAmgBQAVAAAUACQAiACAeAHIAIAPIAAABQAFAOABAYIABAEIAAAIIAAAbQAAAigGAfQgKA1gYAmIgQAWQgqAEgqAAQgrAAgggIgAEiAKIABgBIAAgBIgBACgAExCYIgFgBIADgKIAEgQIADgLIAJggIAGgZIAJggIADgJIAEgKIAHgQIALgbIAPgnIAKAGQAwAiAKAmIADANIADAYQAAAigJASQgKAWgbAOIgRAIQgRAHgRAGQgVAGgNAAIgMgCgAl0CXQgPgCgMgEIgHgDQgHgEgGgFQgcgVAAguQAAgtAngnQAagbAVgGIALgCQAJABALACQgpApAABAQAAAxAvAZIACABIAOAGIgBABQgXAPgbgBIgNAAg");
	this.shape_13.setTransform(61.8,56.2);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#253656").s().p("AgSCEQgFgHgKgLIADgBIgDABIgEABIgRADQAYgmAKg1QAFgeABgjIgBgbIAAgHIAAgFQgCgXgEgPIgBgBIgIgPQAMADAMAEQAVAGATAKIARAJIAEADIgPAnIgLAbIgGARIgEAKIgDAIIgKAgIgGAZIgHAgIgDALIgFAQIgDALg");
	this.shape_14.setTransform(93.6,58.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,131.7,80.7);


(lib.Symbol26 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();this.cache(0,0,119,76);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#983522").s().p("AgjAQQAAgRACgIIAAAAIAWgSQAJABAJACIAHACIAWAIQgRAJgQAMQgYAVgHAAQgHAAAAgMg");
	this.shape.setTransform(12.1,64.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#C6472F").s().p("AB/BPIgjgXIgOgHIgEgDIgEgCIgEgCIgBgBIgBgBIgDgCQgDgFgBgIIgBgGIAAgFIABgRIADgPQAEgPAIgMIADgGIAAgBQAGgIAIgFIACABIAMgLIAGgCIAMABIALgCQAygKAtAAQAuAAAfALQAOAGALAIQAQALAJAOIhagFIgOAAIgfgCIgjgBIgCADIgDAEIgDAIIgDALQgBAIAAAKQAAAHAFAHQAbAgCNAaIALACIABAAIAEACIgGAEIgBABQgxAcg1AAQhJAAg0gcgAlnAbIgBgEQAAgUATgkQAIgPAIgLQAQgVAQgGIATgBIAIABIACgBIAEgBQAfgJAkgGIAQgDIgKAHIgMALIgEAGQgUAXgDAiIgGgCQgLgDgIAAIgWARIgBABIgVAPIgGAFQgkAcgPAAQgGAAgBgJg");
	this.shape_1.setTransform(36.1,64.6);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#C29C21").s().p("AhHARQgPgGgKgCIgIAAIAQgPIAMgMIAEgCIALAFIAHAEIADABIAKAFQAHADAIABQAKACAOAAQAIABALAAQAOABA7gIIAKgCIAFAEIghAIQg7AQgoABQgbAAgRgFg");
	this.shape_2.setTransform(33.5,69.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E0C035").s().p("AAAAAIAAAAIAAABg");
	this.shape_3.setTransform(94.5,70.2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#BFA636").s().p("AAAAAIABAAIgBAAg");
	this.shape_4.setTransform(88,71.2);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#F7D3C5").s().p("ADTBeIgEgCIgBgBIgLgCQiNgZgaggQgGgIAAgIQAAgJABgHIADgLIADgIIADgFIACgDIAjACIAfABIAOABIBaAEIADAAIAQABIAPABIAMAAQgDAFgDAIQgNAfAAA3IABAPIgVgDgAFyBVIAGAAIgIABIACgBgAkoAeQgfgTgagKIgWgHQADghATgYIAFgGIALgKIAKgHIAOgCQA4gIA1AAIAbAAQAGANABAIIAAAGQgZAAgiAUQgiAYgKAGIAyAKQgEAFgdARIgcASIAGAFQAKAGARAIIACABIgDADQgUgJgYgPg");
	this.shape_5.setTransform(51.1,62.6);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#F3C42A").s().p("ABZB3QgEgLgCgNIgBgQQAAg3ANgeQADgJADgFIADgDIAHgBQAcgCASAAQApAAAdAEIABgBQAjgGAhAAIAIAAIAGACIAHgBQANgCARAEQAzANAWAWQAIAJAEAIIAAABQADAIgBAHIgCAKIgCAHIgBACQgCAFgFACIgDABIACgKIAAgDIAAgCQgBgPgHgNIgEgFQgFgIgGgFQgGACgFAGIgCADQAIADAGAMQAGAKACAOIAAAFIgBAAIAAAHIgCABQgIAJgLAAQgKAAgHgFIAAgBIAAABIgFgFQACgGAAgGIgBgHQAAAAAAAAQAAgBAAAAQAAgBAAAAQAAAAABAAIgBgCIgBgDQgDgLgKgJIgBAAQgGgFgKgEQgFABgDADQgEADAAAEQASAGAIALIACAGQADAKABAPQAAACACADQgIAFgOAAQgQAAgfgMIgBACIgCgCIgVAFIgbAEIgIABIgGAAIgCAAIAAABQgRALgVAKQgpARgeAAQgLAAgKgCgAlIBHQgNAAgKgCQgIgCgHgDIgKgFIgDgBIgHgEIgMgFIgCgBQgRgJgKgGIgGgEIAcgSQAdgSAEgFIgygKQAKgGAigXQAigVAZAAIAAgGQgBgHgGgOIgDgFIgIgQIAHAAQAPAAAdAPIAVAKQAKgDALAAQAMABALADIACAAQAQAEAOAJQAHAEARAPIgLADIgNgBIgGACIgMAKIgCAAQgHAFgGAIIgBABIgDAGQgIAMgEAOIgDAPIgBASIAAAEIABAHQABAHAEAFIACADIABABIABABIAFACIADABIgKACQg7AJgOgBQgLAAgKgBg");
	this.shape_6.setTransform(66,62.9);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#B89214").s().p("Ag4BBQgBgQgDgJIgCgGQgIgLgSgGQAAgEAEgDQADgEAFAAQAKAEAGAFIABAAQAKAIADAMIABACIABACQgBABAAAAQAAAAAAABQAAAAAAAAQAAABAAAAIABAGQAAAHgCAGQgCAFgGAEQgCgDAAgCgAgDA9IAAgHIABAAIAAgGQgCgNgGgKQgGgMgIgDIACgDQAFgGAGgBQAGAEAFAIIADAFQAHANABAPIAAABIAAADIgCALQgEABgEAAIgEAAgAAUAyIACgHIACgKQABgIgDgHIAAgBQgEgIgIgJQgVgXgzgMQgRgEgNACIgHABIgGgCIgIAAIAigfQAWAHAoATQANgDANAAQAvAAAhAWQAZARAAALQAAAJgGAIQgGAJgHAAQgFAAgEgEIAAACIgFAJQgIAKgJAAQgFAAgGgFIgCgBIgDgDIgBAAIgCAEQgGALgKAAQgDAAgGgDg");
	this.shape_7.setTransform(107,63.8);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#7B5749").s().p("AgoAGIgDgOQAKgEARgDQAigJAaACQgEAMgKALQgTAWgaAAQgRAAgIgRg");
	this.shape_8.setTransform(95.6,58);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#F3C42A").s().p("AgfBsQhQAAg5gjQgdgSgQgVIABgBIACgFIABgDIgCgFIgCgDQgEgPgNgEQAYghA0gVQAngPB9gXQA/gLBGgBQAkgBAoACIAFAAQADAJACALIACAUQgCgCgCgBQgEAAgCACIgFAFIgFgGIgBgBIgDgCQgHgGgLgBQgZAFgaAVIgKAJQgJAJgGAKQgKARAAAPQAAASANANQAMALAPAAQAVAAAYgPIAKgRQAPgbAFgTQADgKAAgHIAKgKIAAAEIAAAIIAAAFQgDAYgIAVQgKAagSAZIgJAMIgQARIgIABIgFAAQgNAAgcgOQgNgHgJgDQgNgFgJAAQgMAAgvAdQgSALgRAIIgGAAgAhogYQgcAdAAATQAAAcASARQARAPAbAAQAcAAAXgGQARgJAQgQQAkghAAgQQAAgSgbgZQgLgLgMgGQgOgEgSAAQgnAAghAkg");
	this.shape_9.setTransform(90.7,44.7);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#F7D3C5").s().p("AgoCLQhMAAhIghQgsgUgWgWQALgGALgJQAMgKALgLIgCAAQgKAAgIgDQgJAAgJgGQgLgIAAgMQAAgVAMgUIABgBQAOgXAVAAQAKAAAIADQANAFAEAPIACADIACAFIgBADIgCAFIgBABQAQAVAdARQA5AjBPAAIAGAAQARgIATgLQAvgcAMAAQAJAAANAEQAJADANAHQAcAOANAAIAFAAIgLAOQgjAng2AfIgEACIgZAJQgxAPg5ABIgCAAgABGA3QgRAEgKADIADAQQAHARASAAQAbAAATgWQAKgNAEgMIgIAAQgXAAgeAHgAjGgSIAAgCIgBAAIABACgAhMAIQgSgQAAgcQAAgTAcgeQAhgkAmAAQASAAAOAEQANAGALALQAbAZAAATQAAAQgkAhQgRAPgRAJQgWAGgcAAQgbAAgRgPgAgVgxIABADQACAFAGAFQAFAGAHADQAGACAIABQAWgBAUgLQAWgLAAgNIgCgIQgFgIgLgIIgHgFQgQgKgUAAIgEABIgHABIgGACIgEADQgHAEgFAHQgFAGgBAGIgQgCQgCgBgEADQgEAEAAAHIABAEIARADIAHACIABAAIABgBgACagUQgNgNAAgSQAAgQAKgRQAGgKAJgJIAKgJQAagVAZgFQALABAHAGIADACIABABIAFAGIgCACIAAgCQgFgJgMAAQgGAAgIAFQgEADgEAGIgOATQgKASAAAPQAAAIAIAFQAEADAEAAQATAAAQgUQAIgKAEgLIADgMIACgCIACgBQAAAHgDAKQgFATgPAcIgKARQgYAPgVAAQgPAAgMgLg");
	this.shape_10.setTransform(86.9,50.8);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#383535").s().p("AjVEkQgwgLgcgpQgHgJgGgNIgCgRQgEgNgBgMQgFgLgLAAQgEAAgSAGQgSAGgHAAQgmAAAAguQAAgoAUgWQAMgNAEgLIABACIADgGQAIgNAAgLQAAgSg1gOQgggJgMgPIgHgOIgBgBQgBgFAAgFQAAgiAdglQAfgoAlAAQATAAAuAVQAuATAQAAQAcAAAtgjQAOgcAWgaQAyg5A+gJQAOgGAMAAQANAAAMADQAPADAOAIQAjALAbAbQAMAMARAUQANAPAKAAQALAAAjgMQAigNAZAAQBBAAAtBEIAKAOQANAYAIAZQANAGALALQAcAeAAA8QAAAtgfAnIgKAMIAAgEIAAgIIAAgEIgKAJIgCACIgCABIgDANQgEAKgIAKQgQAUgTAAQgEAAgEgDQgIgEAAgJQAAgOAKgSIAOgTQAEgGAEgDQAIgFAGAAQAMAAAFAIIAAACIACgBIAFgFQACgDAEABQACAAACACIgCgUQgCgKgDgJIgFgBQgogBgkAAQhGABg/AMQh+AXgnAPQgzAUgYAiQgIgDgKAAQgVAAgOAXIgBAAQgMAVAAAVQAAAMALAIQAJAGAJABQAIADAKAAIACAAQgLALgMAJQgLAJgLAHQglAVgoAAQgWAAgTgFgAk4C9IAAgBIACAFIACAIIgEgMgAgoC+IABAAIAAACIgBgCgACfC4QgIgEgFgGQgGgFgCgEIgBgEIAAgBIgBABIgBAAIgHgCIgRgDIgBgEQAAgHAEgDQAEgEACABIAQADQABgHAFgFQAFgIAHgEIAEgCIAHgCIAHgBIAEgBQAUAAAQAJIAHAFQALAIAFAIIACAIQAAANgWALQgUAMgWAAQgIAAgGgCg");
	this.shape_11.setTransform(71,29.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,118.4,75.3);


(lib.Symbol25 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();this.cache(0,0,139,90);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#F7D3C5").s().p("AhRBrIgCAAIgDAAQgQAAgMgJQgKgGgHgKIACgDQABgFgCgDQgCgDAAgDQABgHADgGQAFgHAIgBIAFABQADABACAFQACADAEABQADABADgCQAFgBABgEQAAgDgBgEQgGgNgLgDIAAAAIgKAAQgTgBgKASIAAAAQgDAFgCAGIgBACIAAgBIAAAAIgBAXIgCAAIgCgBQgIgFgHgLIABAAQgMgSAAgdQAAgrAggfIAXABIAFABQAMgJAQgGQAcgHAjgCIAYAIIAIACIAJACIAIADIABABQAYAUAGAoIADAUIgBAUIgCAZIAAACIgJAHIABgMIAAgNQAAgbgEgKIgBgFQgDgCgEgBQgEgBgEADQgCAAgBAFQgBADACADIABADQACAIAAAUIAAABQAAAQgCANIgBACIAAAGIgIAFQgOAIgPAGIACgHIAAABQADgOAAgPIAAgIIgCgQQgCgMgDgCQgCgEgEAAQgEAAgDACQgEACAAADQAAAFACACIACAHQACAKgBALIgBAOIgBAJIgBABIgCAJIgFAAIgNAEIgJADIgIACIgFABIgDAAIgCAAgABBA8QAEgOACgMIABgGIAAgJQgDhHgmgdIgDgDIgCAAQAMgKAPgFQAZgHAfgBIAdAIIAPAFIABABQAaAVACAzIAAARQAAAKgCANIgHAGIAAgXQAAgbgFgIQgCgCgDgBQgEgBgDACQgDABAAAFQgBADACACQACAHAAATQAAAQgBALIgBACIAAAFIgIAFIgMAFIgPAHIACgGIAAAAIADgJIABgQQAAgNgCgJQgCgJgCgCQgDgDgEgBQgCAAgDACQgEACAAADQAAAEABADIADAFQABAHAAALIAAALIgDAKIAAAAIgCAIIgDAAIgNADIgHACIgIADIgEABIgCAAg");
	this.shape.setTransform(119,63.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#DBB6A7").s().p("Ag3BrIgDACIgOAEIgTAEIgBABIgCABIgBAAIgGABQgDAAgCgBIgBAAIgCAAQgVAAgSgLIgBAAQgMgJgJgOIgCgBQgBgEAAgCIgCgHIAAAAIABgWIAAAAIABABIABgCQABgGADgGIAAAAQAKgSATABIAKAAIAAABQAMADAFAMQACAEgBADQgBAEgEACQgDACgEgBQgDgCgDgDQgCgFgCgBIgGAAQgIAAgEAHQgEAHAAAGQAAADACAEQABADAAAEIgCADQAHAKAJAHQAMAIARAAIADAAIABAAIACABIAEgBIAEgBIAIgCIAJgDIAOgEIAEAAIACgJIABgBIACgJIABgNQAAgMgBgKIgDgGQgCgDAAgEQABgEAEgCQACgCAEAAQAEAAADAEQACADADALIACARIAAAIQAAAPgEANIAAAAIgCAGQAQgGAPgIIAIgFIgBgFIACgDQABgNAAgQIAAgBQAAgUgBgIIgCgCQgCgDABgDQACgEACgCQACgCAFAAQAEACACADIACAEQADAJABAbIAAAOIgBALIAJgHIAAgCIABgZIABgUIgCgUQgHgogXgUIgBgBIgIgCIgJgDIgJgCIgXgHQgjABgcAHQgQAGgMAJIgGgBIgWgBIADgCIAGgGQASgOAXgJIABAAIAFgCQAMgDAPgBQARgDATAAIACAAIAKADIARAEIAIACIAAABIAGgEQAOgNAVgIIABAAIAEgBQALgDANgBQAPgDARAAIACAAIAIADIAPAEIAHABIAAABIARAFIACABIADACQAhAaADBAIAAAHQAAADgCACQgBALgEAQIgDAIIgBADIgBgCQgOAMgNAAIgFAGQgHAGgHAEIAAAEQgBALgLANQgRAPgYAAQgPAAgMgJIgBADQgQApgoAAQgdAAgHgYgAAdhqQgPAFgMAKIACAAIAEADQAmAdACBHIAAAKIgBAFQgCAMgEAOIABAAIADAAIADgBIAIgCIAIgCIAMgEIAEAAIACgIIAAAAIACgKIAAgLQABgKgCgHIgCgGQgBgDAAgDQAAgEADgCQADgCADABQADAAADADQADADACAJQABAJAAAMIgBARIgCAJIAAgBIgCAGIAOgGIANgGIAHgFIAAgFIABgCQACgLAAgOQAAgVgDgGQgCgDABgDQABgEADgCQADgCADABQAEABACADQAEAHAAAdIAAAVIAHgGQACgMAAgLIAAgRQgCgzgagVIgBgBIgPgEIgdgIQgeAAgaAHg");
	this.shape_1.setTransform(121.4,64.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#3F3F3F").s().p("AgFAAIALgBIgBADIgKgCg");
	this.shape_2.setTransform(55.2,59.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#2E1E1E").s().p("AiDBUQgFgCgBgJQAAgRAbgyQAWgqANgOIACgBQAVgMAggHQA4gNBmgBQgMAIgMAYQgQAhAAAkQAAAPAFAOIgBAAIgDgBIgHgEQgMgIgEAAIgIACQgXABgbAYIgLgGIgQgKIgUALQg7AegeABQgKAAgDgCg");
	this.shape_3.setTransform(13.8,63.5);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#851A1A").s().p("AAFBMIgEgGQgOgSgxAAIgGAAIgHABQgEgOAAgPQAAgkAPghQAMgYAMgIIAcgBQArAAAuARQgfAhAAAgIAAAEIgSAZIgMAVQgFALgEAKIgBAEIgBgDgABPg8IACAAIAAAAIgCAAg");
	this.shape_4.setTransform(31.6,62.8);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#382727").s().p("AkACoIgBAAQgEgKgBgOIgBgLQAAhJAzg2QAJgJAKgIQAbgYAWgBIAIgCQAFAAALAIIAIAFIACABIABgBIAHgBIAGAAQAxAAAPASIAEAGQgMACgSASQgXAXgEAhQgCALAAALQAAARADANQgPgJgMgFQgOARgQAPQgaAXgYAKQgQAHgPAAQgVAAgNgQgACVAnQAEgOADgNIAAgCIAAgJIACgUQgFgQgGgPQgWg1ghAAQglAAgWARIgCABIgKAJIgIAKIgBgEIAAgEQAAghAfghIACABIACAAIAAAAIADgIQAmgkA0AAQATAAASAFQAjAJAcAaQAMAMAJANIADAEIgHAAIgyAGQgDAMAAAsQAAAmAJAfIADALIAAAAIAEACIABAAQgcAKgaAAIgSgBgADEhwIALADIACgEIgNABg");
	this.shape_5.setTransform(35,70.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#982424").s().p("AkiB1IgFgDIgYgOQgDgOAAgQQAAgLACgLQAFgiAWgWQASgSAMgCIACADIgBAEIgFAOQgGAWAAAdQAAA+AfAhIAKAJQgXgJgjgWgABLAoQgjgKgygYIgDgCIgBgBIgEgCIABAAIgEgJQgJggAAgnQAAgrAEgMIAwgGIAHgBIgDgDIABAAIAigDIgBACIAAACQgGANAAAXQAAASAIARIAOAQIADADQAOAOAUAIIACACIACABQA8AbCSAAIgNAHQhLArhZAAQgmAAghgJg");
	this.shape_6.setTransform(58.5,73.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#C63131").s().p("AlECYIgKgJQgfgiAAg+QAAgdAGgVIAEgPIABgEIABgEQAEgKAFgKIAMgWIASgYIABADIAIgKIAKgJIABgBQAXgRAlAAQAhAAAWA2QAGAPAFAPIgCAWIAAAIIAAADQgDALgEAOQgLAcgSAhQgJAPgJAOQglAzgpAAQgIAAgOgFgAlPgvIADAAIABgBIgEABgADpABIgCAAQiSABg9gbIgCgBIgCgBQgTgJgOgOIgCgDIgPgQQgHgQAAgTQAAgWAFgOIABgCIABgCIABgCQAXgCAkgCIA1gDQBSgCBpgBIBLAAIAVAAQgiAfgBAsIAAACQAAAdAMASIgBAAQAHAMAIAEIACABIAAABIABALIg0ADIg+ABIgNAAg");
	this.shape_7.setTransform(67.7,73);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#AA8170").s().p("AhdASQgDgCAAgDQAAgEADgCQACgDADAAQAcAACTgYQADgBADACQACACABAEQABADgCADQgCACgDABQiVAZgdAAQgDAAgCgDg");
	this.shape_8.setTransform(104.8,52.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#9C3014").s().p("Ai1BSIAAgEQAGgdAjgDQA8gHArAZIAJAGIAJAGQADADgGACIgBAAQgZACgcgCQgbgDgXACIgNAAQgVABgSADQgBAAgBAAQAAAAgBAAQAAgBAAAAQAAgBAAAAgACEgqQAKgfAdgLIACACQANALgFAOQgFAMgTAOQgQALgHAAQgJAAAHgWg");
	this.shape_9.setTransform(103.4,29);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#D25230").s().p("Ai2EeIgBgBIgCgBIgBACIgIABIgEAAQgMAAgLgFQgJgDgJgHQgHgFgRgQQAJgDAMgLIAGgFIAGgHIgOgVIgKgRQgXgpgIgnQgEgUAAgTQAAgJAGgdIgSAAQgZgCgPgIQgRgIgCgMQAVgFAqguIAogvIACgJIgRgGIgJgCQgXgHAFgMQANgDBBgiQAYgUAogXQAQgJAPgHQAogRAvgJIALAAQAKAAAgADIAEABQAlAEAVAAQAiAAAggFIAGgBIgKgGQgOgKgEgJQgEgGABgGIACACQACABAbAGIAGACIA5AOQAWAGAOAOIAEACQAZABAqAfQAqAiAAAXQABAGgGAMQgFAMgBADQABAAAAAAQAAAAAAAAQABABAAAAQAAABgBAAIgNgUIgBAAIAAgCIAAgBQgIgKgHgIQgLAfgkAxQgiAsgkAaIgGAEIgJAEQgHACgNAAQgJAAgPgFQgUgHgegPIgogVQglgUgegLIgSABIAAAdQAHBGg2BAIgPARIgFAFIADAKQAFAWAAAQQAAALgCAJQgEAQgKAJQgKAIgMAAIgCgTIgCABIgDgIQgDgHgTAAQgPAAgKAMQgKAMAAATQAAATALAKQAMAKAVAAQAIAAAHgCQgEAIgNANIgHAHQgKAKgGAAIgKgGg");
	this.shape_10.setTransform(84,29.2);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F7D3C5").s().p("AjZDsQgbgGgagOQAGAAAKgJIAHgHQANgOAEgHQgHABgIAAQgVAAgMgJQgLgLAAgSQAAgUAKgMQAKgLAPAAQATAAADAGIADAIIACgBIACATQAMAAAKgHQAKgKAEgQQACgJAAgLQAAgQgFgWIgDgKIAFgFIAPgQQA2g/gHhIIAAgcIASgCQAfALAlAVIAoAUQAdAPAUAHQAPAFAJAAQANAAAHgCIAJgEIAGgEQAkgZAigtQAkgwALggQAHAJAIAJIAAABIAAACIABAAIANAVQAKARAHASIgBgBQgeALgJAeQgNAmAlgaQATgOAFgMQAIAcADAiIgXAcQADgLAGgaIADgQQgFABgEADQgIAHgHALIgGAMIgEAJQgGAPAAAQQAAASAPAAQANAAAOgbQAHgMADgLIABAaQAAC5jJA7Qg+ARhLAEIg/AAIAAABQhTAAgXgBgADFCFQiTAYgcAAQgDAAgDADQgCADAAADQAAADACADQADACADAAQAcAACWgaQADAAACgDQACgDgBgDQgBgEgCgBIgEgCIgCABgAghBDQAUANAXAAQAUAAASgIQAVgJAAgPQAAgJgpgJQgjgJgYAAIgEABIgDABIgGAFIAPAMQAVAPAIACIgQABQgPAAgOgCQAFAGAHAFgAgsgfQgiAEgGAcIgBADQAAABAAAAQAAABABAAQAAABABAAQAAAAABAAQATgEAUgBIANAAQAXgBAaACQAcADAZgDIABAAQAGgBgDgCIgIgHIgKgGQghgTgqAAQgNAAgOABg");
	this.shape_11.setTransform(93.8,36.8);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#383535").s().p("AicBMQgIgFgEgGQANACAQAAIAQgBQgIgDgWgOIgOgMIAFgFIAEgBIADgBQAYAAAlAJQAoAJAAAJQABAOgWAKQgRAIgUAAQgZAAgTgNgABxgOQABgQAGgQIADgIIAHgMQAHgMAHgGQAFgEAEAAIgDAQQgFAagEAKIAYgcIAEgGIAAACQABAKgEAMQgDALgHAMQgPAagMAAQgQAAAAgRg");
	this.shape_12.setTransform(106.1,35.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,139,89.1);


(lib.Symbol23 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();this.cache(0,0,90,61);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFA35D").s().p("AgLgGIAAgBIACAAIAVAFIgEAKIgTgOg");
	this.shape.setTransform(3.4,17.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F78D3B").s().p("AABBLIAUAPIgJAFIgLgUgAgUheIAHAAIgCAGIgFgGg");
	this.shape_1.setTransform(2.1,9.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#D45D46").s().p("AEFBdQhjhChIgjQhjgxhJgFQiHgIhggsQgegOgYgRIAEgKQATADALAAQALAAAIgBQAHgBAGgCIAIgEIgCgDIA+APQBYATB6AWQCUAcCfCaQAoAmAsAyIhrhGg");
	this.shape_2.setTransform(41,33.1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#C6472F").s().p("Ak+EGIgLgHQgLgIgggfQgXgVgWgIIAAgBQAhANApg2QASgWAIgTQAMgcgFgYQgDgIgEgFIgUggIgRgXQgSgXgLgNIgQgXIgTgjIAJgFQAYARAeAOQBfArCIAJQBJAFBjAwQBIAkBjBCIBqBGQgsgygognQifiZiTgcQh6gWhYgUIg+gOIgZgeIgcgiIgUgZQgdgngHghIACgGQAOAAAyARIAHACQBEAOBtgBQBugBBjAYQByAcA6A0QBeBVBRCnQAvBgAEAGQAIAOAHALIAEAFIAHAZIAFATIAFAQIgHABIgqABQk/AJiUAIIg6ADQiBgDg+gkg");
	this.shape_3.setTransform(45.3,30.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,90,60.3);


(lib.Symbol17 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#8B654E").s().p("AWkcUIAAAAIgHpUIgBiOIrXALIA3LQIAAAHIh0AAIAyumIPKADIAAOjgADQcUIiUAAIgFAAIgEAAIgMAAIgHo4IgCifItcgGIAoLYIAAAFIhJAAIgyunIBHgCIAAgBIPdADIgBgSIAFAAIgFg7IGZAJIAcADIgEDYIlugVIgCAAIAAAeIAEABIAEA1IElAFIAOLMgA0QcUIAar3ID/ACIAcL1gA1AMPIE/APIAIC8Ij7ADIg5AAgA1LLaQgNg7gXhIIgVg9MAwIAAAIAAC2Iw8AFIAAAGIm9gDIAAgBIyOAFIAAAFgA2kG7IgRAAIgBgOQAAgVAEgHIAEgFIB6ABIAKsQIABAAIABhZIADkiIDsAJIAAAAIACAAIABBKIAAAJIAAAfICBgBIgDkvIEogCIAUgVIAngYIAYgOQAwgaA4gMIAggFIvCgEIgDAAIgFhAIApAAIELAAIgChMIgBgjIBjgFQBygFBOgCIACBGIABAgIAAAWIC0AAIgBgfIAAgRIAChZICZADICVADIABAuIAEA6IACAbICeABIgBgUIgDhPIAAgNIAFAAIE5gHIABBaIAAATIAAAKIDdAAIgCgMIgNhsQA2ACBkAAICAgBIgFBlIAAATIC7AAIAAgKIAAgBIgEhEIgCgsQBrAACsACQgDAsgBAjIAAAZIABARIDBABIgEhFIgBgiIgBgWICkADIB5ACIAAAUIAAAGIgBBeIBmAAIAABIIgDAAIotgCQAkAHAhAMQATAHASAJIAGADQAZANAXAQIAVAQIADADIAVASQAlAiAhAtIACAEIAXAiQAlA+ARBDQAFAUAEAVIBpgBIgIgnIgBgDIgDgJQgShEgng9QgLgRgOgRIgCgDQgkgugnggIgMgKIgDgDIEWgCIAAHGIkzAAIgBhwIgBgYIgBgHQgDgYgGgXQgNgxgdgtIgRgZIgCgCQgZghgdgZIgPgNQgagUgdgPIgFgCIgcgLIgYgIQgWgGgYgDIgJgBIgRgBIgRgBQgUgBgUACIgFAAIgUACIgRADIgLACQhvAahHBjIgJAOQgUAfgNAhIgGAUQgLAnAAAqIAAADIAAAKIAAAxIABBHIAAAeIplgDIAAAAIhBAAIABh+IgBgdIAAgBIAAgCIgEgeQgEgYgIgWIgIgUIgGgNQgNgbgTgaIgFgIQgRgVgSgTIgQgQIgSgPIAAAAIgPgLIgCgCIAAAAIgFgDIgDgCQgNgJgPgHQgdgPghgJIgWgGQgSgDgSgCIglgCIgLAAQgrAAgoAIQgsAKgnAVQgcAPgZAVIAAABQghAcgcAmQg6BRgEBcIAAAEIAAAWIAAAJIABB3ImBAJIABCBIAAAbIABA3IACBuIAKIuIB2ABIgPslIENACIACCtIAIJ3IKgAEIADisIABgyIADihIADjxIABgbIACiYIKpAEIABB0IAAAdIAEHJIACDJIKfAEIgBlCIAAgoIgCm4IEzADIAANkgAkGwXIAdAGQA7AQA0AhQABAAAAABQABAAAAAAQABAAAAABQAAAAABABIAGADIADACIAQAMIACACIAAAAIAWATIABABIAUASQAWAVAUAbIAGAKQAWAfASAhIAHAQQAEALAGAMQAMAkAGAmIADAUIAAACIABAeIBegBIAAgNIAAgDIgBgJIAAgCQgGgvgOgqIgJgWIgHgQQgRgfgVgdIgHgJQgTgagVgUIgTgSIgVgSIAAAAIgCgCIgCgBILkgEQAngiAtgWQAkgSApgKIAOgCIAGgCIy1gEIAPADgAssqHIACAAIABgHgA0ks3IgqgBIgEi9IABACIAAABIEZAGIgBCFIABAAIABA2gA1WyAIgFiqIgCABIACgEIACgEIABgBIgBgKQgDgnAAgqIAAgVIAAgHIABgOIgBAAIAAgWQgQgCgQAAQg1AAgaAFIgNADIAEAqIACAgIACAXQAFAGAHADIABAAQAFACAGAAQAKAAAHgFIADgBIAAgCIADgCIAAgBIgBgJIgDgmIgBgRIAogDIABARQABAsAEA2IABASQglAGgvAAQgpAAgcgFQgRgmAAhRQAAgvAGgqIAEgWIABgEIDVgIIBbgEQgBBCgGD/IAAASIgEAAIgBA9IguAFQgmAFgMAAIgEgBgAYl0gIgEAAQg0AAhAgDIg7gCIhLgEIgngCIgJgBIgBgcIgDhFIgGiEIByACIDPAEIgHDbIAAAQIgCAAgAiF0nIgigCIgCAAIAAgBQgNijgEg+IAdAAIDagFQA9gBAwAAIgFCuIgBA/IgKABIgNAAQg6ADgvAAQgzAAh2gHgAlE0mQhLgBhjgEIgYgBIhegFIgEgBIgCgbIgBgdIgBgSQgFhlgBgrIBxACIDPADIgHDhIgHAAgAxG0uIgBgKIgDhVIgEh9QApgDEQgFQgDAggGBcIgEBKIAAAIIgBANIgkACIgCAAIhQADIgkABIhfAEIgYAAgAFc04IgCAAIgCgWIAAgDIAAgDQgJh9AAgnIABgIIABgJIAGABQBCACB+ABIA5AAIA1AAQAAAlAFB2IAAAfIAAAOIgBAAIgDABIgcAAIhDACQh8AEguAAIghgCgAMv1BIgBgEIgCgVQgOiBAAgMQAAgMgEgUQCMgBCzgDIgNCuIgCAVIgLAAIiWAEIhtADIgNAAgA5/6KIgEiJMA0HAAbIAABug");
	this.shape.setTransform(793.2,419.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#AAA6A3").s().p("APOQ1IkfgHIjNgFIgBg0IBTADIGaAMIAEjhIAAgRIBTgCIAHJUIhkACgAnDVkIASkzInpAHIh9ACIAAhMIB2AAIH0gCIALi+IBLgCIAHI4gAE9gXIgCjJIgEnKIgBgdIAAh0IgBgXIBQAAIAAAYIABAvIABBKIAEE1IABA0IAAAZIACBQIACCTIIEgEIgCj1IAAgqIgDm3IgBgdIAAg7IAAgBIAAgGIAAgkImCAEIgBggIAAgfIAnABIFbALIAAgSQgBgfgGgeIgBgEIAAgCQgEgSgGgQQgOgpgYglQgNgTgNgQQgegjgjgWIgCgBIgQgJIgXgJIgJgDIgVgGQgXgFgYAAQAmglAxgWIAYAIIAcALIAFACQAcAPAaAUIAQANQAdAZAZAhIACACIARAZQAdAtANAxQAGAXADAYIABAHIABAYIABBwIAAAdIAAA3IAAAIIAAAdIACG5IAAAoIABFCgAwggfIgIp4IgCitIAAgKIAAgCIA3AAIAAAMIACB8IABAvIAJIqIAAAVIDhADIFUADIABh1IABg/IACiPIADkPIAAgdIAAgMIAChxIAAgRIAAgbIAAgIIABglInXABQABggAFgfIBDgBIGPgGIAAgGQAAgWgDgVIgGgdIgCgIIAAgBIgCgHIgBgDIgJgYQgOgigWggQgSgZgTgUIgGgGQgOgOgPgLIgBgBIgJgGIgSgMIgQgIIgCgBIgNgGQgdgLgfgFQA0gfA/gUQAPAHANAJIADACIAFADIAAAAIACACIAPALIAAAAIASAPIAQAQQASATARAVIAFAIQATAaANAbIAGANIAIAUQAIAWAEAYIAFAeIAAACIAAABIABAdIgBB+IgBAqIgBAeIAAASIgCCYIgBAbIgEDyIgDChIgBAyIgDCsg");
	this.shape_1.setTransform(830.8,462.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#716F6F").s().p("AxGVoIgnrXINdAFIACCgIhLABIACgeIADhDIq5gQIACEyIA9AAIAABMIg8ABIACEkgAHMVmIg2rQILXgLIABCOIhTACIABhIIorgCIAMEsIAtACIABA0IgsgBIALE1gAvhtHIgBhJIgBh3IAAgKIAAgWIAAgEQAEhcA6hRQAcgmAhgcIAAAAQAZgWAcgOQAngVAsgKQAngJAsAAIALAAIAlACQASACASAEIAWAFQAhAJAdAPQg/AVg0AeQgVgDgWAAQgQgBgPABIgcADIgFABIgTAEQg1ANgqAhQgWAQgSAVQgOAQgNATQgiAygMA2IAAAEQgHAiACAkIAAAWIB6gDQgEAfgBAhIh1ABIABAfIAAAnIAAAAgAF+tJIAAglIgBgfIAAgdIAAhIIgBgxIAAgKIAAgDQAAgpAMgnIAGgUQAMghAVggIAJgNQBHhkBvgZIALgDIARgCIAUgCIAFgBQATgBAVABIAQAAIASACIAIABQAZADAWAGQgxAVgmAlIgBAAQgSAAgQABIgPACIgFABQgPACgOAFIgSAHQg5AYgpA7IgNAUQgJAPgIAQQgUAqgHAvIAAADIgCATQgBAMABANIAAAGIAAAMICKAEIgBAfIACAgIiKABIACA3IAAADIABAog");
	this.shape_2.setTransform(823.6,461.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#675F4D").s().p("AuLU9IgdkoIHpgIIgSE0gAIlPUIgSi/IGxgVIgEDhgAvDMIIIUgcIgBAeIgLC/In1ACgAIAmsIgVj1IgEgvIgOiYIgBgOIgBgMIgCgQIgBgPIGsgRIAAABIAAA6IAAAdIADG4gAtMsxIgFhDIAAgIIGagUIgBAbIAAASIgBBxImPAFIgEhEgAs8wLQAEggAMglIABgFIABgDQAJgZAMgXQAPggAWgcQAzhDBKgjIAMAGIADABIAQAIIASAMIAIAGIABAAQAQAMAOANIAFAGQAUAUARAZQAXAgAOAiIAJAYIAAADIADAHIAAABIACAIIAGAdQADAVAAAWIgBAHImPAGIAJgQgAIjwWQgCgNAAgMQAAgWACgVIABgEQAFgmAOgjQANgiAVgeQAMgTAPgPQAiglAtgSIAXAKIAPAJIADABQAjAVAeAkQANAQAMATQAZAkAOApQAFARAEARIABACIABAFQAGAdABAfIAAASg");
	this.shape_3.setTransform(832.3,465.9);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#413B2D").s().p("AwPVFIgCkkIA8gBIB9gCIAdEogAIjPbIgtgCIgMksIIrACIgBBIIAAASImwAVIASC/gAwUKiIK5AQIgDBDIoUAcIATDDIh2AAIg9AAgALFkqQgJgDgHgHQgFgFgDgFQgDgIAAgKQgBgQAMgMQAEgDAEgCIjwgCIAAg0IgEk0IgChLIAAgvIAAgYIgBgoIAAgDIgCg3ICKgBIGBgDIABAjIAAAHImsAQIACAQIABAQIABAMIABAOIAPCYIADAvIAWD1IGDAKIAAApIjtgBIAGAFQAIAHACAJQACAFAAAHQAAARgMALQgLAMgRAAQgGAAgGgCgALFlgIgDACQgFAFAAAIQAAAHAEAFIABABIADACQAEADAHAAQAHAAAFgFQAGgGAAgHIAAgBQAAgHgGgFQgFgGgHAAQgHAAgEAEgAq2pqQgRgQAAgXQAAgXARgQIABgBIj6AGIAAgvIgCh8IAAgNIAAAAIAAgnIgBgfIB1gBIHXgCIgBAlIAAAIImaAUIAAAIIAFBDIAEBEIGPgFIAAALIAAAeIkBAFIADADQARAQAAAXQAAAXgRAQQgQAQgXAAQgYAAgQgQgAqeqtQgFACgEAEQgJAJAAANQAAAMAJAJQAJAJAMAAQAMAAAJgJQAJgJAAgMQgBgJgEgHIgEgGQgJgJgMAAQgGAAgGADgAuywFQgCgkAHgiIAAgEQAMg2AigyQANgTAOgQQASgVAWgQQAqghA1gNIATgEIAFgBIAcgDQAPgBAQABQAWAAAVADQAfAFAdAMQhKAjgzBDQgVAcgQAgQgMAXgIAZIgBADIgCAFQgMAlgDAfIgJAQIhEABIh6ADIAAgWgAJNwPIiKgEIAAgMIAAgGQgBgNABgMIACgTIAAgDQAHgvAUgqQAIgQAJgPIANgUQApg7A5gYIASgHQAOgFAPgCIAFgBIAPgCQAQgCASABIABAAQAYABAXAEIAVAGIAJADQgtASghAkQgPAQgNATQgVAegNAiQgOAjgFAlIAAAFQgDAVAAAWQAAAMADANg");
	this.shape_4.setTransform(824.3,465);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#4F3C3C").s().p("AJ+N7IgikzIEfAGIgFExgAtZo+IgBgMQgWisgLh2IAmgBQBcgDCTgIIBjgGIACAAIgBCPIgBA/IgBB1g");
	this.shape_5.setTransform(839.1,511.1);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#1B1918").s().p("AHwQAIgLk1IAsABIDMAFIAiEzgAu4m3IgBgWIgJopID6gGIgBABQgRAQAAAXQAAAXARAQQAQAQAYAAQAXAAAQgQQARgQAAgXQAAgXgRgQIgDgDIEBgFIgEEOIgCAAIhjAGQiTAIhcADIgmABQALB2AWCsIABAMgAG8pNIgBhPIgBgaIDwACQgEACgEADQgMAMABAQQAAAKADAIQADAFAFAFQAHAHAJADQAGACAGAAQARAAALgMQAMgLAAgRQAAgHgCgFQgCgJgIgHIgGgFIDtABIACD1IoEAFIgDiUg");
	this.shape_6.setTransform(826.2,497.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#6C4B36").s().p("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");
	this.shape_7.setTransform(793.4,426.1);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#A17458").s().p("AgBAOIAAgcIABAAIACAdg");
	this.shape_8.setTransform(814.6,521.5);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#433E3B").s().p("AKsC1IgCgCIgBgBQgFgFAAgHQAAgHAGgGIACgCQAFgDAGAAQAHgBAGAGQAFAFAAAHIAAABQAAAIgFAFQgGAGgHAAQgGAAgFgEgArAiEQgIgJAAgMQAAgNAIgIQAFgFAFgCQAFgCAGAAQAMAAAJAJIAEAFQAFAHAAAJQAAAMgJAJQgJAJgMAAQgMAAgJgJg");
	this.shape_9.setTransform(826.7,414.6);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#7B553E").s().p("AAAAtIAAhZIABAAIgBBZg");
	this.shape_10.setTransform(661,375.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_4
	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("rgba(238,189,113,0.502)").s().p("EBAGAGFQgOgMgKgNIgHgKQgCAKgEAIIgGAJQgNATgfAAIgGAAQg7gDglg0QgkgzANgxQglAqgPALQglAZg9AAQgjAAgcgJQgLgEgLgGQgrgXAAgrQAAgjAVgcIAKgNIABgBQAMgLAYgOIAAAAIgCgBQACgBADAAIAQgJIgJgDIgqgNQgdgMgNgUQgMANgVAPQgaATgcgSQhwhCCAgvQAnAHAWALQAEghATgdQAdguAtAAQAOAAAMAEIAAgBQAAgbARgdQAHgOALgPQAogzAxAAQAmAAASATQARAQAAAdIAAABIgCAOIACgDIANgVQAUggAZgVQArgkAwAAQA6AAAlAlQAIAIAGAIQARAXAAAZIgEAdIABAAQAdgYAKgHQALgHAMgFQAcgOAaAAQAtAAAfAiQAeAgAAAqQAAAegKAZQgHAOgEAEIgCAAIABABIABgBQAVABAQANQAcAXAAAzQAAANgDAMQgHAkgeAgQgkAmgQgIIAHAHQAHALAAAUQAAAZgIAZQgMAhgcAgQg4BAhUAAQgxAAglgdgEg9lAEiQg3gmAAgkQAAgHAFgKIgBgCQhAAQhMAAQhuAAhOgjQgSgIgPgKQg+goAAhCQAAg2AjgnQAjgoAvAAIATAAQgRgVAAgiQAAg9AfgmQAjgtBFAAQAoAAA2AYQAaAMARAMIANAJIAJAIQgHgHgDgUQACg/AmgoQAjglAwAAQAQAAAVAJQAPAHAJAGQAJAIADAEIABAFIACgCIABADIAIgGQAJgMALgLQAxgwA6AAIAKABQAuADAdAfQAeAgAAArQAAAbgGAOIAOgMQAfgUAqAAQA3AAAbAbQAbAbAAA4QAAAsgLAWIgJASQAXABAeAZQAkAfAAAmQAAAkgcAeQgdAegiACIgDAAQgJAAgdgJQAMAEAMALQAHAGAEAHQAIAMAAANQAAAagTAbQgbAngzAAIgHAAQgggCgkgOQgZgKgNgKIAAAKQAAAegVAdQgLAOgPANQg4AvhYAAQhVAAg/gqgEBFCAEnQgfhUBWgaQB+BDiFBAQgKAFgIAAQgUAAgKgagEgz8ACeQgWgBABgbQABgxAwgFQBnBSh+AAIgFAAgEhGvgAxQgbhNBOgYQCDA5iFBAQgLAFgJAAQgTAAgKgZg");
	this.shape_11.setTransform(458.3,38.8);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("rgba(238,189,113,0.651)").s().p("ABUChQgPgRgFgjQgMAcgUAVQggAhgrAAQgoAAgcgWQgagVAAgeQAAgfAPgZIAFgIIgPABQgYAAgMgIQgPgKAAgYQAAggAZgcQAKgLAMgHQgTAHglAAQglABAKgnQALgqAvgCQBAAxgbAUQAOgGAPAAQAOAAAVANQgYgRAAgbQAAggATgXQAWgbAjAAQAjAAAUAnIACAFQAUgVAeAAQAYAAARAQQASAQAAAXQAAAQgGAIQAVgGATgBQAnAAAeAYQAgAaAAAmQAAASgJAOQgDAFgFAEQAHABAFACQAVALAAAaQAAAqglAlQgpAmg4AAQhBAAgagegAkrgBQgUgXAYgZQAJgLANgBQBFARg7AsQgKAHgIAAQgKAAgIgIg");
	this.shape_12.setTransform(676.8,6.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("rgba(238,189,113,0.4)").s().p("ABQFIQgKgJgGgRQgKgYACgjIAAgBQgPAWgPASQgaAggdAAQgWABgZgeQgagfAAggQAAgLADgJQgLAHgOAIQgzAbg6AAQhUAAgyg3QgpgrAAgyQAAgoAjgYQAKgIALgEIgGgHQgNgSAAgfQAAg7ApgdQAegUAnAAQAeAAARAIIAFAEQgGgQAAgSQAAgoAcgbQAcgaAnAAQANABAMADIAMALIADgGQAIgLALgMQATgVAWgOQAugeBBAAQBCAAAnAnQAZAaAKAlQAggaAnAAQAxAAAiAaQAeAWAAAdIgBANQgDAMgIANIgBACIAMgJIANgHQAQgIAQAAQAeABAUARQAUARAAAcQAAAagQAbIgGALQgGAIgHAFQAJABAIAFQAIADAHAGQAaAUAAAkQAAAegeAtQgZAlgbANQgOAGgOgBQgJAAgGgDIgDgCIADAGIAAAXQAEAkgwAtQgRAQgRALQgeASgbAAQgfAAgIghIgCgHQgCgMAAgNQgDAHgIAJQgKALgQANQg0AqgvABQgUAAgNgMgAomAbQAGgyAwgHQCEA4iFAsQgPAFgLAAQghAAAGgwg");
	this.shape_13.setTransform(556.1,40.3);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("rgba(238,189,113,0.749)").s().p("AAED4QgPgQgHgXQgDgJgCgKIgBACQgHATgJAJQgUAJgWAGIgKAAQg7AAgfgtQgcgpAKg7IgCABIgoAhQgfAUgsAAQgnAAgZgTIgEgEQgTgQAAgXQAAgmAXgXQARgQAOgBIACgBIADgDIgBgJIgDgJQgGgQAAgYQAAhLAqgqQAugtBbAAQAQAAARACQAnAGAjAUQAZAPAQAPIAAACQAEgmAYgjIADgFQAigtA4AAQAcAAARAVQAPATAAAbIAAAMQgCAVgHANQAIgIAOgIIAKgFQAVgKAUAAQAoAAAZAcQAZAbAAAtIAAAGQANgKAIAAQAbAAAZAfQAZAfAAAgQAAAKgBAHQgDAPgHAKQgLASgSAAIgCAAQAGAJAAAQQAAAdgbAjQgfAogiAAQgUAAgIgJIgHgMIABAIQAAApgcAiQgIAJgIAHQgjAcg5AAQhFAAgigkg");
	this.shape_14.setTransform(303.8,3.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11}]}).wait(1));

	// Layer_2
	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#4C5678").s().p("EhBDAcGIgs7pICyACIApMKIEaAAICUxeQhEgWg3g5QhDhGgShcIi/AIIgKheIDDgHQAJh4BShXQAegeAhgVQAxgeA5gJIgDhPIh4gBIgLhTICSgFIgMmnIBCgcIAEHAICmgHIgHBmIh7gBIACBNQA8AKA0AhQAeAUAbAbQBKBNAOBnIBlgEIAABjIhlAEQgMBphMBOQhFBIhbASIgFJgIDRAhIgEnkICYgGIgZCwIBzANIDjGvIAGuOIBUADIgDjLIBGgBIAGj1IBlgFIAFlgIBngEIAEFfIBagEIgMEBIBCgBIgDDdIBMADIgvVgIBHADIA4q7IDagEIgWFWIB3AQMgAagjxIRvg0MgA8AhNIBzAFIAZnAICpANIhIuzICfgHIAXmVIBFAEIgaGOIC5gKIhHSEICCAdIAmmuIDfgJIgOrgIEDgUIgRIOIDgADIhS0oINaGKIgRCoIC4gEIgND9IBhAOIgMnVIDfAAIgmFKIIJAqIgTV6IEDAQIgLDMIDSgDIg0vNIBUAAIginIIBhAOIAAhqID7ASIgCB6IBfANIgZGLIBnAAIgsXJIBHANIANEhICWAbIgtqIIBUAGIgFrCICaAFIAACLIENA1IhDT+IDdEcg");
	this.shape_15.setTransform(376.7,524.9,1,1,0,0,0,-22.3,58.4);

	this.timeline.addTween(cjs.Tween.get(this.shape_15).wait(1));

	// Layer 1
	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.lf(["#1A7887","#C0C68C"],[0,1],2.9,-332.6,3.6,332.6).s().p("EhLxAvBMAAAheBMCXjAAAMAAABeBg");
	this.shape_16.setTransform(478.5,300.9);

	this.timeline.addTween(cjs.Tween.get(this.shape_16).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol17, new cjs.Rectangle(-21.7,-25.1,985.3,671.4), null);


(lib.estrella = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgSAnIg1gdIAugVIAMhAIAcAxIAsgQIgOAqIAbAuIg7gSIgYAwg");
	this.shape.setTransform(7.2,7.6);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.estrella, new cjs.Rectangle(0,0,14.4,15.2), null);


(lib.Symbol40 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Tween44("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(61.1,44.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regY:0.1,scaleX:0.67,scaleY:0.67,x:89.5,y:42.4,alpha:0},4).to({_off:true},1).wait(2));

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#8199FB").s().p("EhA2AAVQjtgFiigBIgNAAIhggCQisgIADgCQgEgIBlABQAPgDApABQFGgMLqgBQKugGKEAJQZ5AHEBADIAMAAQLNgHcrAEILUAAIAdAAIBOAAQANgBAVAAIBgAAICEABQHigFQXAIQgCAFACACQAAAAgBAAQAAAAAAAAQAAAAAAABQABAAAAAAQhrABiEAAQhugChfACIg5AAIgrAAIiegBIi+gCI46ADQt/AClnADUgL/AAKg80AAEQlSgDjxACg");
	this.shape.setTransform(551.8,42.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F3C42A").s().p("EgvlAAUQhJgChGABIhugBIuXgUQDxgDFSAEUA80gAEAL/gAKQFngEN/gCIY6gDIC+ACICfABIh7ADIgGAAIgqAAIgIABIgJAAQhqAAhmADIjMACIiLABQheAAhaACQh9gBh9ACIi8ABQhggChaACQiDgBh/ACIjEAAIkpgBIklgEQgRgCgJACIoPADIgbAAIkLACQgdAAgWACQgZgBgWABQgSAAgNABQsIALsTAKQpCAHpGAAQnlAAnogFg");
	this.shape_1.setTransform(558.5,45.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#C7D0CD").s().p("EB15AAoIgKAAIgEAAQgpgDgPAAQgUgCASgBQAQgHAqADIBOABQAFgFgZgBIgFgBQAFgBAIABIABAAIAyAAIAAABQgcABACADQAAAAAAAAQAAAAAAABQAAAAABAAQABABABAAIB0ACIAAAAQATgEAjACQAHgBAMABICOgBQBXgCAYACQAzgECAAGQAAAAAAABQgBAAAAABQAAABABAAQAAABAAABQAAAAAAAAQAAAAAAAAQAAABAAAAQAAAAABABIgfABIgxAAQgEgDgDACIgWgCIh3ACIgPAAIgDAAIgWAAQgFgBgEABQhVgBgdACIhQABIjngBgEBN2AAfIiSgDQgsgDApgBQArgEBjABQBggCBgACQEIABAtACIABAAQAvgCBTABQgJgCgGACIgZgBQAjgBBDACQB3gCCwABIDwAAQBWgBC4ACIAYAAIgDAAQAngBAwADIAAAIQgbgCgjACQhCgCgzACIgvgEQhJAAkiACQi3gChGAEQg6ACiFAAQjHAAlwgEgEB50AAeQAAAAAAgBQAAAAAAAAQAAAAAAgBQAAAAABAAQgBgDgXAAIgKgBIAmAAQAPgBASABQgVAAgCADQgBAAAAABQAAAAAAAAQAAABAAAAQABABABAAQgKgBgGABgEAisAAeQi7gCiFABQiGgCACgCQgCgECHAAQCEgDC7ACIAbAAQCvgDB3ADQB1ABABADIh2ADIknADIgaAAgAWDAVQAfgCAkABQCyABAcADQAcAAiOAEQhJgChWAEQgBgIABgBgAijAeIgNAAQi1gCjaABIh7gBQvkgR+kAHIgKAAQr3ADqSgUQmsgRqhgGQrWgMpjAOQkLACihAKQhMgEg2gBQivgHACgCQgCgLCfACQFHgNLoAGQEFADD/AAQGeACGRAJQZ6AYEAACIALAAQLOAActANIRDADQC5gBEVADQjYAGjUADIhDABIgOAAgEBt7AAZIi1gDQCSAABXABIA1AAQBHgBCAABQAfAAAfABIhXABIifABIh4gBgEBozAAWIgDAAIgVAAQAOgBARABIgHAAg");
	this.shape_2.setTransform(893.5,38.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F8F9F8").s().p("EiATAASQgngCgiAAIhjgIQgGgJChAAQAwgEBCAAIANAAQChACDuAEIOWAVIlUADQrkgClbgFgEgqRgACIELgCIgaABIkjADQAVgCAdAAgEA1JgAKQiMgBhiAAIgtABQgXgEgRADIgLAAIkwgBIiQgCIgogDIAAAAIAlAAIAEAAQGVABIRgEQAMgBAOACIAFAAQAJgBAJAAIA6ABQCSgBCJADQAIgBAJABQCbAHDugDQBpABCBgIQDmgCCZABIF6AFQCnACGpgBQGOAABjgDICDgCIACAAID6ADID/ABIgBAAIg1ACIgJAAIgYgBQgkAAgkABIgxAAQgqgCgsgBQghgBg+ABIkBADIgcAAIgPAAIgbAAQgIgBgGABIgQAAQhBAAg9ABQhuAAiYABQgXgCgVACQgZgBgUABQiqgBh+ACIlAgBQhXgCh4ACIgCAAQifgBkyADIgCAAQkQABlIAAIowgBgAbkgNIiFgEQgBgBAYAAIAUAAQHTgBF+ACQgDAChzABQh3ACiwgBQgQAAgKABIlAgBgAI+gNIgNAAIAqgBIAGAAIB7gDIArAAIA5AAQBegCBvACQCDABBrgCQAAAAAAAAQAAAAAAAAQAAAAAAAAQAAgBAAAAQBIgBBLABIBcAAIAhABQAcABiNADImOABInOAAgEB6JgARIgBAAIh3gBIjmABIAAAAQg9gBhLACIgoAAIgEAAIgKAAIhxgBQAugCAzAAIBbgDQABAAAAAAQAAAAAAAAQABAAAAAAQABAAAAAAIAoAAIACAAIACAAIAKAAQD5ABA+gBQAdgCBVABQAEgBAFABIAWAAIADAAIAPAAQAWAAAXACIAZAAQAigCAsABIAxAAIAfgBIAKgBIAPABIAEAAIAEAAIAaABIALAAIAGAAIADAAIADAAIAAAAIBHAAQASgDAcABQAcgBAUACQAPAAAGABQABAAAAAAQABAAAAAAQAAAAAAAAQABABAAAAIACABQgCgBgPACQhAAChOABQgwgBgyAAQgpgBgUABIhqACIiPgCg");
	this.shape_3.setTransform(907.1,44.9);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#000000").s().p("Eh7YAAgQntgLAGgEQAAAAAAAAQgBAAAAAAQAAAAAAAAQAAAAAAAAQgDgEALABQASgFBNAAQAiAAAnACQFbAFLkACIFUgDIBuABQBHgBBIACQQyAKQjgMQMTgKMJgLQAOgBARAAQAXgBAZABIEjgDIAagBIAcAAIIOgDQAJgCARACIElAEQiUACiQgBQkmAAopAIQtCAHtTANQyqAQzEAAQohAAongDgEAo6gARQoEgCqlABQmvgDl+AEIgGAAIkLAAQBmgDBqAAIAJAAIAIAAIANAAIHOAAIGOgBQCNgDgcgBIghgBQBEgBBIACQgYAAABABICFAEIFAABQAKgBAQAAQCwABB3gCQBzgBADgCQAaABAegBIAoADICQACIEwABIALAAQARgDAXAEQkSgCjhACgEBumgAXIABAAIABAAIAHAAQAggBAoAAIAEAAIAEAAIBxABIgQAAQh7AAh0ACIA1gCgEBqpgAWIAAABQifgChcABIgBAAIiEABIgIAAIEBgDQA+gBAhABQAsABAqACIgugBgEA5QgAaIg6gBQA5gDA8ADIADAAQBqgDBJABQAPABAbAEQiJgDiSABgEBIngAeQASgDAZABQAugBA3ACQAOgDAXADQBNgBBFAEQiZgBjmACQAZgCAfgBgEB77gAcQgXgCgWAAIB3gCIAWACQADgCAEADQgsgBgiACIgZAAgECCpgAeQgUgCgcABQgcgBgSADIhHAAIAAAAIgDAAICEgEIADAAIAHgBIAKABQAZgCALAEQAAAAABAAQABAAAAAAQABAAAAABQABAAAAAAQAAAAAAAAQgBAAAAAAQgBAAAAABQAAAAgBAAQgGgBgPAAgEB+xgAgIALABIgKABQgBgBAAAAQAAAAAAgBQAAAAAAAAQAAAAAAAAg");
	this.shape_4.setTransform(906.8,45.6);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E77F7D").s().p("EA97AAiQgJgBgIABQgbgEgPgBQhJgBhqADIgDAAQg8gDg5ADQgJAAgJABIgFAAQgOgCgMABQoRAEmVgBIgEAAIglAAIAAAAQgeABgagBQl+gCnTABIgUAAQhIgChEABIhcAAQhLgBhIABQgCgDACgFQwXgIngAGIiFgBQARgCAVABIgBgBIAkAAIANAAIAOAAIBDgBQDVgDDXgGQDYgBDYAAQCJgCCPACQFRgEFXADQJAgCHAACIAEAAQB7gBCSABQAXgDAYADQACgBANAAIASAAQESgCFHAAQF0gBC6ABICDACQCegEDtABQCdAAC/ADIF6AEQAHAAAHABIANAAIADAAIABAAIAKAAIAZABQAGgCAJACQhTgBgvACIgBAAQgtgCkIgBQhggChgACQhjgBgrAEQgpABAsADICSADQJlAGCRgEQBGgEC3ACQEigCBJAAIAvAEQAzgCBCACQAjgCAbACIAAgIQgwgDgnABIADAAIAFAAIANAAQADgBAEABQAWgBAZABQASgBATAAIBAAAIAJAAIADAAIAVAAIADAAIAHAAICMAAIC1ADQCDACCUgCIBXgBIAxgBQA0gBASABQAnAAAUABIABAAIADAAIABAAIAFABQAZABgFAFIhOgBQgqgDgQAHQgSABAUACQAPAAApADIgoAAQAAAAgBAAQAAAAgBAAQAAAAAAAAQgBAAAAAAIhbADQgzAAguACIgEAAIgEAAQgoAAggABIgHAAIgBAAIj/gBIj6gDIgCAAIiDACQhjADmOAAQmpABingCIl6gFQhFgEhNABQgXgDgOADQg3gCguABQgZgBgSADQgfABgZACQiBAIhpgBIiBABQiZAAhvgFgEAgmAATIAaAAIEngDIB2gDQgBgDh1gBQh3gDivADIgbAAQi7gCiEADQiHAAACAEQgCACCGACIBGAAID6ABgAT9AKQgBABABAIQBWgEBJACQCOgEgcAAQgcgDiygBIgeAAIglABgEB/9AAdIgGAAIgLAAIgagBIgEAAIgEAAIgPgBIgLgBQAAgBAAgBQgBAAAAgBQAAgBABAAQAAgBAAAAQiAgGgzAEQgYgChXACIiOABIgCgBQgBAAgBgBQAAAAAAgBQAAAAAAAAQAAgBABAAQACgDAVAAQADgCAGACQBmgDA+ABIAsAAIBqAAQCFAAArACIABAAIBbgBIAzAAQAYAAAMACQAFAAAAACIAAABIgCAAQgBAAAAAAQgBAAAAAAQgBAAAAABQAAAAAAABQgOADgWACIgIAAIgHABIgDAAIiEAEIgDAAgEiC+AAKQgBgGAJAAQAjgPEGgIQChgKELgCQJjgOLWAMQKhAGGsASQKSATL3gDIAKAAQekgHPkARIB7ABIBZAEIrUgBQ8qgErPAIIgMAAQkBgD55gIQqDgJquAHQrqAAlHAMQgpAAgPADQhqgLAFgGgEB23AAWIh0gCQgBAAgBAAQAAgBgBAAQAAgBAAAAQAAAAAAAAQgCgDAcgBIAAgBIADAAIAEAAIACAAQAUgBAfAAIAFAAQAYAAAVABIAFAAIAKABQAXAAABADQgBAAAAABQAAAAAAAAQAAAAAAAAQAAABAAAAQAAAAgBAAQAAAAAAAAQAAAAAAAAQAAABAAAAQgjgCgTAEg");
	this.shape_5.setTransform(906.9,39.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#B5B5B5").s().p("EBtWAAEIgGAAQl1gDnBABI22ABIgGAAIsagBIkYABIk4gCIDLgCIICgEIARAAIETgBIArAAQYUAFGbgEIMagCIBCAAIH/ACIByACIC6ABQEMgDFZAAQCvABDcgBID2AAIAAgBIK4ADIAFAAQFfABEYgDQCpgCD9AAQD7AADGABQCIABA3ACIAcABQAWACilABQuuAKy1gFQlEgCi0ABQl6AEm3AAQnxAApAgFgEh/VAAEImAgCIh0AAIgQAAIgQAAQj8AAjFgBIjLgBQg8gCAGgBIAxAAIAFAAQJQAANRgDIBbAAIBfABIIEABIAgABQEuAJHigEQDgAAEYgHIKAgDIEIABIPfAHQHiABUvAAQWVABGFgDQDhgCE3AAIAFAAQGLAALIADIgFAAQJaAEKigCIgsABQktAEnigBQkSAAllgGQiJAAkcAAI1DAEIgZABIhTAAIgJAAInbABIuXAAIiVAAIiUAAIuYAAIuCgCIoZgBIgGAAIxNACIgGAAIuHACQpyAAqxgDgEi2IAAAIgbAAIA3AAIAGAAICegDIA3AAIDLAAID2gBIAAgCICfAAIBiABIAnABQAhACifACQifABkBAAIh7AAIlHgBg");
	this.shape_6.setTransform(1700.8,39);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#9F5555").s().p("Eij6AAZImmgCIkigHIgRAAIk+AAIipABIgbABIgtAAQt3AJrkgLIh9gBIkHgGIC6ABQZQAGGmgEIMagCITzgCQgqABDSACIDAACIieACIgGAAIg3ABIlGAHIoAACIiRABIiMgBgEhLqAAMIggAAQgygCgbgCIlOABIAFgBIjNACIhbAAQtRADpQgBIgFAAIgxAAIhNAAIwhgBIi2gBIhiAAIifAAIAAgIQvwgGmVAEIi1AAIBogCIAmgBIBCgBQFJgGFngEIFQAAILPAAIUBADIAGAAIF/gBIBHAAIAXAAIAaAAIPKgDQKigCFkACIEHACQJLgMRMAJIPxAHIAoAAIAqAAIA3AAIAxABIAsAAIlvACIgFAAIsxgDQjsgBjrABQjsABhjADQhcABBiADQBoABDsABQZQAFGlgEIMcgCQPvAAEBgBQgoABDSABQDFACD8gBID2AAIAAgJIk5gCIAbgBIDzgBICUAAIFhgBIAuAAIAMAAQIIAAOuAHQKBADL/gGIELgDIDSgBIERgBIGWgBQDsABBtACIA3ACQCkAEgrAFQjsgBjmABQjsAAhiACQhdACBiACQBoACDsABIAcABIkTABIgRAAIoCADIjLADIlIAAIgRABIgWAAIl6ABQqiACpagFIAFABQrIgFmLAAIgFAAQk4AAjhACQmFAE2VAAQ0uAAnigDIvfgHIkIAAIhdgCIhXgBIjrAAIhkABIh9AEQkYAIjgAAIkFABQkzAAjYgHgEh+lgAKQiaABAAACQAAADCaABIF/ABIAhAAIF6gBQCfgBAAgDQAAgCifgBQiZgBjhAAIghAAQjgAAifABgEiHEgACICqgCQCfgBghgDQgbgCjGgBIhHgBgEC04AAHIAAgGQvwgGmVADIsrABIvUABIgRAAQgWgCAQgCQAXgFCJgDIBBgBQQngRGmAIIMrACQRHACFqAGIAFAAIMwgGQDsgCDrACQDsACBjAEQA3ADgLAEIgWACIgbABQhpAEjrACIhAABIhlAAQsTAGnhAAQmdAAi7gEgEjasAAAQALgDBMgCICEgEQDFgDD8AAQD8ABCqAEQEYAHFegDIAFAAQQ9gMKnALIAvABICHADIofAAQxIAAlqADIgFAAIswgDQjrAAjsAAQjrABhkACIgQABQgmgCALgCgEB7SAACIragCQgKgBAAgBQAAgFCegDIAdAAIAfgBQCJgCC2AAIAgAAQCfAACEACIAYAAIBFABQCZADAAAFIgGACIgKAAIlZACg");
	this.shape_7.setTransform(1469.2,37.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#909693").s().p("EjBsAAMIi6gBIh5gBIgggBQhYgCBCgBIAQgBQBjgCDsgBQDrgBDsABIMwADIAFAAQFpgDRIgBIIfAAIA8AAIAbAAIC1AAQGVgDPxAGIAAAIIAAABIj3ABIjLAAIg2AAIjAgBQjTgCAqgBIzyACIsbACQiyABmFAAQoXAAuogDgEB7YAALIgsAAIgcAAQjrgBhogCQhjgCBdgCQBjgCDrgBQDngBDrABQAsgEilgEIg2gCIBtAAIAFAAIFKAAIgcABQifADAAAFQAAAAALACILZACIAFAAIFZgCICEAAIPVgCIMrAAQGVgDPwAGIAAAGIAAADIAAAAIj2ABQjcAAiwgBIg2AAQjSgCApgBIqyAEIn/gCIhCAAIsaABQi5ACmhAAQn9AAtXgDgA7RADQjtgBhngCQhjgCBdgBQBjgDDrgBQDsgBDrABIMxADIAFAAIFwgCIgtAAIgwgBIEQABIOOgCIMrgBQE4gCKnADICHAAIgaABIE5ACIAAAJIj3AAQj8ABjFgCQjSgCApgBQkBACvxAAIsbACQi8ABmlAAQoSAAuBgCgEhlqAAAImAgBQiZgBAAgDQAAgCCZgBQCfgBDhAAIAgAAQDhAACaABQCeABAAACQAAADieABIl7ABIggAAgEi2vgAFQipgEj9gBQj8AAjFADIiDAEIgmgBQhjgDBdgCQBjgCDsgBIHXAAIMwADIAFAAQFpgDRIAAIMrgBQD3gCHUADQlmAElJAGIhDABIlsAAIgugBQqngLw9AMIgFAAIjMAAQjnAAjEgEg");
	this.shape_8.setTransform(1348,37.2);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#C7D0CD").s().p("ECB+AAHIAGgBQAAgFiZgCIhFgBID/gBIDcAAQiJADgXADQgQACAWACIhpAAgEiGAgADIBHAAQDGACAbABQAhADifABIiqABgEA/TAACQuugFoIAAIgMAAIgugBIBUAAQROgEJKAFIEHgBQFkgBKiABICCABIkLADQnzADm9AAInQgBg");
	this.shape_9.setTransform(1462.4,36.5);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#000000").s().p("EjYdAADQilgCAWgBIAbgBIAWAAQBoABDsABIBNAAIB9ABQLkALN3gJIAtgBICkgBIAgAAIE+gBIARABIEiAGQiVABiNgCQi1gBlDACQmeACl/AAQrcAApqgHgEA4gAAHIgFAAIxOgCIgFAAIoZABIlMABIAZgBIVEgEQEcgBCJABQFlAGESAAQHiABEtgEIAsgBIF6gBIAWAAIARAAIFIgBIE4ADIhtABQqyACpyAAIuHgBgEiSXAABIAbABQDFABD9AAQEBAACfgCQCfgBghgCIgngBIC2AAQgyABAAABQAAABCaABQCfACDgAAIAhAAQDhAACZgCQCfgBAAgBIAAAAIBNAAQgGABA8ABIDLACQDFABD8AAIAQAAIAQAAIqsABIgFAAI23gBQnBgBl0ADIgGAAIl9ACIFGgHgECeYgABIhygCIKxgEQgoABDSACIA2ABQlZAAkMADIi6gBgEC/1gABIgFAAIq4gDIAAgDQGWAIW2gJIBlgBIBKABQDsABBjACQBSAChCACQg3gCiIgBQjGgBj7AAQj9AAipACQi7ACjaAAIjiAAgEhUOgADIhfgBIDNgBIgFAAIFOgBQAbADAyABIoEgBgEg1lgAIIBkAAIDrAAIBXAAIBdACIqAADIB9gFg");
	this.shape_10.setTransform(1469.2,38.8);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F8F9F8").s().p("AxsAEICpgBIggABIikABIAbgBgEAsnAAEQjgAAifgBQiagBAAgCQAAAAAygBIQhABIAAAAQAAACifABQiZABjhAAIghAAgEg0tAAAIgWAAQhCgCBSgBIAngBIB5ABIEHAFIhNABQjsgBhogCg");
	this.shape_11.setTransform(411.8,38.7);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("rgba(114,114,114,0.8)").s().p("EgkSAAZImngCQiVAAiNgBQi0gBlDABQnxADnFgBQD4gjBNAAIAFAAQFpgDRIAAQC0AAEDANII9gEQpaAegfAAIAAAAgAK7gEQDIgHEFAAIAGAAIGAgBIBHAAIAWAAIAbAAIPKgDQKigCFkACICpABIKKgKQ1QAvscgCIl/gCIh0AAIqsABIgFAAQkAAAsQAEg");
	this.shape_12.setTransform(652.4,37.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6}]},2).to({state:[{t:this.shape_12}]},2).to({state:[]},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-10.5,-4.9,1756,98);


(lib.Symbol39 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Symbol36();
	this.instance.parent = this;
	this.instance.setTransform(45,66,1,1,0,0,0,45,66);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol39, new cjs.Rectangle(0,0,90.1,132.1), null);


(lib.Symbol38 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Symbol35();
	this.instance.parent = this;
	this.instance.setTransform(45,60.6,1,1,0,0,0,45,60.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol38, new cjs.Rectangle(0,0,89.9,121.3), null);


(lib.Symbol37 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Symbol34();
	this.instance.parent = this;
	this.instance.setTransform(41.2,65.3,1,1,0,0,0,41.2,65.3);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol37, new cjs.Rectangle(0,0,82.6,130.8), null);


(lib.Symbol30 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Symbol31();
	this.instance.parent = this;
	this.instance.setTransform(2.4,0);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(7));

	// Layer_2
	this.instance_1 = new lib.Symbol32();
	this.instance_1.parent = this;
	this.instance_1.setTransform(0,1.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({scaleX:1.1,skewY:1.4,x:-4.8,y:0.5},4).to({scaleX:1.03,skewY:0.3,x:-1.7,y:1.4},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,107.3,124.8);


(lib.Symbol27 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Symbol28();
	this.instance.parent = this;
	this.instance.setTransform(9.5,0);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(7));

	// Layer_2
	this.instance_1 = new lib.Symbol29();
	this.instance_1.parent = this;
	this.instance_1.setTransform(0,12.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({scaleX:1.22,scaleY:0.83,x:-6.4,y:16.1},4).to({scaleX:1.07,scaleY:0.94,x:-2.1,y:13.9},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,141.1,80.7);


(lib.Symbol24 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.instance = new lib.Tween3("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(49.7,39.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleY:1,skewX:-8.3,skewY:-3.2,x:47,y:42.6},3).to({regY:0.1,scaleY:1,skewX:-2.8,skewY:-1,x:48.8,y:40.7},2).wait(1));

	// Layer_1
	this.hero = new lib.Symbol25();
	this.hero.name = "hero";
	this.hero.parent = this;
	this.hero.setTransform(25.2,0);

	this.timeline.addTween(cjs.Tween.get(this.hero).wait(6));

	// Layer_3
	this.instance_1 = new lib.Tween4("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(48.8,25.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({scaleY:1,skewX:-8.3,skewY:-3.2,x:44,y:28.8},3).to({regX:0.1,regY:0.1,scaleY:1,skewX:-2.8,skewY:-1,x:47.3,y:26.9},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,164.1,89.1);


(lib.Symbol22 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Symbol26();
	this.instance.parent = this;
	this.instance.setTransform(15.3,2,1,1,0,0,0,59.2,37.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(6));

	// Layer_2
	this.kp = new lib.Symbol23();
	this.kp.name = "kp";
	this.kp.parent = this;
	this.kp.setTransform(-74.4,-39.6);

	this.timeline.addTween(cjs.Tween.get(this.kp).to({scaleY:1.01,skewX:-12.7,skewY:-5.5,x:-87.3,y:-29.9},3).to({scaleY:1,skewX:-4.1,skewY:-1.8,x:-78.7,y:-36.4},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-74.4,-39.6,149,79.3);


(lib.Symbol18 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#50566C").s().p("AxGVoIgnrXINdAFIACCgIhLABIACgeIADhDIq5gQIACEyIA9AAIAABMIg8ABIACEkgAHMVmIg2rQILXgLIABCOIhTACIABhIIorgCIAMEsIAtACIABA0IgsgBIALE1gAvhtHIgBhJIgBh3IAAgKIAAgWIAAgEQAEhcA6hRQAcgmAhgcIAAAAQAZgWAcgOQAngVAsgKQAngJAsAAIALAAIAlACQASACASAEIAWAFQAhAJAdAPQg/AVg0AeQgVgDgWAAQgQgBgPABIgcADIgFABIgTAEQg1ANgqAhQgWAQgSAVQgOAQgNATQgiAygMA2IAAAEQgHAiACAkIAAAWIB6gDQgEAfgBAhIh1ABIABAfIAAAnIAAAAgAF+tJIAAglIgBgfIAAgdIAAhIIgBgxIAAgKIAAgDQAAgpAMgnIAGgUQAMghAVggIAJgNQBHhkBvgZIALgDIARgCIAUgCIAFgBQATgBAVABIAQAAIASACIAIABQAZADAWAGQgxAVgmAlIgBAAQgSAAgQABIgPACIgFABQgPACgOAFIgSAHQg5AYgpA7IgNAUQgJAPgIAQQgUAqgHAvIAAADIgCATQgBAMABANIAAAGIAAAMICKAEIgBAfIACAgIiKABIACA3IAAADIABAog");
	this.shape.setTransform(823.6,461.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#626983").s().p("APOQ1InsgMIgBg0IBTADIGaAMIAEjhIAAgRIBTgCIAHJUIhkACgAnDVkIASkzInpAHIh9ACIAAhMIB2AAIH0gCIALi+IBLgCIAHI4gAE9gXIgCjJIgEnKIgBgdIAAh0IgBgXIBQAAIAAAYIABAvIABBKIAEE1IABA0IAAAZIACBQIACCTIIEgEIgCj1IAAgqIgDm3IgBgdIAAg7IAAgBIAAgGIAAgkImCAEIgBggIAAgfIAnABIFbALIAAgSQgBgfgGgeIgBgEIAAgCQgEgSgGgQQgOgpgYglQgNgTgNgQQgegjgjgWIgCgBIgQgJIgXgJIgJgDIgVgGQgXgFgYAAQAmglAxgWIAYAIIAcALIAFACQAcAPAaAUIAQANQAdAZAZAhIACACIARAZQAdAtANAxQAGAXADAYIABAHIABAYIABBwIAAAdIAAA3IAAAIIAAAdIACG5IAAAoIABFCgAwggfIgIp4IgCitIAAgKIAAgCIA3AAIAAAMIACB8IABAvIAJIqIAAAVII1AGIABh1IABg/IACiPIADkPIAAgdIAAgMIAChxIAAgRIAAgbIAAgIIABglInXABQABggAFgfIBDgBIGPgGIAAgGQAAgWgDgVIgGgdIgCgIIAAgBIgCgHIgBgDIgJgYQgOgigWggQgSgZgTgUIgGgGQgOgOgPgLIgBgBIgJgGIgSgMIgQgIIgCgBIgNgGQgdgLgfgFQA0gfA/gUQAPAHANAJIADACIAFADIAAAAIACACIAPALIAAAAIASAPIAQAQQASATARAVIAFAIQATAaANAbIAGANIAIAUQAIAWAEAYIAFAeIAAACIAAABIABAdIgBB+IgBAqIgBAeIAAASIgCCYIgBAbIgEDyIgDChIgBAyIgDCsg");
	this.shape_1.setTransform(830.8,462.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#21293A").s().p("AuLU9IgdkoIHpgIIgSE0gAIlPUIgSi/IGxgVIgEDhgAvDMIIIUgcIgBAeIgLC/In1ACgAIAmsIgVj1IgEgvIgOiYIgBgOIgBgMIgCgQIgBgPIGsgRIAAABIAAA6IAAAdIADG4gAtMsxIgFhDIAAgIIGagUIgBAbIAAASIgBBxImPAFIgEhEgAs8wLQAEggAMglIABgFIABgDQAJgZAMgXQAPggAWgcQAzhDBKgjIAMAGIADABIAQAIIASAMIAIAGIABAAQAQAMAOANIAFAGQAUAUARAZQAXAgAOAiIAJAYIAAADIADAHIAAABIACAIIAGAdQADAVAAAWIgBAHImPAGIAJgQgAIjwWQgCgNAAgMQAAgWACgVIABgEQAFgmAOgjQANgiAVgeQAMgTAPgPQAiglAtgSIAXAKIAPAJIADABQAjAVAeAkQANAQAMATQAZAkAOApQAFARAEARIABACIABAFQAGAdABAfIAAASg");
	this.shape_2.setTransform(832.3,465.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#090B0F").s().p("AIDVBIgLk2IAsABIHrAMIgFExgAwPVCIgCkkIA8gBIB9gCIAdEpgAIjPYIgtgBIgMktIIrADIgBBIIAAARImwAWIASC/gAwUKgIK5APIgDBDIoUAdIATDCIh2AAIg9ABgAulh3IgBgVIgJoqIAAgvIgCh8IAAgMIAAgBIAAgmIgBggIB1gBIHXgBIgBAlIAAAIImaATIAAAIIAFBEIAEBDIGPgFIAAALIAAAeIgEEPIgCCPIAAA/IgBB1gAHPkMIgBhQIgBgZIAAg0IgEk1IgChKIAAgvIAAgZIgBgnIAAgDIgCg3ICKgCIGBgDIABAkIAAAGImsARIACAPIABAQIABAMIABAOIAPCZIADAvIAWD0IGDAKIAAAqIACD1IoEAEIgDiTgALFljIgDACQgFAGAAAHQAAAHAEAFIABABIADACQAEAEAHAAQAHAAAFgGQAGgFAAgIIAAgBQAAgHgGgFQgFgFgHAAQgHAAgEADgAuywHQgCgkAHgjIAAgDQAMg3AigyQANgSAOgQQASgWAWgQQAqghA1gMIATgEIAFgBIAcgDQAPgBAQAAQAWAAAVAEQAfAFAdALQhKAkgzBDQgVAcgQAfQgMAXgIAZIgBADIgCAGQgMAlgDAfIgJAQIhEABIh6ACIAAgVgAJNwRIiKgEIAAgMIAAgGQgBgNABgNIACgSIAAgEQAHgvAUgqQAIgPAJgPIANgVQApg6A5gZIASgHQAOgEAPgDIAFgBIAPgCQAQgBASABIABAAQAYAAAXAFIAVAGIAJADQgtASghAkQgPAPgNATQgVAfgNAhQgOAjgFAmIAAAFQgDAVAAAWQAAAMADAMg");
	this.shape_3.setTransform(824.3,465.3);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#444C6A").s().p("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");
	this.shape_4.setTransform(793.2,419.2);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#1D212E").s().p("AIMbPIgNrLIkmgGIgDg1IgDgeIFuAUIAFjYIgcgDImagJIAFA7IgFAAIABASIvdgCIAAAAIhHACIAzOnIh9AAIgcr0Ij/gDIAChAID7gDIgHi8IlAgPIgEgyIgGAAIgBgDIFJAIIgBgGISOgFIAAACIG+ACIAAgGIQ7gEIAACgIvKgDIgyOmgA2GHVIgLgiIgPgsIgGgQMAwoAAlIAAA5gAwnFKIgLovIgChtIAAg3IgBgbIgBiCIGBgJIABBKIAAADIAAAJIkNgCIAQMlgAVPnLIAAgdIAAgIIAAg3IAAgcIEzAAIAAB7gAADnUIABgSIAAgeIABgqIBBAAIAAAAIJlADIAAAfIABAlIAAAYgAw4rnIAAgIIgBhKIgCgBIAAABIjsgKIABg5IDtAGIgBg2IAAAAIABiFIkZgGIAAgBIgCgCIglgqIPCAEIggAFQg3AMgxAbIgYANIgnAYIgUAVIkoACIADEvIiBACgABMrnIAAgDIgDgUQgGgmgMgjQgGgNgEgLIgHgQQgSghgVgeIgHgLQgUgbgWgVIgUgSIgBgBIgVgSIgBgBIgCgBIgQgNIgDgCIgGgDQAAgBgBAAQAAAAgBgBQAAAAgBAAQAAAAgBgBQgzghg8gPIgcgHIgQgDIS1AEIgGACIgOADQgoAJglASQgtAWgmAiIrkAFIABABIACABIAAABIAVARIAUATQAVATASAaIAHAJQAVAdARAgIAHAPIAJAWQAOArAGAuIAAACIABAJIAAADIAAAOIhdAAIgCgdgAW0r8QgQhDgmg+IgWgiIgDgDQghguglgiIgVgSIgDgDIgVgQQgXgQgZgMIgFgEQgTgIgSgHQgigNgkgHIItADIAAAMIADAAIAABCIkVACIADACIAMAKQAmAhAkAtIADADQANARALASQAnA8ATBEIACAJIABADIAIAnIhpABQgDgVgGgUgAYcygIABheIAAgGIABgUIh5gCIilgDIABAWIACAiIADBFIjBAAIgBgSIABgZQABgjADgsQisgChrAAIABAtIAEBDIAAACIABAJIi8AAIABgSIAEhlIiAAAQhjABg3gDIAOBsIABANIjdAAIAAgLIAAgTIgBhaIk5AHIgFAAIABAOIADBOIAAAUIieAAIgCgcIgDg6IgBguIiWgCIiZgEIgBBZIAAARIAAAfIi0AAIAAgWIAAggIgChGQhPAChyAFIhjAFIABAkIACBLIkLAAIAAggIAEABQANAAAlgGIAugFIABg9IAEAAIABgRQAFkAABhCIhbAEIjVAIIAAAEIgHAAIgUgVQg3g8gXgkIAAgLMA0DAAAIAAIvgAYk1kIABAAIABgRIAGjbIjPgEIhygCIAGCFIADBEIABAdIAJAAIAnADIBLADIA7ADQBAACA1ABIACgBIACABgAiH1sQB2AHAzAAQAvAAA7gCIAMgBIAKgBIABg/IAGiuQgwAAg+ABIjaAFIgdAAQAEA+ANCkIAAAAIACAAIAiACgAk+1rIAGjhIjPgDIhxgCQABAsAFBkIABASIACAeIABAbIAEAAIBeAFIAYABQBjAEBMABIADAAIAEAAgAxQ5PIAEB+IADBUIABAKIASABIAZAAIBegEIAkgBIBQgDIACAAIAlgCIAAgNIABgHIADhLQAGhcADggQkQAGgpACgAF717QAuAAB8gEIBDgBIAcgBIADAAIABAAIAAgPIAAgeQgEh3AAglIg1AAIg6AAQh+AAhCgDIgGAAIgBAIIgBAIQAAAnAJB9IAAADIAAAEIACAVIACAAIAhACgAMY5MQAFAUAAAMQAAAMANCBIACAVIABAEIANAAIBugDICVgEIAMAAIABgVIAOiuQi0ADiMABgA1617QgEg2gBgrIAAgRIgpADIABARIADAlIABAJIAAABIgDACIAAADIgCAAQgIAGgKgBQgGAAgFgCIAAAAQgIgDgFgGIgCgWIgCghIgDgqIAMgDQAagFA1AAQAQAAAQACIAAAWIABAAIgBAOIAAAHIAAAVQAAAqADAnIABAKIAAABIgDAEIgCAEIgQADIgKACIgBgSg");
	this.shape_5.setTransform(793.4,426.1);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A17458").s().p("AgBAOIAAgcIABAAIACAdg");
	this.shape_6.setTransform(814.6,521.5);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#433E3B").s().p("AgKAPIgCgCIgBgBQgFgFAAgHQABgGAFgGIACgCQAFgDAFAAQAHgBAGAGQAFAFAAAHIAAAAQABAIgGAFQgGAGgHAAQgFAAgFgEg");
	this.shape_7.setTransform(896.2,431.2);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#7B553E").s().p("AAAAtIAAhZIABAAIgBBZg");
	this.shape_8.setTransform(661,375.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_2
	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#343A51").s().p("EhBDAcGIgs7pICyACIApMKIEaAAICUxeQhEgWg3g5QhDhGgShcIi/AIIgKheIDDgHQAJh4BShXQAegeAhgVQAxgeA5gJIgDhPIh4gBIgLhTICSgFIgMmnIBCgcIAEHAICmgHIgHBmIh7gBIACBNQA8AKA0AhQAeAUAbAbQBKBNAOBnIBlgEIAABjIhlAEQgMBphMBOQhFBIhbASIgFJgIDRAhIgEnkICYgGIgZCwIBzANIDjGvIAGuOIBUADIgDjLIBGgBIAGj1IBlgFIAFlgIBngEIAEFfIBagEIgMEBIBCgBIgDDdIBMADIgvVgIBHADIA4q7IDagEIgWFWIB3AQMgAagjxIRvg0MgA8AhNIBzAFIAZnAICpANIhIuzICfgHIAXmVIBFAEIgaGOIC5gKIhHSEICCAdIAmmuIDfgJIgOrgIEDgUIgRIOIDgADIhS0oINaGKIgRCoIC4gEIgND9IBhAOIgMnVIDfAAIgmFKIIJAqIgTV6IEDAQIgLDMIDSgDIg0vNIBUAAIginIIBhAOIAAhqID7ASIgCB6IBfANIgZGLIBnAAIgsXJIBHANIANEhICWAbIgtqIIBUAGIgFrCICaAFIAACLIENA1IhDT+IDdEcg");
	this.shape_9.setTransform(399,466.5);

	this.timeline.addTween(cjs.Tween.get(this.shape_9).wait(1));

	// Layer 1
	this.instance = new lib.estrella();
	this.instance.parent = this;
	this.instance.setTransform(144.5,62.7,1,1,0,0,0,7.2,7.6);

	this.instance_1 = new lib.estrella();
	this.instance_1.parent = this;
	this.instance_1.setTransform(383.7,68.5,1,1,0,0,0,7.2,7.6);

	this.instance_2 = new lib.estrella();
	this.instance_2.parent = this;
	this.instance_2.setTransform(792.9,69.2,1.546,1.546,0,0,0,7.2,7.6);

	this.instance_3 = new lib.estrella();
	this.instance_3.parent = this;
	this.instance_3.setTransform(494.9,234.3,1,1,0,0,0,7.2,7.6);

	this.instance_4 = new lib.estrella();
	this.instance_4.parent = this;
	this.instance_4.setTransform(814.9,22.5,1,1,0,0,0,7.2,7.6);

	this.instance_5 = new lib.estrella();
	this.instance_5.parent = this;
	this.instance_5.setTransform(75.3,44.7,1,1,0,0,0,7.2,7.6);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#76869F").s().p("AgKAKQgEgEABgGQgBgFAEgFQAFgDAFAAQAGAAAEADQAFAFgBAFQABAGgFAEQgEAEgGABQgFgBgFgEg");
	this.shape_10.setTransform(322.3,217.5);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#747D9A").s().p("AgQARQgIgHABgKQgBgJAIgHQAHgIAJAAQAKAAAHAIQAIAHgBAJQABAKgIAHQgHAIgKAAQgJAAgHgIg");
	this.shape_11.setTransform(554.2,153.3);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#6D7B91").s().p("EAgCAJMQgEgEAAgHQAAgGAEgFQAGgFAGAAQAHAAAEAFQAFAFAAAGQAAAHgFAEQgEAGgHAAQgGAAgGgGgEAmjAG6QgIgHAAgMQAAgMAIgJQAIgIAMAAQAMAAAIAIQAIAJAAAMQAAAMgIAHQgIAJgMAAQgMAAgIgJgEglDgHGQgEgEAAgGQAAgGAEgFQAFgEAGAAQAGAAAEAEQAFAFAAAGQAAAGgFAEQgEAFgGAAQgGAAgFgFgEgnLgIpQgIgGAAgKQAAgKAIgGQAGgIAKAAQAKAAAGAIQAIAGgBAKQABAKgIAGQgGAIgKgBQgKABgGgIg");
	this.shape_12.setTransform(594.5,241.6);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#A6ACBD").s().p("EApyACrQgGgGgBgKQABgJAGgHQAHgHAKAAQAJAAAGAHQAIAHgBAJQABAKgIAGQgGAHgJAAQgKAAgHgHgEgqRAAbQgIgHAAgLQAAgJAIgIQAHgHALAAQAKAAAHAHQAIAIAAAJQAAALgIAHQgHAHgKAAQgLAAgHgHgAp0gWQgHgHAAgJQAAgJAHgGQAGgHAJAAQAJAAAGAHQAHAGAAAJQAAAJgHAHQgGAGgJAAQgJAAgGgGgAroiNQgGgGAAgJQAAgJAGgGQAHgGAJAAQAIAAAGAGQAHAGAAAJQAAAJgHAGQgGAHgIAAQgJAAgHgHg");
	this.shape_13.setTransform(493.3,157.3);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#CFD0D4").s().p("ALwIjQgGgHAAgJQAAgJAGgGQAHgHAJAAQAJAAAHAHQAGAGAAAJQAAAJgGAHQgHAGgJAAQgJAAgHgGgAC2HqQgFgGgBgIQABgJAFgGQAHgGAIAAQAJAAAFAGQAHAGgBAJQABAIgHAGQgFAGgJAAQgIAAgHgGgAMBluQgFgGAAgHQAAgIAFgFQAGgGAIAAQAHAAAFAGQAGAFAAAIQAAAHgGAGQgFAFgHAAQgIAAgGgFgAsZmyQgHgHAAgKQAAgKAHgHQAHgHAKAAQAKAAAHAHQAHAHAAAKQAAAKgHAHQgHAHgKAAQgKAAgHgHgAgloKQgFgFAAgHQAAgIAFgFQAGgFAHAAQAHAAAFAFQAGAFAAAIQAAAHgGAFQgFAGgHAAQgHAAgGgGg");
	this.shape_14.setTransform(876.9,195.9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#E5E5E5").s().p("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FQAEAFAAAGQAAAHgEAEQgFAFgGAAQgHAAgFgFgAtHzLQgHgGAAgKQAAgJAHgHQAGgHAKAAQAKAAAGAHQAHAHAAAJQAAAKgHAGQgGAHgKAAQgKAAgGgHgEAnfgTUQgIgIAAgNQAAgMAIgJQAJgJAMAAQANAAAIAJQAJAJAAAMQAAANgJAIQgIAJgNAAQgMAAgJgJgAO7zZQgHgGAAgKQAAgJAHgHQAHgHAKAAQAJAAAHAHQAGAHAAAJQAAAKgGAGQgHAHgJAAQgKAAgHgHgEBH/gTdQgHgGAAgIQAAgJAHgGQAFgGAJAAQAIAAAHAGQAFAGABAJQgBAIgFAGQgHAGgIAAQgJAAgFgGgEgrWgThQgGgFAAgJQAAgIAGgGQAFgGAJAAQAIAAAGAGQAGAGAAAIQAAAJgGAFQgGAGgIAAQgJAAgFgGgEghsgTmQgFgFABgGQgBgGAFgEQAEgFAGAAQAHAAAEAFQAEAEAAAGQAAAGgEAFQgEAEgHAAQgGAAgEgEgEA7egT3QgIgIAAgKQAAgLAIgHQAHgIALAAQAKAAAIAIQAHAHAAALQAAAKgHAIQgIAHgKAAQgLAAgHgHgA3f0LQgJgIABgMQgBgMAJgJQAIgIAMAAQAMAAAIAIQAIAJAAAMQAAAMgIAIQgIAIgMAAQgMAAgIgIg");
	this.shape_15.setTransform(488.7,165.8);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.lf(["#1C8791","#243B5D"],[0,1],3.5,-332.6,4.2,332.6).s().p("EhL4AvBMAAAheBMCXxAAAMAAABeBg");
	this.shape_16.setTransform(477.9,300.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.instance_5},{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol18, new cjs.Rectangle(-21.7,0,985.3,646.3), null);


(lib.Symbol15copy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();this.h1.cache(0,0,99,124);
	}
	this.frame_1 = function() {
		this.stop();this.h2.cache(0,0,84,131);
	}
	this.frame_2 = function() {
		this.stop();this.h3.cache(0,0,90,122);
	}
	this.frame_3 = function() {
		this.stop();this.h4.cache(0,0,101,133);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Layer 2
	this.t = new cjs.Text("M", "36px 'Source Sans Pro Semibold'");
	this.t.name = "t";
	this.t.textAlign = "center";
	this.t.lineHeight = 47;
	this.t.lineWidth = 71;
	this.t.parent = this;
	this.t.setTransform(59.3,56);

	this.timeline.addTween(cjs.Tween.get(this.t).wait(1).to({x:57.3,y:48.8},0).wait(1).to({x:56.7,y:56.3},0).wait(1).to({x:35.7,y:55.1},0).wait(1));

	// Layer_3
	this.h1 = new lib.Symbol33();
	this.h1.name = "h1";
	this.h1.parent = this;

	this.h2 = new lib.Symbol37();
	this.h2.name = "h2";
	this.h2.parent = this;
	this.h2.setTransform(11,-5.5);

	this.h3 = new lib.Symbol38();
	this.h3.name = "h3";
	this.h3.parent = this;
	this.h3.setTransform(19.3,3.9);

	this.h4 = new lib.Symbol39();
	this.h4.name = "h4";
	this.h4.parent = this;
	this.h4.setTransform(8.9,-8.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.h1}]}).to({state:[{t:this.h2}]},1).to({state:[{t:this.h3}]},1).to({state:[{t:this.h4}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,98.7,123.7);


(lib.Symbol11 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 5
	this.noche = new lib.Symbol18();
	this.noche.name = "noche";
	this.noche.parent = this;
	this.noche.setTransform(482.1,299.7,1,1,0,0,0,481.8,300.9);

	this.timeline.addTween(cjs.Tween.get(this.noche).wait(1));

	// Layer 2
	this.tarde = new lib.Symbol17();
	this.tarde.name = "tarde";
	this.tarde.parent = this;
	this.tarde.setTransform(471.2,309.4,1,1,0,0,0,470.9,310.6);

	this.timeline.addTween(cjs.Tween.get(this.tarde).wait(1));

	// Layer 4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(238,238,238,0.502)").s().p("ABmE4QgPgLgJgOIgHgKQgDALgDAHIgGAKQgNASggAAIgFAAQg7gCglg1QgjgzAMgwQgkAqgQAKQglAag8AAQgjAAgcgKQgMgEgKgFQgrgYAAgqQAAgjAUgdIAKgMIACgCQAMgKAXgPIABAAIgDAAQADgCADAAIAPgJIgJgDIgqgNQgcgLgNgVQgNANgUAPQgaATgdgRQhvhCCAgwQAnAIAVALQAFghATgeQAcguAuAAQANAAANAEIAAgBQAAgaAQgeQAIgOALgOQAog0AxAAQAlAAATATQAQARAAAcIAAACIgBAOIABgEIANgVQAVgfAZgVQApgkAwAAQA7AAAlAkQAIAIAGAIQARAYAAAZIgFAcIACAAQAcgYAKgGQAMgIALgFQAdgOAaAAQAsAAAgAiQAeAhAAAqQAAAegLAYQgGAPgEAEIgDAAIACABIABgBQAUABARANQAbAXAAAzQAAAMgCANQgIAkgeAgQgjAlgRgHIAHAGQAIALAAAVQAAAZgJAYQgMAigcAgQg4A/hTAAQgxAAglgdgAGiDaQgghUBXgZQB+BCiFBAQgLAFgIAAQgUAAgJgag");
	this.shape.setTransform(858.6,45.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(238,238,238,0.651)").s().p("ABUChQgPgSgFgiQgMAdgUAUQggAhgrAAQgoAAgcgWQgagVAAgeQAAgfAPgZIAFgIIgPABQgYAAgMgIQgPgKAAgXQAAgiAZgbQAKgLAMgHQgTAHglAAQglAAAKgmQALgrAvgBQBAAxgbAUQAOgGAPAAQAOAAAVANQgYgRAAgbQAAgfATgYQAWgbAjAAQAjAAAUAnIACAFQAUgVAeAAQAYABARAPQASAQAAAXQAAAQgGAIQAVgGATgBQAnAAAeAYQAgAaAAAmQAAASgJAOQgDAFgFAEQAHABAFACQAVALAAAaQAAAqglAkQgpAng4AAQhBAAgagegAkrgBQgUgXAYgZQAJgLANgBQBFAQg7AtQgKAHgIAAQgKAAgIgIg");
	this.shape_1.setTransform(677.1,5.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(238,238,238,0.4)").s().p("ABQFIQgKgJgGgRQgKgYACgjIAAgBQgPAWgPASQgaAggdAAQgWAAgZgdQgagfAAggQAAgLADgJQgLAHgOAIQgzAbg6AAQhUAAgyg3QgpgsAAgxQAAgoAjgYQAKgIALgEIgGgHQgNgSAAgfQAAg7ApgcQAegVAnAAQAeAAARAIIAFAEQgGgQAAgSQAAgoAcgbQAcgZAnAAQANAAAMADIAMAKIADgEQAIgMALgMQATgVAWgOQAugfBBABQBCAAAnAnQAZAaAKAlQAggaAnAAQAxAAAiAaQAeAWAAAdIgBANQgDANgIAMIgBACIAMgJIANgHQAQgIAQABQAeAAAUARQAUARAAAcQAAAagQAbIgGALQgGAIgHAFQAJABAIAFQAIADAHAGQAaAUAAAkQAAAegeAtQgZAmgbAMQgOAGgOAAQgJAAgGgEIgDgCIADAGIAAAXQAEAkgwAtQgRAQgRAKQgeATgbAAQgfAAgIghIgCgHQgCgMAAgNQgDAHgIAJQgKALgQANQg0AqgvAAQgUAAgNgLgAomAbQAGgyAwgHQCEA4iFAsQgPAFgLAAQghAAAGgwg");
	this.shape_2.setTransform(556.4,39.1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(238,238,238,0.749)").s().p("AAED4QgPgQgHgXQgDgJgCgKIgBACQgHATgJAJQgUAJgWAGIgKAAQg7AAgfgtQgcgpAKg7IgCABIgoAhQgfAUgsAAQgnAAgZgTIgEgEQgTgQAAgXQAAgmAXgXQARgQAOgBIACgBIADgDIgBgJIgDgJQgGgQAAgYQAAhLAqgqQAugtBbAAQAQAAARACQAnAGAjAUQAZAPAQAPIAAACQAEgmAYgjIADgFQAigtA4AAQAcAAARAVQAPATAAAbIAAAMQgCAVgHANQAIgIAOgIIAKgFQAVgKAUAAQAoAAAZAcQAZAbAAAtIAAAGQANgKAIAAQAbAAAZAfQAZAfAAAgQAAAKgBAHQgDAPgHAKQgLASgSAAIgCAAQAGAJAAAQQAAAdgbAjQgfAogiAAQgUAAgIgJIgHgMIABAIQAAApgcAiQgIAJgIAHQgjAcg5AAQhFAAgigkg");
	this.shape_3.setTransform(304.1,2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("rgba(238,238,238,0.502)").s().p("AgwFMQg3glAAgkQAAgHAFgKIgBgCQhAAQhMAAQhuAAhOgjQgSgJgPgJQg+goAAhDQAAg1AjgoQAjgoAvAAIATAAQgRgUAAgjQAAg8AfgnQAjgsBFgBQAoABA2AYQAaAMARAMIANAJIAJAHQgHgHgDgTQAChAAmgnQAjglAvAAQAQgBAVAKQAPAGAJAHQAJAHADAFIABAFIACgCIABADIAIgGQAJgMALgLQAxgwA6AAIAKABQAuADAdAfQAeAgAAAqQAAAcgGAOIAOgNQAfgTAqAAQA3AAAbAaQAbAcAAA4QAAArgLAXIgJASQAXAAAeAaQAkAfAAAlQAAAkgcAfQgdAegiABIgDAAQgJABgdgKQAMAFAMALQAHAGAEAGQAIAMAAANQAAAbgTAbQgbAmgzAAIgHAAQgggBgkgOQgZgKgNgKIAAAJQAAAfgVAdQgLAOgPANQg4AvhYAAQhVAAg+grgAI4DJQgWgBABgbQABgxAwgFQBnBSh+AAIgFAAgAp6gGQgbhOBOgYQCDA6iFA/QgLAFgJAAQgUAAgJgYg");
	this.shape_4.setTransform(69.3,33.3);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#6D5353").s().p("AJ+N7IghkzIEfAGIgGExgAtZo+IgBgMQgWisgKh2IAmgBQBbgECSgHIBkgGIADAAIgDCPIAAA/IgCB1g");
	this.shape_5.setTransform(839.4,509.8);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A17458").s().p("AgBAOIAAgcIABAAIACAdg");
	this.shape_6.setTransform(814.9,520.2);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#433E3B").s().p("AHwQAIgMk1IAsABIDOAFIAhEzgAu4m3IgBgWIgJopID5gFIAAAAQgRAQAAAXQAAAXARAQQAQAQAXAAQAYAAARgQQAQgQAAgXQAAgXgQgQIgEgCIEBgGIgDEOIgDAAIhkAGQiSAIhbADIgmABQAKB2AWCsIABAMgAG9pNIgChPIgBgaIDvACQgDACgEADQgLAMAAAQQAAAKADAIQADAFAFAFQAHAHAJADQAGACAGAAQARAAALgMQAMgLABgRQAAgHgCgFQgEgJgHgHIgGgFIDsABIACD1IoDAFIgCiUgAKyqFIgCgCIgBgBQgFgFAAgHQAAgIAGgFIACgCQAFgEAFAAQAIAAAGAGQAFAFAAAHIAAABQAAAHgFAGQgGAFgIAAQgFAAgFgDgAq6u/QgJgJABgMQgBgNAJgJQAEgEAGgCQAFgDAGAAQAMAAAIAJIAFAGQAFAHgBAJQABAMgKAJQgIAJgMAAQgMAAgJgJg");
	this.shape_7.setTransform(826.5,496.1);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#645B46").s().p("AwPVFIgCkkIA7gBIB+gCIAdEogAIjPbIgtgCIgMksIIrACIgBBIIAAASImxAVIASC/gAwUKiIK6AQIgFBDIoTAcIASDDIh1AAIg9AAgALFkqQgJgDgHgHQgFgFgDgFQgDgIAAgKQAAgQALgMQAEgDADgCIjvgCIAAg0IgEk0IgBhKIgBgwIAAgYIgBgoIAAgDIgCg3ICKgBIGCgDIAAAjIAAAHImsARIABAPIACAQIACAMIABAOIANCYIAFAvIAUD1IGEAKIAAApIjtgBIAGAFQAHAHAEAJQACAFAAAHQgBARgMALQgLAMgRAAQgGAAgGgCgALFlgIgCACQgGAFAAAIQAAAHAFAFIABABIACACQAFADAFAAQAIAAAGgFQAFgGAAgHIAAgBQAAgHgFgFQgGgGgIAAQgFAAgFAEgAq2pqQgRgQAAgXQAAgXARgQIAAAAIj5AFIgBgvIgBh8IAAgNIgBgnIAAgfIB1gBIHWgCIAAAlIAAAIImaAUIABAIIAEBDIAFBEIGOgFIAAALIAAAeIkBAGIAEACQAQAQAAAXQAAAXgQAQQgRAQgYAAQgXAAgQgQgAqdqtQgGACgEAEQgJAJABANQgBAMAJAJQAJAJAMAAQAMAAAIgJQAKgJgBgMQABgJgFgHIgFgGQgIgJgMAAQgGAAgFADgAuywFQgCgkAHgiIABgEQALg2AjgyQAMgTAOgQQASgVAVgQQArghA1gNIAUgEIADgBIAdgDQAQgBAPABQAWAAAVADQAfAFAdAMQhKAjgzBDQgWAcgPAgQgMAXgIAZIgBADIgCAFQgMAlgDAgIgJAQIhDABIh7ACIAAgWgAJOwOIiLgFIAAgMIAAgGQAAgNAAgMIACgSIABgEQAFgvAVgqQAIgQAJgPIAOgUQAog7A5gYIATgHQANgFAPgCIAGgBIAOgCQAQgBASAAIABAAQAYABAWAFIAXAFIAIADQgtASghAlQgPAPgNATQgUAegOAiQgNAjgGAmIAAAEQgDAVAAAWQAAAMADANg");
	this.shape_8.setTransform(824.6,463.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#7B725C").s().p("AuLU9IgdkoIHpgIIgSE0gAIlPUIgSi/IGxgVIgEDhgAvDMIIIUgcIgBAeIgLC/In1ACgAIAmsIgVj1IgEgvIgOiYIgBgOIgBgMIgCgQIgBgPIGsgRIAAABIAAA6IAAAdIADG4gAtMsxIgFhDIAAgIIGagUIgBAbIAAASIgBBxImPAFIgEhEgAs7wLQADggAMglIACgFIABgDQAIgZAMgXQAPggAWgcQAzhDBKgjIANAGIACABIAQAIQAJAFAJAHIAJAGIABAAQAPAMAOAOIAFAFQAUAUARAZQAXAgAOAjIAJAXIABADIACAIIAAABIACAIQAEAOACAOQADAVAAAWIgBAHImOAGIAJgQgAIkwWQgDgNAAgMQAAgWACgVIABgEQAFgmAOgjQANgiAVgeQAMgTAPgPQAiglAtgSQAMAEALAGQAIAEAHAFIADABQAjAVAeAkQANAQAMATQAZAkAOApQAFARAEARIABACIABAFQAGAdABAfIAAASg");
	this.shape_9.setTransform(832.6,464.7);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#B6B2AF").s().p("APOQ1IkfgHIjOgFIAAg0IBSADIGbAMIAEjhIAAgRIBTgCIAGJUIhjACgAnDVkIASkzInpAHIh+ACIABhMIB1AAIH1gCIALi+IBLgCIAHI4gAE9gXIgDjJIgDnKIAAgdIgBh0IAAgXIBPAAIAAAYIABAvIABBKIAEE1IAAA0IABAZIACBQIACCTIIDgEIgBj1IAAgqIgDm3IAAgdIgBg7IAAgBIAAgGIAAgkImCAEQgBgOAAgSIABgfIAmABIFbALIAAgSQgBgfgGgeIgBgEIAAgCQgFgSgFgQQgOgpgZglQgMgTgNgQQgegjgjgWIgCgBQgIgFgIgDQgLgGgMgEIgIgDIgXgGQgWgFgYAAQAnglAwgWQAMADALAFQAPAFAOAGIAEADQAdAOAaAUIAQANQAcAZAaAhIACACIARAZQAdAtANAxQAGAXADAYIABAHIABAYIABBwIAAAdIAAA3IAAAIIAAAdIABG5IABAoIABFCgAwhgfIgIp4IgBitIAAgKIAAgCIA3AAIAAAMIABB8IABAvIAJIqIABAVIDgADIFUADIACh1IAAg/IADiPIADkPIAAgdIAAgMIABhxIAAgRIABgbIAAgIIAAglInWACQABghAFgfIBDgBIGOgGIABgGQAAgWgDgVQgCgPgEgOIgCgIIAAgBIgCgHIgBgDIgIgYQgPgigWggQgSgZgTgUIgGgGQgOgOgPgLIgBgBIgIgGQgKgGgJgFIgQgJIgCgBIgNgGQgdgLgfgFQA0gfA/gUQAPAHAOAJIACACIAFADIAAABIACABIAPALIAAAAIASAQIAQAPQASATARAVIAGAIQASAaANAbIAGANIAIAUQAIAWAEAYIAEAeIABACIAAABIABAdIgCB+IgBAqIAAAeIAAASIgDCYIAAAbIgFDyIgCChIgBAyIgDCsg");
	this.shape_10.setTransform(831.2,461.1);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#8A8887").s().p("AxFVoIgorXINdAFIACCgIhLABIABgeIAFhDIq7gQIADEyIA9AAIgBBMIg7ABIACEkgAHNVmIg3rQILWgLIACCOIhTACIABhIIorgCIAMEsIAtACIAAA0IgsgBIAME1gAvhtHIgBhJIgBh3IAAgKIAAgVIAAgFQADhcA7hRQAcgmAggcIABAAQAZgVAcgPQAmgVAugKQAmgJAsAAIALAAIAlACQASACARAEIAXAFQAgAJAeAPQg/AVg0AeQgVgDgWAAQgPgBgQABIgdADIgDABIgUAEQg1ANgrAhQgVAQgSAVQgOAQgMATQgjAygLA2IgBAEQgHAiACAkIAAAWIB7gCQgFAegBAhIh1ABIAAAfIABAngAF/tJIgBglIAAgfIAAgdIgBhIIAAgxIAAgJIAAgEQAAgpALgnIAGgUQAMghAVggIAJgNQBHhkBvgZIALgCIARgDIAUgCIAFgBQATgBAVABIARAAIARACIAJABQAXADAXAGQgwAVgnAlIgBAAQgSAAgQABIgOACIgGABQgPACgNAFIgTAHQg5AYgoA7IgOAUQgJAPgIAQQgVAqgFAvIgBAEIgCASQAAAMAAANIAAAGIAAAMICLAFIgBAeQAAATABANIiKABIACA3IAAADIABAog");
	this.shape_11.setTransform(823.9,460.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#986E55").s().p("AWkcUIAAAAIgHpUIgBiOIrXALIA3LQIAAAHIh0AAIAyumIPKADIAAOjgADQcUIiUAAIgFAAIgEAAIgMAAIgHo4IgCifItcgGIAoLYIAAAFIhJAAIgyunIBHgCIAAgBIPdADIgBgSIAFAAIgFg7IGZAJIAcADIgEDYIlugVIgCAAIAAAeIAEABIAEA1IElAFIAOLMgA0QcUIAar3ID/ACIAcL1gA1AMPIE/APIAIC8Ij7ADIg5AAgA1LLaQgNg7gXhIIgVg9MAwIAAAIAAC2Iw8AFIAAAGIm9gDIAAgBIyOAFIAAAFgA2kG7IgRAAIgBgOQAAgVAEgHIAEgFIB6ABIAKsQIABAAIABhZIADkiIDsAKIAAgBIACABIABBJIAAAJIAAAgICBgCIgDkvIEogCIAUgVIAngYIAYgOQAwgaA4gMIAggFIvCgEIgDAAIgFhAIApAAIELAAQgCglAAgnIgBgjIBjgFQBygFBOgCIACBGIABAgIAAAWIC0AAIgBgfIAAgRIAChZICZADICVADIABAuIAEA6IACAcICeAAIgBgUIgDhPIAAgNIE+gHIABBaIAAATIAAAKIDdABIgBgNIgOhsQA2ACBkAAICAAAIgFBkIAAATIC8AAIgBgJIAAgCIgEhEIgCgsQBrAACsACQgDAsAAAjIgBAZIABASIDBAAIgDhFIgCgiIgBgWICkADIB5ACIAAAUIAAAGIgBBeIBmAAIAABIIgDAAIotgCQAkAHAhAMQATAHASAJIAGADQAZANAXAQIAVAQIADADIAVASQAlAiAhAtIACAEIAXAiQAlA+ARBDIAJApIBpgBIgIgnIgBgDIgDgJQgShEgng9QgLgRgOgRIgCgDQgkgugnggIgMgKIgCgDIEVgBIAAHFIkzAAIgBhwIgBgYIgBgHQgDgYgGgXQgNgxgdgtIgRgZIgCgCQgZghgdgZIgPgNQgagUgdgOIgFgDQgOgGgOgFQgMgFgMgDQgWgGgYgDIgJgBIgRgBIgRgBQgUgBgUACIgFAAIgUACIgRADIgLACQhvAahHBjIgJAOQgUAfgNAiIgGAUQgLAmAAAqIAAADIAAAKIAAAxIABBHIAAAeIplgDIAAAAIhBAAIABh+IgBgdIAAgBIAAgCIgEgeQgEgYgIgWIgIgUIgGgNQgNgbgSgaIgGgIQgRgVgRgTIgRgPIgRgQIgBAAIgPgLIgCgBIAAgBIgFgDIgCgCQgOgJgPgHQgdgPghgJIgWgGQgSgDgSgCIglgCIgLAAQgrAAgnAIQgtAKgnAVQgcAPgYAVIgBABQghAcgcAmQg6BRgEBcIAAAEIAAAWIAAAJIABB3ImBAJIABCBIABAcIAAA2IACBuIAKIuIB2ABIgPslIENACIACCtIAIJ3IKgAEIADisIABgyIADihIADjxIABgbIACiYIKpAEIABB0IAAAdIAEHJIACDJIKfAEIgBlCIAAgoIgCm4IEzADIAANkgAkGwXIAdAGQA7AQA0AhQABAAAAABQABAAAAAAQABAAAAABQAAAAABABIAGADIADACIAQAMIACACIAAAAIAWATIABABIAUASQAWAVAUAbIAGAKQAWAfASAhIAHAQQAEALAGAMQAMAkAGAmIADAUIAAACIABAeIBegBIAAgNIAAgDIgBgJIAAgCQgGgvgOgqIgJgWIgHgQQgRgfgVgdIgHgJQgTgagVgUIgTgSIgVgSIAAAAIgCgCIgBAAILjgFQAngiAtgWQAkgSApgKIAOgCIAGgCIy1gEIAPADgAssqHIACAAIABgHgA0ks3IgqgBIgEi9IACACIAAABIEYAGIAACFIAAAAIABA2gA1Wx/IgFirIgCABIACgEIACgEIABgBIgBgKQgDgnAAgqIAAgVIAAgHIABgOIgBAAIAAgWQgQgCgQAAQg1AAgaAFIgNADIAEAqIACAgIACAXQAFAGAHADIABAAQAFACAGAAQAKAAAHgFIADgBIAAgCIADgCIAAgBIgBgJIgDgmIgBgRIAogDIABARQABAsAEA2IABASQglAGgvAAQgpAAgcgFQgRgmAAhRQAAgvAGgqIAEgWIABgEIDVgIIBbgEQgBBCgGD/IAAASIgEAAIgBA9IguAFQgmAFgMAAIgEAAgAYl0gIgDAAQg1AAhAgDIg7gCIhLgEIgngCIgJgBIgBgcIgDhFIgGiEIByACIDPAEIgHDbIAAAQIgCAAgAiF0nIgigCIgCAAIAAgBQgNijgEg+IAdAAIDagFQA9gBAwAAIgFCuIgBA/IgKABIgNAAQg6ADgvAAQgzAAh2gHgAlE0mQhLgBhjgEIgYgBIhegFIgEgBIgCgbIgBgdIgBgSQgFhlgBgrIBxACIDPADIgHDhIgHAAgAxG0uIgBgKIgDhVIgEh9QApgDEQgFQgDAggGBcIgEBKIAAAIIgBANIgkACIgCAAIhQADIgkABIhfAEIgYAAgAFc04IgCAAIgCgWIAAgDIAAgDQgJh9AAgnIABgIIABgJIAGABQBCACB+ABIA5AAIA1AAQAAAlAFB2IAAAfIAAAOIgBAAIgDABIgcAAIhDACQh8AEguAAIghgCgAMv1BIgBgEIgCgVQgOiBAAgMQAAgMgEgUQCMgBCzgDIgNCuIgCAVIgLAAIiWAEIhtADIgNAAgA5/6KIgEiJMA0HAAbIAABug");
	this.shape_12.setTransform(793.5,417.9);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#7B553E").s().p("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");
	this.shape_13.setTransform(793.7,424.8);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#636D98").s().p("EhBDAcGIgs7pICyACIApMKIEaAAICUxeQhEgWg3g5QhDhGgShcIi/AIIgKheIDDgHQAJh4BShXQAegeAhgVQAxgeA5gJIgDhPIh4gBIgLhTICSgFIgMmnIBCgcIAEHAICmgHIgHBmIh7gBIACBNQA8AKA0AhQAeAUAbAbQBKBNAOBnIBlgEIAABjIhlAEQgMBphMBOQhFBIhbASIgFJgIDRAhIgEnkICYgGIgZCwIBzANIDjGvIAGuOIBUADIgDjLIBGgBIAGj1IBlgFIAFlgIBngEIAEFfIBagEIgMEBIBCgBIgDDdIBMADIgvVgIBHADIA4q7IDagEIgWFWIB3AQMgAagjxIRvg0MgA8AhNIBzAFIAZnAICpANIhIuzICfgHIAXmVIBFAEIgaGOIC5gKIhHSEICCAdIAmmuIDfgJIgOrgIEDgUIgRIOIDgADIhS0oINaGKIgRCoIC4gEIgND9IBhAOIgMnVIDfAAIgmFKIIJAqIgTV6IEDAQIgLDMIDSgDIg0vNIBUAAIginIIBhAOIAAhqID7ASIgCB6IBfANIgZGLIBnAAIgsXJIBHANIANEhICWAbIgtqIIBUAGIgFrCICaAFIAACLIENA1IhDT+IDdEcg");
	this.shape_14.setTransform(377,523.6,1,1,0,0,0,-22.3,58.4);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.lf(["#5E7CFA","#FFFFFF"],[0,1],1.4,-331.9,2.1,332).s().p("EhMAAu7MAAAhd1MCYCAAAMAAABd1g");
	this.shape_15.setTransform(481,300.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol11, new cjs.Rectangle(-21.4,-26.4,989,671.4), null);


(lib.Symbol10 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_17 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(17).call(this.frame_17).wait(1));

	// Layer_10
	this.p1 = new lib.Symbol15copy();
	this.p1.name = "p1";
	this.p1.parent = this;
	this.p1.setTransform(281.8,-11.7,1,1,0,0,0,36.2,47.1);

	this.timeline.addTween(cjs.Tween.get(this.p1).to({scaleY:0.94,y:-6.7},3).wait(1).to({scaleY:1.06,x:281.7,y:-120.1},3).to({scaleY:1,x:281.8,y:-271.7},3).wait(8));

	// Layer_9
	this.p2 = new lib.Symbol15copy();
	this.p2.name = "p2";
	this.p2.parent = this;
	this.p2.setTransform(199.5,-11.7,1,1,0,0,0,36.2,47.1);

	this.timeline.addTween(cjs.Tween.get(this.p2).to({scaleY:0.94,y:-6.7},3).wait(1).to({scaleY:1.06,y:-120.1},3).to({scaleY:1,y:-271.7},3).wait(8));

	// Layer_7
	this.p3 = new lib.Symbol15copy();
	this.p3.name = "p3";
	this.p3.parent = this;
	this.p3.setTransform(117.3,-11.7,1,1,0,0,0,36.2,47.1);

	this.timeline.addTween(cjs.Tween.get(this.p3).to({scaleY:0.94,y:-6.7},3).wait(1).to({scaleY:1.06,x:117.2,y:-120.1},3).to({scaleY:1,x:117.3,y:-271.7},3).wait(8));

	// Layer_8
	this.p4 = new lib.Symbol15copy();
	this.p4.name = "p4";
	this.p4.parent = this;
	this.p4.setTransform(35,-11.7,1,1,0,0,0,36.2,47.1);

	this.timeline.addTween(cjs.Tween.get(this.p4).to({scaleY:0.94,y:-6.7},3).wait(1).to({regX:36.1,scaleY:1.06,y:-120.1},3).to({regX:36.2,scaleY:1,y:-271.7},3).wait(8));

	// Layer_11
	this.instance = new lib.Symbol40("synched",0,false);
	this.instance.parent = this;
	this.instance.setTransform(380.7,-52.3,0.354,0.511,-90,0,0,285.1,192.7);

	this.instance_1 = new lib.Symbol40("synched",0,false);
	this.instance_1.parent = this;
	this.instance_1.setTransform(303.9,-52.3,0.354,0.511,-90,0,0,285.1,192.7);

	this.instance_2 = new lib.Symbol40("synched",0,false);
	this.instance_2.parent = this;
	this.instance_2.setTransform(221.1,-52.3,0.354,0.511,-90,0,0,285.1,192.7);

	this.instance_3 = new lib.Symbol40("synched",0,false);
	this.instance_3.parent = this;
	this.instance_3.setTransform(134.7,-52.3,0.354,0.511,-90,0,0,285.1,192.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]},6).wait(12));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.2,-58.8,345.5,123.7);


(lib.Symbol1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_2 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Layer 2
	this.t = new cjs.Text("W", "36px 'Source Sans Pro Semibold'");
	this.t.name = "t";
	this.t.textAlign = "center";
	this.t.lineHeight = 47;
	this.t.lineWidth = 71;
	this.t.parent = this;
	this.t.setTransform(-35.3,-3.4);

	this.timeline.addTween(cjs.Tween.get(this.t).wait(4));

	// Layer_4
	this.a1 = new lib.Symbol22();
	this.a1.name = "a1";
	this.a1.parent = this;
	this.a1.setTransform(4,24.4);

	this.a2 = new lib.Symbol24();
	this.a2.name = "a2";
	this.a2.parent = this;
	this.a2.setTransform(7.2,27.3,1,1,0,0,0,82,44.5);

	this.a3 = new lib.Symbol27();
	this.a3.name = "a3";
	this.a3.parent = this;
	this.a3.setTransform(-20.8,30.3,1,1,0,0,0,70.5,40.4);

	this.a4 = new lib.Symbol30();
	this.a4.name = "a4";
	this.a4.parent = this;
	this.a4.setTransform(-10.2,11.9,1,1,0,0,0,53.6,62.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.a1}]}).to({state:[{t:this.a2}]},1).to({state:[{t:this.a3}]},1).to({state:[{t:this.a4}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-72.8,-15.2,151.3,79.3);


// stage content:
(lib.ella = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		this.bg.cache(0,0,960,600);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 3
	this.v20 = new lib.Symbol1();
	this.v20.name = "v20";
	this.v20.parent = this;
	this.v20.setTransform(-656.9,156.3,1,1,0,0,0,37.3,39.5);

	this.v19 = new lib.Symbol1();
	this.v19.name = "v19";
	this.v19.parent = this;
	this.v19.setTransform(-614.7,156.3,1,1,0,0,0,37.3,39.5);

	this.v18 = new lib.Symbol1();
	this.v18.name = "v18";
	this.v18.parent = this;
	this.v18.setTransform(-572.5,156.3,1,1,0,0,0,37.3,39.5);

	this.v17 = new lib.Symbol1();
	this.v17.name = "v17";
	this.v17.parent = this;
	this.v17.setTransform(-530.3,156.3,1,1,0,0,0,37.3,39.5);

	this.v16 = new lib.Symbol1();
	this.v16.name = "v16";
	this.v16.parent = this;
	this.v16.setTransform(-488.1,156.3,1,1,0,0,0,37.3,39.5);

	this.v15 = new lib.Symbol1();
	this.v15.name = "v15";
	this.v15.parent = this;
	this.v15.setTransform(-445.9,156.3,1,1,0,0,0,37.3,39.5);

	this.v14 = new lib.Symbol1();
	this.v14.name = "v14";
	this.v14.parent = this;
	this.v14.setTransform(-403.7,156.3,1,1,0,0,0,37.3,39.5);

	this.v13 = new lib.Symbol1();
	this.v13.name = "v13";
	this.v13.parent = this;
	this.v13.setTransform(-361.5,156.3,1,1,0,0,0,37.3,39.5);

	this.v12 = new lib.Symbol1();
	this.v12.name = "v12";
	this.v12.parent = this;
	this.v12.setTransform(-319.3,156.3,1,1,0,0,0,37.3,39.5);

	this.v11 = new lib.Symbol1();
	this.v11.name = "v11";
	this.v11.parent = this;
	this.v11.setTransform(-277.1,156.3,1,1,0,0,0,37.3,39.5);

	this.v10 = new lib.Symbol1();
	this.v10.name = "v10";
	this.v10.parent = this;
	this.v10.setTransform(-191.9,156.3,1,1,0,0,0,37.3,39.5);

	this.v9 = new lib.Symbol1();
	this.v9.name = "v9";
	this.v9.parent = this;
	this.v9.setTransform(-149.7,156.3,1,1,0,0,0,37.3,39.5);

	this.v8 = new lib.Symbol1();
	this.v8.name = "v8";
	this.v8.parent = this;
	this.v8.setTransform(-107.5,156.3,1,1,0,0,0,37.3,39.5);

	this.v7 = new lib.Symbol1();
	this.v7.name = "v7";
	this.v7.parent = this;
	this.v7.setTransform(-65.3,156.3,1,1,0,0,0,37.3,39.5);

	this.v6 = new lib.Symbol1();
	this.v6.name = "v6";
	this.v6.parent = this;
	this.v6.setTransform(-23.1,156.3,1,1,0,0,0,37.3,39.5);

	this.v5 = new lib.Symbol1();
	this.v5.name = "v5";
	this.v5.parent = this;
	this.v5.setTransform(19.1,156.3,1,1,0,0,0,37.3,39.5);

	this.v4 = new lib.Symbol1();
	this.v4.name = "v4";
	this.v4.parent = this;
	this.v4.setTransform(61.3,156.3,1,1,0,0,0,37.3,39.5);

	this.v3 = new lib.Symbol1();
	this.v3.name = "v3";
	this.v3.parent = this;
	this.v3.setTransform(103.5,156.3,1,1,0,0,0,37.3,39.5);

	this.v2 = new lib.Symbol1();
	this.v2.name = "v2";
	this.v2.parent = this;
	this.v2.setTransform(145.7,156.3,1,1,0,0,0,37.3,39.5);

	this.v1 = new lib.Symbol1();
	this.v1.name = "v1";
	this.v1.parent = this;
	this.v1.setTransform(187.9,156.3,1,1,0,0,0,37.3,39.5);

	this.rama = new lib.Symbol10();
	this.rama.name = "rama";
	this.rama.parent = this;
	this.rama.setTransform(732.2,243,1,1,0,0,0,127.4,69.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.rama},{t:this.v1},{t:this.v2},{t:this.v3},{t:this.v4},{t:this.v5},{t:this.v6},{t:this.v7},{t:this.v8},{t:this.v9},{t:this.v10},{t:this.v11},{t:this.v12},{t:this.v13},{t:this.v14},{t:this.v15},{t:this.v16},{t:this.v17},{t:this.v18},{t:this.v19},{t:this.v20}]}).wait(1));

	// Layer 4
	this.bg = new lib.Symbol11();
	this.bg.name = "bg";
	this.bg.parent = this;
	this.bg.setTransform(480,300,1,1,0,0,0,480,300);

	this.timeline.addTween(cjs.Tween.get(this.bg).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-287,273.6,1734.6,671.4);
// library properties:
lib.properties = {
	id: 'PAQUITO_FOREVER_I_LOVE_YOU_ORNOT',
	width: 960,
	height: 600,
	fps: 25,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"data/imgs/nubeciglia.png", id:"nubeciglia"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['PAQUITO_FOREVER_I_LOVE_YOU_ORNOT'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;