function declension(qty,titles,pretitles){
	let declension=new Array(2,0,1,1,1,2);
	let declensionIndex=(qty%1!=0)?1:(qty%100>4&&qty%100<20)?2:declension[Math.min(qty%10,5)];
	return (pretitles?pretitles[declensionIndex]+' ':'')+qty+' '+titles[declensionIndex];
}

function prepositions(text){
	var prepositions=['без','безо','в','во','для','до','за','из','изо','к','ко','на','над','надо','о','об','обо','от','ото','по','под','подо','перед','передо','после','при','про','с','со','у','через','из-за','из-под','а','но','не','ни', 'Без','Безо','В','Во','Для','До','За','Из','Изо','К','Ко','На','Над','Надо','О','Об','Обо','От','Ото','По','Под','Подо','Перед','Передо','После','При','Про','С','Со','У','Через','Из-за','Из-под','А','Но','Не','Ни'];
	for(let prep of prepositions){
		text=text.replace(new RegExp(` ${prep} `,'g'),` ${prep}&nbsp;`);
	}
	return text;
}

var options={day:'numeric',month:'long'};
function wednesday(date=new Date()){
	var day=date.getDay();
	var diff=(day<=3)?3-day:10-day;
	date.setDate(date.getDate()+diff);
	return date.toLocaleDateString('ru-RU',options);
}
function friday(date=new Date()){
	var day=date.getDay();
	var diff=(day<=5)?5-day:10-day;
	date.setDate(date.getDate()+diff);
	return date.toLocaleDateString('ru-RU',options);
}

function weeksMonths(type='month'){
	const now=new Date();
	let startDate,endDate;
	if(type=='week'){
		startDate=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()||7)-1));
		endDate=new Date(startDate);
		endDate.setDate(endDate.getDate()+6);
	}else if(type=='month'){
		startDate=new Date(now.getFullYear(),now.getMonth(),1);
		endDate=new Date(now.getFullYear(),now.getMonth()+1,0);
	}
	if(startDate.getDate()>endDate.getDate()){
		return `${startDate.getDate()} ${getMonthName(startDate)}—${endDate.getDate()} ${getMonthName(endDate)}`;
	}else{
		return `${startDate.getDate()}—${endDate.getDate()} ${getMonthName(endDate)}`;
	}
}
function getMonthName(date){
	const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
	return months[date.getMonth()];
}

var categoryChains; // Технические данные для беспроблемной вставки с сайта SW
var cityId; // Технические данные для беспроблемной вставки с сайта SW
var params; // Технические данные для беспроблемной вставки с сайта SW
var until; // Дата завершения акции
var amount; // Фасовка продукта
var before; // Предыдущий выбор заголовка
var link; // Ссылка на продукт
var stories; // Для корректного входа в режим редактирования сторис/статуса
$(document).on('paste',function(e){
	e.preventDefault();
	navigator.clipboard.readText().then(text=>{ // Формирование рекламы при вставке ссылки на страницу с продуктом
		if(text.trim().match(/^\d{6}$/)&&!$('[contenteditable]:focus').length){
			link='https://ru.siberianhealth.com/ru/shop/catalog/product/'+text.trim()+'/';
			$.post(link,function(data){
				stories=1;
				let sendData=eval('({'+data.match(/\'id\'\: \d{6}\,/)+data.split(/\'id\'\: \d{6}\,/)[1].split("'params': params")[0]+'})');

				until=data.split('saleUntilDate&quot;:&quot;')[1].split('T23:59:59+')[0].match(/(\d{4}-\d{2}-\d{2})/g);
				if(until!=null){
					until=new Date(until).toLocaleDateString('ru-RU',options);
				}

				$('#copy button').prop('disabled',false);

				$('#img').html('<img src="'+sendData.pictureUrl.replace('_resize/','').replace('_fit_300_300','')+'">').css('background','none');
				$('#pic').attr('src',$('#img img').attr('src'));

				sendData.name=sendData.name
					.replace(/\, 1\.5 мл|\, 1\,5 мл/,' (1,5 мл)')
					.replace(/\, (\d{2,3} мл)/,' ($1)')
					.replace(/\, (\d{2,3} г)/,' ($1)')
					.replace(/\, (объем \d{2,3} мл)/,' ($1)')
					.replace('Духи-концентрат,','Духи-концентрат')
					.replace('Фиточай из диких трав № ','Чай №')
					.replace(' Siberian Herbs','')
					.replace(/^Витаминно-минеральный комплекс$/,sendData.vendor)
					.replace(/^Энергомодулирующий комплекс в формате спрея$/,sendData.vendor)
					.replace(/^Набор для комплексного очищения организма$/,sendData.vendor)
					.replace(/^Премиум набор для комплексного очищения организма$/,'Истоки чистоты Премиум (Renaissance Triple Set)')
					.replace(/^Истоки чистоты. Формула 3$/,'Формула 3')
					.replace(/^(Природный инулиновый концентрат)$/,'$1 (ПИК)')
					.replace(/^(Восстанавливающий бальзам)$/,'$1 (для кожи)')
					.replace(/^Бальзам с экстрактом окопника\, глюкозамином и хондроитином$/,sendData.vendor)
					.replace(/^«Живокост», восстанавливающий бальзам форте$/,'Бальзам Живокост форте')
					.replace(/^\«Уян Номо\»\, бальзам для тела$/,'Бальзам Уян Номо (Гибкий лук)')
					.replace(/^(Бальзам широкого спектра действия)$/,'$1 Корень (без камфоры)')
					.replace(/^(Бальзам широкого спектра действия) «Корень»$/,'$1 Корень (с камфорой)')
					.replace(/^(Зубная паста|Зубная паста с пребиотиком) (Натуральная защита|Антибактериальная защита|Интенсивное укрепление эмали|Свежесть и защита для чувствительных зубов)$/,'$1 '+sendData.vendor+' ($2)')
					.replace(/^(Зубная паста|Зубная паста с пребиотиком) (Натуральная защита|Антибактериальная защита|Интенсивное укрепление эмали|Свежесть и защита для чувствительных зубов) (Горная лаванда)/,'$1 $3 ($2)')
					.replace('Сибирская чага, природная профилактическая зубная паста','Природная профилактическая зубная паста Сибирская чага')
					.replace(/^Хронобиологическая защита клеток мозга$|^Хронобиологическая защита сердца$|^Хронобиологическая защита печени$|^Хронобиологическая защита суставов$|^Хронобиологическая защита зрения$/,sendData.vendor+' ('+sendData.name+')')
					.replace(/^(Метилсульфонилметан)$/,'$1 (Органическая сера)')
					.replace(/^Чайханский чай. Черный с травами$/,'Чайханский чёрный чай с травами')
					.replace(/^Чайханский чай. Зеленый с травами$/,'Чайханский зелёный чай с травами')
					.replace('. ',', ');
				if(sendData.name.match(', ')&&sendData.name.trim().match(/^[^А-ЯЁа-яё]{3}|Корень/)&&!sendData.name.trim().match('100%')){
					sendData.name=sendData.name.replace(sendData.name.split(', ')[0]+', ','').replace(/^./,char=>char.toUpperCase())+' '+sendData.name.split(', ')[0];
				}
				if(sendData.name.trim().match('парфюмиров')){
					sendData.name=sendData.name.replace(sendData.name.split(', ')[0]+', ','').replace(/^./,char=>char.toUpperCase())+' '+sendData.name.split(', ')[0];
				}
				if(sendData.name.match(' / ')){
					sendData.name=sendData.name.trim().replace(' / ',' (')+')';
				}
				var measurements=/ \(1\,5 мл\)| \(\d{2,3} мл\)| \(\d{2,3} г\)| \(объем \d{2,3} мл\)/;
				if(sendData.name.match(measurements)){
					sendData.name=sendData.name.replace(sendData.name.match(measurements),'')+sendData.name.match(measurements);
				}

				if($('#other').prop('checked')){
					var other=1;
				}else{
					$('#slogan').slideUp(200);
				}

				if(sendData.price!=sendData.oldPrice){ // При загрузке акционного продукта
					var oldPrice='<span class="del" contenteditable>'+sendData.oldPrice+'</span> ';
					if(!$('.no_offer').prop('disabled')||$('[name=period]:disabled').length==$('[name=period]').length){
						$('.offer').prop('disabled',false);
						$('#'+before).addClass('before');
						$('.no_offer').prop({'disabled':true,'checked':false});
					}console.log('Акция до: '+until+'\nСегодня: '+new Date().toLocaleDateString('ru-RU',options)+'\nКонец недели: '+weeksMonths('week').split('—')[1]+'\nКонец месяца: '+weeksMonths('month').split('—')[1]);
					if(until==new Date().toLocaleDateString('ru-RU',options)){
						before='last_day';
					}else{
						before='until';
						if(until!=null){
							$('#until').text('Акция до '+until);
						}else{
							$('#until').text('Акция');
						}
					}
					$('#'+before).prop('checked',true);
					$('#specialPrice').prop({'disabled':true,'checked':false});
					$('#price span').removeClass('del');
				}
				if(sendData.price==sendData.oldPrice){ // При загрузке продукта без акции
					var oldPrice='';
					if(!$('.offer').prop('disabled')||$('[name=period]:disabled').length==$('[name=period]').length){
						$('.no_offer').prop('disabled',false);
						before=$('.before').length?$('.before').attr('id'):$('.no_offer:first').attr('id');
						$('.before').removeClass('before');
						$('.offer').prop({'disabled':true,'checked':false});
					}
					$('#'+before).prop('checked',true);
					$('#specialPrice').prop({'disabled':false,'checked':false});
					$('#price span').removeClass('del');
				}

				var points=data.split('params.points = ')[1].split(';')[0].trim().replace('.',',');
				if(data.indexOf("params.amount = '")!=-1){
					amount=data.split("params.amount = '")[1].split("';")[0].trim();
				}else{
					amount='';
				}

				sendData.description=sendData.description.replace(/\&amp\;/g,'&').replace(/\&bull\;/g,'•').replace(/\.([А-ЯA-Z0-9\«])/g,'<br>$1').replace(/(\.|)(\•)/g,'<br>$2').replace(/([…!🙂])([А-ЯA-Z0-9])/g,'$1<br>$2').trim().replace(/\.$/gm,'');
				if(sendData.description.length<100){
					var extend=confirm('Загружено слишком короткое описание (менее 100 символов). Если Вы хотите открыть страницу продукта и вручную дополнить описание, нажмите ОК');
					if(extend){
						window.open(link);
					}
				}

				$('#remain').prop({'disabled':false,'checked':false});
				$('#other').prop('disabled',false);
				if(other==1){
					$('#other').prop('checked',true);
					$('[name=period]').prop('checked',false);
					other=0;
				}
				$('#link').prop('disabled',false);
				if(localStorage['link']==1){
					$('#link').prop('checked',true);
				}else{
					$('#link').prop('checked',false);
				}
				$('#remain+label').text('Осталось');
				$('#specialPrice+label').text('Своя цена');

				$('#header').html(sendData.name);
				$('#price').html(oldPrice+'<span contenteditable>'+sendData.price+'</span> ₽');
				$('#points').html(declension(points,new Array('балл','балла','баллов'))).slideDown(200);
				$('#descr').html(sendData.description);
			}).fail(function(){
				alert('Возможно, продукта с таким кодом нет или сайт временно не работает');
			});
		}else{
			document.execCommand('insertText',false,text.replace(/\&nbsp\;|\t/g,' ').replace(/\ +/g,' ').replace(/^\ |\ $/gm,'').trim().replace(/\.$/gm,''));
		}
	}).catch(err=>{
		console.log('Опять чё-то не так',err);
	});
});

$('#price').on({
	keypress:function(e){
		if(e.which<48||e.which>57){
			return false;
		}
	},
	paste:function(e){
		document.execCommand('insertText',false,e.originalEvent.clipboardData.getData('text').replace(/\D/g,''));
		return false;
	}
});

$('[name=period]').click(function(){
	before=$(this).attr('id');
	if($('#other').prop('checked')){
		$('#other').trigger('click');
	}
});

$('#specialPrice').click(function(){
	if($(this).prop('checked')){
		function specialPrice_1(){
			var specialPrice=prompt('Введите специальную цену (только цифрами от 0)');
			if(specialPrice!=null){
				if(specialPrice.replace(/\s/g,'').match(/^\d+$/)){
					$('#specialPrice+label').append(': '+specialPrice.replace(/\s/g,'').replace(/^[0]+$/g,'0').replace(/^[0]+([1-9])/g,'$1'));
					$('#price span').addClass('del');
					$('#points').slideUp(200);
				}else{
					specialPrice_1();
				}
			}else{
				$('#specialPrice').prop('checked',false);
			}
		}
		specialPrice_1();
	}else{
		$('#specialPrice+label').text('Своя цена');
		$('#price span').removeClass('del');
		$('#points').slideDown(200);
	}
});

$('#remain').click(function(){
	if($(this).prop('checked')){
		function remain_1(){
			var remain=prompt('Введите остатки продукта (только цифрами от 1)');
			if(remain!=null){
				if(remain.replace(/\s/g,'').match(/^\d+$/)>0){
					$('#remain+label').append(': '+remain.replace(/\s/g,'').replace(/^[0]+([1-9])/g,'$1'));
				}else{
					remain_1();
				}
			}else{
				$('#remain').prop('checked',false);
			}
		}
		remain_1();
	}else{
		$('#remain+label').text('Осталось');
	}
});

$('#other').click(function(){
	if($(this).prop('checked')){
		$('[name=period]').prop('checked',false);
		$('#slogan').slideDown(200,function(){
			var element=$(this)[0];
			element.focus();
			var range=document.createRange();
			var selection=window.getSelection();
			range.selectNodeContents(element);
			range.collapse(false);
			selection.removeAllRanges();
			selection.addRange(range);
		});
	}else{
		$('#'+before).prop('checked',true);
		$('#slogan').slideUp(200);
	}
});

$('#copy button').click(function(){
	if($(this).attr('id')=='wa'){
		var bold='*';
		var scratch='~';
	}
	if($(this).attr('id')=='tg'){
		var bold='**';
		var scratch='~~';
	}
	var slogan='';
	if($('[name=period]:checked').prop('checked')&&!$('#nope').prop('checked')){
		slogan=$('[name=period]:checked+label').text()+'!\n';
		if($('[name=period]:checked+label').text()=='Акция среды'){
			slogan=$('[name=period]:checked+label').text()+' / '+wednesday()+'!\n';
		}
		if($('[name=period]:checked+label').text()=='Акция пятницы'){
			slogan=$('[name=period]:checked+label').text()+' / '+friday()+'!\n';
		}
		if($('[name=period]:checked+label').attr('id')=='until'){
			slogan=$('[name=period]:checked+label').text()+'!\n';
		}
	}
	if($('#other').prop('checked')){
		$('#copy_slogan').html($('#slogan').html().replace(/\&nbsp\;|\t/g,' '));
		if($('#copy_slogan').text().trim()!=''){
			slogan=document.querySelector('#copy_slogan').innerText.replace(/\ +/g,' ').replace(/^\ |\ $/gm,'').replace(/\n{2,}/g,'\n\n').trim()+'\n';
		}
	}
	var points='\n'+$('#points').text();
	if($('#specialPrice+label').text().match(/\d+/)){
		points='';
	}
	var scratchPrice='';
	if($('#price span.del').text()!=''){
		scratchPrice=scratch+$('#price span.del').text().replace(/\D/g,'')+scratch+' ';
	}
	var price=$('#price span:not(.del)').text().replace(/\D/g,'');
	if($('#specialPrice+label').text().match(/\d+/)){
		price=$('#specialPrice+label').text().match(/\d+/);
	}
	var remain='';
	if($('#remain+label').text().match(/\d+/)){
		remain=bold+'Всего '+declension($('#remain+label').text().match(/\d+/),new Array('штука','штуки','штук'))+bold+'\n\n';
	}
	var addLink='';
	if($('#link').prop('checked')){
		addLink='\n\nПодробнее о продукте: '+link;
	}
	$('#copy_descr').html($('#descr').html().replace(/\&nbsp\;|\t/g,' '));
	navigator.clipboard.writeText(
		slogan
		+bold
			+$('#header').text().replace(/\n/g,' ').replace(/\s+/g,' ').trim()
			+' за '
			+scratchPrice
			+declension(price,new Array('рубль','рубля','рублей'))
		+bold
		+points
		+'\n\n'
		+remain
		+document.querySelector('#copy_descr').innerText.replace(/\ +/g,' ').replace(/^\ |\ $/gm,'').replace(/\n{2,}/g,'\n\n').trim()
		+addLink
	);
	$('#copied').fadeIn(100).fadeOut(1000);
});

$(document).on('click','#img img',function(){
	var canvas=document.querySelector('#canvas');
	var context=canvas.getContext('2d');
	var img=document.querySelector('#pic');
	canvas.width=img.width;
	canvas.height=img.height;
	context.drawImage(img,0,0,img.width,img.height);
	canvas.toBlob(blob=>navigator.clipboard.write([new ClipboardItem({'image/png':blob})]));
	$('#copied').fadeIn(100).fadeOut(1000);
});

//Тёмная тема
if(window.matchMedia('(prefers-color-scheme:dark)').matches){
	if(localStorage['dark']!=0){
		localStorage['dark']=1;
	}
}

if(localStorage['dark']==1){
	$('*').addClass('dark_theme');
	$('#theme').prop('checked',true);
}else{
	$('*').removeClass('dark_theme');
	$('#theme').prop('checked',false);
}
$('#theme').click(function(){
	if($(this).prop('checked')){
		$('*').addClass('dark_theme');
		localStorage['dark']=1;
	}else{
		$('*').removeClass('dark_theme');
		localStorage['dark']=0;
	}
});

//Запомнить состояние отметки "Ссылка на продукт"
$('#link').click(function(){
	if($(this).prop('checked')){
		localStorage['link']=1;
	}else{
		localStorage['link']=0;
	}
});

