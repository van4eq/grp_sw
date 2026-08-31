$(document).on('paste',function(e){
	e.preventDefault();
	navigator.clipboard.readText().then(text=>{ // Формирование рекламы при вставке ссылки на страницу с продуктом
		if(text.trim().match(/^\d{6}$/)&&!$('[contenteditable]:focus').length){
			link='https://ru.siberianhealth.com/ru/shop/catalog/product/'+text.trim()+'/';
			$.post(link,function(data){
				$('#draft_header,#draft_descr').attr('productID',text);
				stories=1;
				let sendData=eval('({'+data.split(/sendData\s*=\s*\{\n/g)[1].split('};')[0]+'})');

				//try{ //Это настройка на случай, если бы указывалась дата начала акции
				//	since=data.split('{&quot;start&quot;:&quot;')[1].split('T')[0].match(/(\d{4}-\d{2}-\d{2})/g)[0];
				//}catch{}
				//if(since!=null){
				//	since=new Date(since);
				//}
				try{
					until=data.split('&quot;finish&quot;:&quot;')[1].split('T23:59:59')[0].match(/(\d{4}-\d{2}-\d{2})/g)[0];
				}catch{}
				if(until!=null){
					until=new Date(until);
				}

				$('#copy button').prop('disabled',false);

				$('#img').html('<img src="'+sendData.pictureUrl.replace('_resize/','').replace('_fit_300_300','')+'">').css('background','none');
				$('#pic').attr('src',$('#img img').attr('src'));

				sendData.name=naming(sendData.name);
				if(sendData.name.match(measurements)){
					sendData.name=sendData.name.replace(sendData.name.match(measurements),'')+sendData.name.match(measurements);
				}
				if(localStorage[`h${text}`]){
					if(confirm('Использовать сохранённый заголовок по этому продукту?')){
						sendData.name=localStorage[`h${text}`];
					}
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
					}
					if(until.toLocaleDateString('ru-RU',options)==new Date().toLocaleDateString('ru-RU',options)){
						before='last_day';
					}else{
						before='until';
						if(until!=null){
							$('#until+label').text('Акция по '+until.toLocaleDateString('ru-RU',options));
							//if(since!=null){ // Это настройка на случай, если бы указывалась дата начала акции
							//	$('#until+label').text('Акция '+weeksMonths('sinceUntil'));
							//}
						}else{
							$('#until+label').text('Акция');
						}
					}
					$('#'+before).prop('checked',true);
					$('#specialPrice,#oldPrice').prop({'disabled':true,'checked':false});
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
					$('#specialPrice,#oldPrice').prop({'disabled':false,'checked':false});
					$('#price span').removeClass('del');
				}

				var points=data.split('params.points = ')[1].split(';')[0].trim().replace('.',',');
				try{
					amount=data.split("params.amount = '")[1].split("';")[0].trim();
				}catch{
					amount='';
				}

				sendData.description=$(data).find('div[itemprop="description"]').html();
				if(sendData.description.length<115){ // Если слишком короткое описание, то рассмотрим первый абзац полного описания продукта
					var descr=JSON.parse($(data).find('param[get-dom-data="product.data"]').attr('value'));
					var $descr=$(descr[Object.keys(descr)[0]].description);
					sendData.description=$descr.html();
					if(sendData.description.length<115){ // Если слишком короткий первый абзац полного описания продукта, то рассмотрим описание полностью
						sendData.description=$descr.toArray().map(el=>el.outerHTML).join('');
					}
				}
				if(localStorage[`d${text}`]){
					if(confirm('Использовать сохранённое описание по этому продукту?')){
						sendData.description=localStorage[`d${text}`];
					}
				}
				//sendData.description=sendData.description.replace(/\&amp\;/g,'&').replace(/\&bull\;/g,'•').replace(/\.([А-ЯA-Z0-9\«])/g,'<br>$1').replace(/(\.|)(\•)/g,'<br>$2').replace(/([…!🙂])([А-ЯA-Z0-9])/g,'$1<br>$2').trim().replace(/\.(\ |)(?=$|<)/gm,'');
				sendData.description=sendData.description.replaceAll('• ','- ').trim().replace(/\.(\ |)(?=$|<)/gm,'');

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
				$('#remain+label span,#specialPrice+label span,#oldPrice+label s').text('');

				$('#header').html(sendData.name);
				$('#price').html(oldPrice+'<span contenteditable>'+sendData.price+'</span> ₽');
				$('#points').html(declension(points,['балл','балла','баллов'])).slideDown(200);
				$('#descr').html(sendData.description);
			}).fail(function(){
				alert('Возможно, продукта с таким кодом нет или сайт временно не работает');
			});
		}else{
			document.execCommand('insertText',false,text.replace(/\&nbsp\;|\t/g,' ').replace(/\ +/g,' ').replace(/^\ |\ $/gm,'').trim().replace(/\.$/gm,''));
		}
	}).catch((err)=>{
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

$('#remain').click(function(){
	if($(this).prop('checked')){
		function remain(){
			let input=prompt('Введите остатки продукта (только цифрами от 1)');
			if(input!=null){
				if(input.replace(/\s/g,'').match(/^\d+$/)>0){
					$('#remain+label span').text(input.replace(/\s/g,'').replace(/^[0]+([1-9])/g,'$1'));
				}else{
					remain();
				}
			}else{
				$('#remain').prop('checked',false);
			}
		}
		remain();
	}else{
		$('#remain+label span').text('');
	}
});

$('#oldPrice').click(function(){
	if($(this).prop('checked')){
		function reduced(){
			let input=prompt('Введите старую цену (только цифрами)');
			if(input!=null){
				if(input.replace(/\s/g,'').match(/^\d+$/)>0){
					$('#oldPrice+label s').text(input.replace(/\s/g,'').replace(/^[0]+([1-9])/g,'$1'));
					if($('#specialPrice').prop('checked')){
						$('#specialPrice').trigger('click');
					}
				}else{
					reduced();
				}
			}else{
				$('#oldPrice').prop('checked',false);
			}
		}
		reduced();
	}else{
		$('#oldPrice+label s').text('');
	}
});

$('#specialPrice').click(function(){
	if($(this).prop('checked')){
		function specialPrice(){
			let input=prompt('Введите специальную цену (только цифрами)');
			if(input!=null){
				if(input.replace(/\s/g,'').match(/^\d+$/)){
					$('#specialPrice+label span').text(input.replace(/\s/g,'').replace(/^[0]+([0-9])/g,'$1'));
					$('#price span').addClass('del');
					$('#points').slideUp(200);
					if($('#oldPrice').prop('checked')){
						$('#oldPrice').trigger('click');
					}
				}else{
					specialPrice();
				}
			}else{
				$('#specialPrice').prop('checked',false);
			}
		}
		specialPrice();
	}else{
		$('#specialPrice+label span').text('');
		$('#price span').removeClass('del');
		$('#points').slideDown(200);
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
		var bold=boldx='*';
		var scratch=scratchx='~';
	}
	if($(this).attr('id')=='tg'){
		var bold=boldx='**';
		var scratch=scratchx='~~';
	}
	if($(this).attr('id')=='max'){
		var [bold,boldx,scratch,scratchx]=['<b>','</b>','<s>','</s>'];
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
	var points='';
	if($('#points').is(':visible')){
		points='\n'+$('#points').text();
	}
	var scratchPrice='';
	if($('#price span.del').text()!=''){
		scratchPrice=scratch+$('#price span.del').text()+scratchx+' ';
	}
	if($('#oldPrice').prop('checked')){
		scratchPrice=scratch+$('#oldPrice+label s').text()+scratchx+' ';
	}
	var price=$('#price span:not(.del)').text();
	if($('#specialPrice').prop('checked')){
		price=$('#specialPrice+label span').text();
	}
	var remain='';
	if($('#remain').prop('checked')){
		remain=bold+'Всего '+declension($('#remain+label span').text(),['штука','штуки','штук'])+boldx+'\n\n';
	}
	var addLink='';
	if($('#link').prop('checked')){
		addLink='\n\nПодробнее о продукте: '+link;
	}
	$('#copy_descr').html($('#descr').html().replace(/\&nbsp\;|\t/g,' '));
	var clipboard=slogan
		+bold
			+$('#header').text().replace(/\n/g,' ').replace(/\s+/g,' ').trim()
			+' за '
			+scratchPrice
			+declension(price,['рубль','рубля','рублей'])
		+boldx
		+points
		+'\n\n'
		+remain
		+document.querySelector('#copy_descr').innerText.replace(/\ +/g,' ').replace(/^\ |\ $/gm,'').replace(/\n{2,}/g,'\n\n').trim()
		+addLink;
	try{
		if($(this).attr('id')=='wa'||$(this).attr('id')=='tg'){
			navigator.clipboard.writeText(clipboard);
		}
		if($(this).attr('id')=='max'){
			navigator.clipboard.write([
				new ClipboardItem({
					'text/html':new Blob([clipboard.replaceAll('\n','<br>')],
					{type:'text/html'})
				})
			]);
		}
		$('#copied').fadeIn(100).fadeOut(1000);
	}catch{}
});

$(document).on('click','#img img',function(){
	var canvas=document.querySelector('#canvas');
	var context=canvas.getContext('2d');
	var img=document.querySelector('#pic');
	canvas.width=img.width;
	canvas.height=img.height;
	context.drawImage(img,0,0,img.width,img.height);
	try{
		canvas.toBlob(blob=>navigator.clipboard.write([new ClipboardItem({'image/png':blob})]));
		$('#copied').fadeIn(100).fadeOut(1000);
	}catch{}
});

// Тёмная тема
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

// Запомнить состояние отметки "Ссылка на продукт"
$('#link').click(function(){
	if($(this).prop('checked')){
		localStorage['link']=1;
	}else{
		localStorage['link']=0;
	}
});

// Добавить в черновики заголовок
$('#draft_header').click(function(){
	if($('#header').text().trim()!=''&&$('#descr').text().trim()!=''){
		try{
			localStorage[`h${$(this).attr('productID')}`]=$('#header').html();
			$('#draft_saved').fadeIn(100).fadeOut(1000);
		}catch{}
	}
});
// Добавить в черновики описание
$('#draft_descr').click(function(){
	if($('#header').text().trim()!=''&&$('#descr').text().trim()!=''){
		try{
			localStorage[`d${$(this).attr('productID')}`]=$('#descr').html();
			$('#draft_saved').fadeIn(100).fadeOut(1000);
		}catch{}
	}
});
