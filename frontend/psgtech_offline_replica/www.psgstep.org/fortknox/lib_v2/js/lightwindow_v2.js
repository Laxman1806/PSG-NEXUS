// JavaScript Document


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///		Object	Name		:	DESIGN_PLATE_WS_SCREEN
	///
	///		Arguments			:	1. sub_content 		-- div Id
	///								2. dim_color 		-- while window get dim we choose color in here
	///								3. opacity_val		-- opacity value
	///
	///
	///									
	///	
	///		Attributes			:	
	///	
	///		Methods				:	1. DESIGN_PLATE_WS_SCREEN.prototype.create_main_content	-- create main DIV for ligh window.
	///								2. DESIGN_PLATE_WS_SCREEN.prototype.create_visible		-- DIV visible in this method
	///								3. DESIGN_PLATE_WS_SCREEN.prototype.create_invisible	-- DIV invisible in this method
	///								
	///
	///		Notes				:
    ///
	///
	///		Constraints			:	DESIGN_PLATE_WS_SCREEN
	///
	///
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
	function light_window(param){						// Start the function.		
		
		
		this.sub_content			= param.element_id;
															// gallery_div
		this.background_color		= param.bg_color;	
		
		this.layer_index			= (param.layer_index)?param.layer_index:1000;
		
		this.opacity				= param.opacity;
		
		this.curr_index				= 0;
		
		this.dec_curr_index			= 0;
		
		this.screen_width			= 0;
		
		this.screen_height			= 0;
		
		// Calculate size
		
		this.calculate_screen_size= function(){
	
				var viewportwidth;
				var viewportheight;
		 
				 // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
				 
				 if (typeof window.innerWidth != 'undefined'){
					 
					 viewportwidth  = window.innerWidth;
					 
					 viewportheight = window.innerHeight;
				 }
			 
				// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
				
				 else if (typeof document.documentElement != 'undefined'
					 && typeof document.documentElement.clientWidth !=
					 'undefined' && document.documentElement.clientWidth != 0){
				 
					   viewportwidth  = document.documentElement.clientWidth;
					   
					   viewportheight = document.documentElement.clientHeight;
				 
				 }else{ 
			 
				 		// older versions of IE				 
				
						viewportwidth  = document.getElementsByTagName('body')[0].clientWidth;
						
						viewportheight = document.getElementsByTagName('body')[0].clientHeight;						
				 }
			
				this.screen_width	= viewportwidth;
				
				this.screen_height	= viewportheight;					   
				
		}  // end of calculate 
		
		
			   // calculate screen size		
			
			   this.calculate_screen_size(); 
			   
			   var temp_element						 = document.createElement('div');
			   
			   temp_element.style.cssText			 = 'width:0px;height:0px;left:0px;top:0px;position:absolute;';
			   
			   temp_element.style.backgroundColor	 = this.background_color;
			   			   
			   this.background_div					 = temp_element;
			   
			   document.body.appendChild(temp_element);
			   
			   this.create_main_content();

		} // End of Constructor

	
	// Create Main Content
	
	light_window.prototype.create_main_content = function() {				// this function for return height	
			
		// Set Window
		
			document.getElementById(this.sub_content).style.visibility='visible';	
			
			
		
		// Set Width and Height
		
			if(document.all) {
				
				this.sub_content.height = document.body.scrollHeight;
				this.sub_content.width  = document.body.scrollWidth;				
				
			}else{
				
				this.sub_content.height = document.body.scrollHeight;
				this.sub_content.width  = document.body.scrollWidth;		
			}
				
		// Set Opacity
		
			if(document.all) {		
			
				this.background_div.style.filter ='Alpha(opacity='+this.opacity+')';
				
			} else {		
			
				this.background_div.style.opacity =Number(this.opacity)/100;
			}		
		
	} // end of main content div


	// show window
	
	light_window.prototype.show = function() {	
				
		var l_v = new Array();
		
			this.background_div.style.display						= 'block';
			
			this.background_div.style.visibility					= 'visible';
			
			document.getElementById(this.sub_content).style.display	= 'block'; 
			
			document.getElementById(this.sub_content).style.cssText = 'position:absolute;';

			
		
			document.getElementById(this.sub_content).style.top		= '100px';		
			
			document.getElementById(this.sub_content).style.width   = "95%";
	
		// temp		
		
			l_v['temp_height']					= (document.body.scrollHeight>this.screen_height)?document.body.scrollHeight:this.screen_height;
	
			l_v['temp_width']					= (document.body.scrollHeight>0)?document.body.scrollWidth:(this.screen_width-20);

			this.background_div.style.width		= l_v['temp_width']+'px'
			
			this.background_div.style.height	= l_v['temp_height']+'px'
			

			this.background_div.style.zIndex	= this.layer_index;
		
			l_v['screen_height']				= Number(this.screen_height); // screen.availHeight;
		
			l_v['screen_width']					= Number(this.screen_width);
				
			l_v['inner_window_top']				= Math.floor((l_v['screen_height']-Number(document.getElementById(this.sub_content).clientHeight)) / 2);
		
			l_v['inner_window_left']			= Math.floor((l_v['screen_width']-Number(document.getElementById(this.sub_content).clientWidth)) /2 ); 
				
			document.getElementById(this.sub_content).style.left 		= l_v['inner_window_left']+'px';
		
			document.getElementById(this.sub_content).style.top 		= l_v['inner_window_top']+'px'; 
		
			document.getElementById(this.sub_content).style.visibility	= 'visible';	
		
			this.background_div.style.zIndex							= this.layer_index;
			
			document.getElementById(this.sub_content).style.zIndex		= (this.background_div.style.zIndex+1);	
		
			
	} // show
	
	
	// Crear
		
	light_window.prototype.hide = function() {	

		this.background_div.style.display							= 'none';		
		
		this.background_div.style.visibility						= 'hidden';
		
		document.getElementById(this.sub_content).style.visibility	= 'hidden';
		
	} // end of function

  	
	