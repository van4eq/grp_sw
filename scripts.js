function declension(qty,pieces,pretitles){ //Склонение слов
	let declension=[2,0,1,1,1,2];
	let index=(qty%1!=0)?1:(qty%100>4&&qty%100<20)?2:declension[Math.min(qty%10,5)];
	return (pretitles?pretitles[index]+' ':'')+qty+' '+pieces[index]; //Например, "Осталась(pretitles) 1(qty) штука(pieces)" или "23(qty) рубля(pieces)"
}

function prepositions(text){ //Удаление переносов после предлогов
	var prepositions=['без','безо','в','вдоль','во','возле','вокруг','для','до','за','из','изо','к','ко','на','над','надо','о','об','обо','около','от','ото','по','под','подо','перед','передо','позади','после','при','про','с','со','у','через','из-за','из-под','а','но','не','ни'];
	for(let prep of prepositions){
		text=text.replace(new RegExp(`( )(${prep})( )`,'gi'),`$1$2&nbsp;`);
	}
	return text;
}

var options={day:'numeric',month:'long'};
function wednesday(date=new Date()){ //Вычисляем дату ближайшей среды
	var day=date.getDay();
	var diff=(day<=3)?3-day:10-day;
	date.setDate(date.getDate()+diff);
	return date.toLocaleDateString('ru-RU',options);
}
function friday(date=new Date()){ //Вычисляем дату ближайшей пятницы
	var day=date.getDay();
	var diff=(day<=5)?5-day:10-day;
	date.setDate(date.getDate()+diff);
	return date.toLocaleDateString('ru-RU',options);
}
function weeksMonths(type='month'){ //Вычисление месяца
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
//	else if(type=='sinceUntil'){ //Это настройка на случай, если бы указывались даты начала и конца акции
//		startDate=since;
//		endDate=until;
//		var from=(startDate.getDate()=='2')?'со':'с';
//		var to=(startDate.getMonth()==endDate.getMonth())?'по':getMonthName(startDate)+' по';
//		return `${from} ${startDate.getDate()} ${to} ${endDate.getDate()} ${getMonthName(endDate)}`;
//	}
	if((type=='week'||type=='month')&&startDate.getDate()>endDate.getDate()){
		return `${startDate.getDate()} ${getMonthName(startDate)}—${endDate.getDate()} ${getMonthName(endDate)}`;
	}else{
		return `${startDate.getDate()}—${endDate.getDate()} ${getMonthName(endDate)}`;
	}
}
function getMonthName(date){ //Месяцы прописью
	const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
	return months[date.getMonth()];
}

var categoryChains,cityId,params; //Технические данные для беспроблемной вставки с сайта SW
var since; //Дата начала акции
var until; //Дата завершения акции
var amount; //Фасовка продукта
var before; //Предыдущий выбор заголовка
var link; //Ссылка на продукт
var stories; //Для корректного входа в режим редактирования сторис/статуса
var discount; //Скидка
var measurements=/ \(1\,5 мл\)| \(\d{2,3} мл\)| \(\d{2,3} г\)| \(объем \d{2,3} мл\)| \(\d+ капсул\)/; //Меры фасовок

function sortAlphabet(){ //Сортировка по алфавиту 
	$('.category').each(function(){ //Для продуктов
		var items=$(this).find('.item').get();
		items.sort(function(a,b){
			var nameA=$(a).find('.name').text().trim().toLowerCase();
			var nameB=$(b).find('.name').text().trim().toLowerCase();
			return nameA.localeCompare(nameB,'ru');
		});
		$(this).empty().append(items);
	});
//	$('section').each(function(){ //Для категорий
// 		var category=$(this).find('.category').get();
// 		category.sort(function(a,b){
// 			var nameA=$(a).attr('category-name').trim().toLowerCase();
// 			var nameB=$(b).attr('category-name').trim().toLowerCase();
// 			return nameA.localeCompare(nameB,'ru');
// 		});
// 		$(this).find('.category').remove();
// 		$(this).append(category);
// 	});
}

function naming(n){
	n=n
		.replace(/, (1\.5 мл|1\,5 мл)/,' (1,5 мл)')
		.replace(/, (\d{2,3} мл)/,' ($1)')
		.replace(/, (\d{2,3} г)/,' ($1)')
		.replace(/, (объем \d{2,3} мл)/,' ($1)')
		.replace(/, (\d+ капсул)/,' ($1)')
		.replace('Духи-концентрат,','Духи-концентрат')
		.replace(/Фиточай из диких трав №( |)/,'Чай №')
		.replace(/ (Siberian Herbs|GREENPIN|Vitamama Family|Pure Life|Intestinal Defense)/,'')
		.replace(/^Витаминно-минеральный комплекс$/,'Ритмы здоровья')
		.replace(/^Энергомодулирующий комплекс в формате спрея$/,'Адаптовит')
		.replace(/^Набор для комплексного очищения организма$/,'Истоки чистоты')
		.replace(/^Премиум набор для комплексного очищения организма$/,'Истоки чистоты Премиум (Renaissance Triple Set)')
		.replace(/^Истоки чистоты. Формула 3$/,'Формула 3 (антиоксидантный комплекс)')
		.replace(/^(Природный инулиновый концентрат)$/,'$1 (ПИК)')
		.replace(/^Восстанавливающий бальзам$/,'$& (для кожи)')
		.replace(/^Бальзам с экстрактом окопника, глюкозамином и хондроитином$/,'Бальзам Живокост')
		.replace(/^«Живокост», восстанавливающий бальзам форте$/,'Бальзам Живокост форте')
		.replace(/^«Уян Номо», бальзам для тела$/,'Бальзам Уян Номо (Гибкий лук)')
		.replace(/^Бальзам широкого спектра действия$/,'Бальзам Корень (без камфоры)')
		.replace(/^«Корень», бальзам широкого спектра действия|Бальзам широкого спектра действия «Корень»$/,'Бальзам Корень (с камфорой)')
		.replace(/^Противовоспалительная зубная паста с энзимами для профилактики заболеваний пародонта$/,'Противовоспалительная зубная паста с энзимами для дёсен')
		.replace(/^Антибактериальная зубная паста с энзимами для комплексного ухода и защиты от кариеса$/,'Антибактериальная зубная паста c энзимами от кариеса')
		.replace(/^Зубная паста для осветления эмали «Черника &amp; Древесный уголь»$/,'Зубная паста «Черника & Древесный уголь» (Для осветления эмали)')
		.replace(/^Зубная паста Интенсивное укрепление эмали Морской кальций$/,'Зубная паста «Морской кальций» (Интенсивное укрепление эмали)')
		.replace(/^Зубная паста Антибактериальная защита Горная лаванда$/,'Зубная паста «Горная лаванда» (Антибактериальная защита)')
		.replace(/^Природная профилактическая зубная паста «Сибирский прополис»$/,'Профилактическая зубная паста «Сибирский прополис»')
		.replace(/^Сибирская чага, природная профилактическая зубная паста$/,'Зубная паста «Сибирская чага» (Защита от кариеса)')
		.replace(/^(Хронобиологическая защита клеток мозга|Хронобиологическая защита сердца|Хронобиологическая защита печени|Хронобиологическая защита суставов|Хронобиологическая защита зрения) (Синхровитал [IVX]+)/,'$2 ($1)')
		.replace(/^Метилсульфонилметан$/,'MSM (Органическая сера)')
		.replace(/^Чайханский чай. Черный с травами$/,'Чайханский чёрный чай с травами')
		.replace(/^Чайханский чай. Зеленый с травами$/,'Чайханский зелёный чай с травами')
		.replace('. ',', ');
	if(n.match(', ')&&n.trim().match(/^[^А-ЯЁа-яё]{3}|Корень/)&&!n.trim().match('100%')){
		n=n.replace(n.split(', ')[0]+', ','').replace(/^./,char=>char.toUpperCase())+' '+n.split(', ')[0];
	}
	if(n.trim().match(/парфюмиров|маска для/)){
		n=n.replace(n.split(', ')[0]+', ','').replace(/^./,char=>char.toUpperCase())+' '+n.split(', ')[0];
	}
	if(n.match(' / ')&&!n.match(/ \/ PA( |)\+/)){
		n=n.trim().replace(' / ',' (')+')';
	}

	return n;
}
