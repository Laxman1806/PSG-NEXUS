				
		// height
		
		function set_normalize_height(){
				
		         var left_menu_height = document.getElementById('left_menu').scrollHeight;
			 
			 var content_height = document.getElementById('content').scrollHeight;
			 
			 var bar_area_height =document.getElementById('bar_area').scrollHeight;
			 
			 //alert(bar_area);
			 
			// alert(bar_area);
		         
			 var scroll_max = Math.max(left_menu_height,content_height,bar_area_height);
			
			 
			 scroll_max+=100;
			 
			 scroll_max_1=scroll_max-75;
			 
			 //alert('--'+page_content_height+'---'+document.getElementById('layout').clientHeight);
			 
			 document.getElementById('content').style.height = scroll_max_1+'px';
			 
			 document.getElementById('left_menu').style.height = scroll_max+'px';
			 
			 document.getElementById('bar_area').style.height = scroll_max+'px';	
				
		} // end

		
		function set_normalize_height_image($height){
			 
		//alert($height);
			 var image_height = $height;
			 
		         var left_menu_height = document.getElementById('left_menu').clientHeight;
			 
			 var content_height = document.getElementById('content').clientHeight;
			 
			 //alert(content_height);
			 var bar_area_height =document.getElementById('bar_area').clientHeight;
			
			 content_height = content_height+image_height;
			
		         var scroll_max = Math.max(left_menu_height,content_height,bar_area_height);
			 //alert($height);
			 //alert("leftmenu "+left_menu_height+"content hei "+content_height+"bar_area "+bar_area_height );
			 
		         scroll_max-=50;
			 
			 scroll_max_1=scroll_max-45;
			 
			 scroll_max_plus=scroll_max+30;
			 
			 //alert('--'+page_content_height+'---'+document.getElementById('layout').clientHeight);
			 
			 document.getElementById('content').style.height = scroll_max_1+'px';
			 
			 document.getElementById('left_menu').style.height = scroll_max_plus+'px';
			 
			 document.getElementById('bar_area').style.height = scroll_max_plus+'px';	
				
		} // end                
                
		
		// check for feed content

		function check_content_is_loaded(feed_id,delay){
			
			if(document.getElementById(feed_id).innerHTML.length!=0){						
			
				$('#'+feed_id+' ul').cycle({
		
						 // fx: 'scrollUp' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
						fx	    : 'fade',
						delay	    : -(delay),
						pause       : 1
				});
			
				clearInterval(V[feed_id]);
			} // length check
		
						
		} // end

		// set inner frame
				
		function set_inner_frame(title,url){	
		
			
				document.getElementById('inner_frame').src				= '';
				
				document.getElementById('inner_frame_title').innerHTML	= '';
				
				document.getElementById('inner_frame').src				= url;
				
				document.getElementById('inner_frame_title').innerHTML	= title;
				
				//alert(url);
								
				inner_frame.show();
		
		} // end
		
		// Content Dispplay
												 
		function content_display(id,sub_id,child_id,code,code_id){
				
                                // Prefill
				
                               V.sub_menu_element.style.cssText='';
                               
                               V.sub_menu_id         		  	=sub_id;
                               
                               if(V.sub_menu_id.length>0){
                           
                                  V.sub_menu_element 	  	= 	ELEMENT('sub_menu_'+V.sub_menu_id);
                                   
                                  V.sub_menu_element.style.cssText = 	'color:'+V.sub_menu_focus_color+'!important;';
                               }						
                               
                                
                                // Content
                                
				var height_image=document.getElementById('content').innerHTML;
				
				height_image ='<br /><br /><br /><br /><br /><div align="center" style="width:100%; height:100%; margin-left:auto; margin-right:auto;"><img src="images/ajax-loader.gif" /></div>';
				
				var aj  = new ajaxrequest('page_content');
					
				var query ='&id='+id+'&sub_id='+sub_id+'&child_id='+child_id+'&code='+code+'&code_id='+code_id; 
									
				aj.get_front_request('get_child_menu.php',query);	
					
				aj.send(sub_menu_response);
							
		} // ajax
						
		// sub menu fill
				
                var sub_menu = '';
		  
		function sub_menu_response(response){
				
		        sub_menu_response_action(sub_menu,response);
			
			sub_menu=response;	
				
			
					
		} // end
		
		
		function sub_menu_response_action(sub_menu,response){
				
			if(response){ 							
					document.getElementById('content').innerHTML = response;
					
					//set_normalize_height();
						
				}else {
					document.getElementById('content').innerHTML = '';
					
					//set_normalize_height();
						
				}
		      if (sub_menu!=response) {
				
                                set_normalize_height();
		      }
		      
		}